const prisma = require('../lib/prisma');
const { uploadProfileImage, deleteFile, BUCKET_PROFILES } = require('../services/storage.service');

// GET /api/users — [ADMIN] list all users with pagination
async function getAll(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // optional filter

    const where = status ? { status } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          profile: { select: { businessName: true } },
          _count: { select: { products: true, ordersAsBuyer: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id/status — [ADMIN] suspend or delete user
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Prevent self-suspension of admin
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'No puedes modificar tu propio estado.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, role: true, status: true },
    });

    res.json({ success: true, message: `Usuario ${status.toLowerCase()} correctamente.`, user: updated });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id/profile — public profile of an entrepreneur
async function getProfile(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        products: {
          where: { status: 'ACTIVE' },
          take: 6,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/profile — [EMPRENDEDOR] create or update own profile
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { businessName, description, contactInfo } = req.body;

    let photoUrl;

    // Handle optional photo upload
    if (req.file) {
      const existing = await prisma.profile.findUnique({ where: { userId } });
      if (existing?.photoUrl) {
        await deleteFile(existing.photoUrl, BUCKET_PROFILES).catch(() => {});
      }
      photoUrl = await uploadProfileImage(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const data = {
      ...(businessName && { businessName }),
      ...(description !== undefined && { description }),
      ...(contactInfo !== undefined && { contactInfo }),
      ...(photoUrl && { photoUrl }),
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    res.json({ success: true, message: 'Perfil actualizado.', profile });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/profile/me — [EMPRENDEDOR] get own profile (for edit form pre-fill)
async function getMyProfile(req, res, next) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado.' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, updateStatus, getProfile, updateProfile, getMyProfile };
