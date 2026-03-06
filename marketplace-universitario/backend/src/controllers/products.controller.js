const { PrismaClient } = require('@prisma/client');
const { uploadProductImage, deleteFile, BUCKET_PRODUCTS } = require('../services/storage.service');

const prisma = new PrismaClient();

// GET /api/products — public paginated catalog with filters
async function getAll(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const { keyword, categoryId, minPrice, maxPrice } = req.query;

    const where = {
      status: 'ACTIVE',
      ...(categoryId && { categoryId }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { id: true, email: true, profile: { select: { businessName: true, photoUrl: true } } } },
          category: { select: { id: true, name: true } },
          _count: { select: { orders: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
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
  } catch (err) {
    next(err);
  }
}

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: categories });
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
        description,
        price,
        images: imageUrls,
      },
      include: { category: true, seller: { select: { id: true, email: true } } },
    });

    res.status(201).json({ success: true, message: 'Producto publicado exitosamente.', data: product });
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

    // Handle new image uploads
    let imageUrls = product.images;
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
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(categoryId && { categoryId }),
        ...(status && { status }),
        images: imageUrls,
      },
      include: { category: true },
    });

    res.json({ success: true, message: 'Producto actualizado.', data: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id — [EMPRENDEDOR/ADMIN] deactivate product
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || product.status === 'DELETED') {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    if (role !== 'ADMIN' && product.sellerId !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este producto.' });
    }

    await prisma.product.update({ where: { id }, data: { status: 'DELETED' } });

    res.json({ success: true, message: 'Producto eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, getCategories, create, update, remove };
