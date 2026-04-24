const prisma = require('../lib/prisma');
const { uploadProductImage, deleteFile, BUCKET_PRODUCTS } = require('../services/storage.service');

// GET /api/products — public paginated catalog with filters
async function getAll(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip  = (page - 1) * limit;

    const { keyword, search, categoryId, category, minPrice, maxPrice, sellerId, orderBy } = req.query;

    // 'search' (US-11) is an alias for 'keyword' (US-07 backward compat)
    const searchTerm     = search || keyword;
    const categoryFilter = category || categoryId;

    // CA-03: validate price range
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      return res.status(400).json({
        success: false,
        error: 'El precio mínimo no puede ser mayor al máximo',
      });
    }

    const where = {
      // When filtered by seller (My Products), show all non-deleted; otherwise only ACTIVE for public catalog
      ...(sellerId ? { sellerId, status: { not: 'DELETED' } } : { status: 'ACTIVE' }),
      ...(categoryFilter && { categoryId: categoryFilter }),
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
      ...((minPrice || maxPrice)
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          }
        : {}),
    };

    // Sort order (orderBy query param)
    let sortOrder;
    if (orderBy === 'price_asc')  sortOrder = { price: 'asc' };
    else if (orderBy === 'price_desc') sortOrder = { price: 'desc' };
    else sortOrder = { createdAt: 'desc' };

    const queryStart = Date.now();
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortOrder,
        include: {
          seller: { select: { id: true, email: true, profile: { select: { businessName: true, photoUrl: true } } } },
          category: { select: { id: true, name: true } },
          _count: { select: { orders: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getAll] Products query: ${Date.now() - queryStart}ms`);
    }

    const totalPages = Math.ceil(total / limit);
    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        search: searchTerm || '',
        category: categoryFilter || '',
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        orderBy: orderBy || 'recent',
      },
    });
  /* istanbul ignore next */
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id — product detail
async function getById(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            profile: { select: { businessName: true, photoUrl: true, description: true } },
          },
        },
        category: true,
      },
    });

    if (!product || product.status === 'DELETED') {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    res.json({ success: true, data: product });
  /* istanbul ignore next */
  } catch (err) {
    next(err);
  }
}

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    console.log('[getCategories] fetched:', categories.length);
    res.json({ success: true, data: categories });
  /* istanbul ignore next */
  } catch (err) {
    next(err);
  }
}

// POST /api/products — [EMPRENDEDOR] create product
async function create(req, res, next) {
  try {
    const sellerId = req.user.id;
    const { name, description, price, categoryId } = req.body;

    // Verify seller has a profile
    const profile = await prisma.profile.findUnique({ where: { userId: sellerId } });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Debes completar tu perfil de emprendimiento antes de publicar productos.',
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
    }

    // Upload images to Supabase
    let imageUrls = [];
    /* istanbul ignore next */
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map((f) => uploadProductImage(f.buffer, f.originalname, f.mimetype))
      );
    }

    const product = await prisma.product.create({
      data: {
        sellerId,
        categoryId,
        name,
        description: description || '',
        price,
        images: imageUrls,
      },
      include: { category: true, seller: { select: { id: true, email: true } } },
    });

    res.status(201).json({ success: true, message: 'Producto publicado exitosamente.', data: product });
  /* istanbul ignore next */
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id — [EMPRENDEDOR] update own product
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || product.status === 'DELETED') {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    if (product.sellerId !== sellerId) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para editar este producto.' });
    }

    const { name, description, price, categoryId, status } = req.body;

    // Handle image updates
    // existingImages (JSON array of URLs to keep) lets the frontend remove old images
    let imageUrls = product.images;
    if (req.body.existingImages !== undefined) {
      try {
        const kept = JSON.parse(req.body.existingImages);
        imageUrls = Array.isArray(kept) ? kept : [];
      } catch {
        imageUrls = product.images;
      }
    }
    /* istanbul ignore next */
    if (req.files && req.files.length > 0) {
      const newUrls = await Promise.all(
        req.files.map((f) => uploadProductImage(f.buffer, f.originalname, f.mimetype))
      );
      imageUrls = [...imageUrls, ...newUrls].slice(0, 5); // Max 5 images
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || '' }),
        ...(price !== undefined && { price }),
        ...(categoryId && { categoryId }),
        ...(status && { status }),
        images: imageUrls,
      },
      include: { category: true },
    });

    res.json({ success: true, message: 'Producto actualizado.', data: updated });
  /* istanbul ignore next */
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id — [EMPRENDEDOR/ADMIN] soft-delete own product
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || product.status === 'DELETED') {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }

    if (role !== 'ADMIN' && product.sellerId !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta publicación.' });
    }

    // CA-03: Block deletion if product has pending or accepted orders
    const activeOrders = await prisma.order.count({
      where: { productId: id, status: { in: ['PENDING', 'ACCEPTED'] } },
    });
    if (activeOrders > 0) {
      return res.status(409).json({
        success: false,
        message: 'No puedes eliminar una publicación con pedidos activos. Resuelve los pedidos primero',
        code: 'HAS_ACTIVE_ORDERS',
      });
    }

    // Soft delete — preserves referential integrity with orders and reviews
    await prisma.product.update({ where: { id }, data: { status: 'DELETED' } });

    // Clean up images from Supabase Storage (non-blocking — don't fail the request)
    /* istanbul ignore next */
    for (const url of product.images) {
      try {
        await deleteFile(url, BUCKET_PRODUCTS);
      } catch (imgErr) {
        console.error('[remove] Failed to delete image from storage:', imgErr.message);
      }
    }

    res.json({ success: true, message: 'Publicación eliminada exitosamente' });
  /* istanbul ignore next */
  } catch (err) {
    next(err);
  }
}

// PATCH /api/products/:id/status — [ADMIN] change product status (disable/enable only, not delete)
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || product.status === 'DELETED') {
      return res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    }

    // Only ACTIVE and INACTIVE are allowed for status updates (not DELETED)
    // Validator (updateProductStatusValidation) already rejects other values — this is a defence-in-depth guard
    /* istanbul ignore next */
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado inválido. Solo se puede cambiar a ACTIVO o INACTIVO.' });
    }

    // Same status — no change needed
    if (product.status === status) {
      return res.json({ success: true, message: `La publicación ya está ${status === 'ACTIVE' ? 'activa' : 'inactiva'}.`, data: product });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
      include: {
        seller: { select: { email: true, profile: { select: { businessName: true } } } },
        category: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      message: `Publicación ${status === 'ACTIVE' ? 'activada' : 'desactivada'} exitosamente.`,
      data: updated,
    });
  /* istanbul ignore next */
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, getCategories, create, update, remove, updateStatus };
