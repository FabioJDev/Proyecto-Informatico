const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST /api/reviews — [COMPRADOR] review a delivered order
async function create(req, res, next) {
  try {
    const reviewerId = req.user.id;
    const { orderId, rating, comment } = req.body;

    // Verify the order exists, belongs to the reviewer, and is DELIVERED
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: { select: { profile: { select: { id: true } } } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }

    if (order.buyerId !== reviewerId) {
      return res.status(403).json({ success: false, message: 'Solo el comprador del pedido puede dejar una reseña.' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Solo puedes reseñar pedidos entregados.' });
    }

    // Check no duplicate review
    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya dejaste una reseña para este pedido.' });
    }

    const profileId = order.seller.profile?.id;
    if (!profileId) {
      return res.status(400).json({ success: false, message: 'El vendedor no tiene perfil de emprendimiento.' });
    }

    const review = await prisma.review.create({
      data: { orderId, profileId, reviewerId, rating, comment },
      include: {
        reviewer: { select: { email: true } },
        profile: { select: { businessName: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Reseña publicada.', data: review });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/profile/:profileId — reviews + average for an entrepreneur
async function getByProfile(req, res, next) {
  try {
    const { profileId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado.' });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { profileId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: { select: { email: true } },
          order: { select: { product: { select: { name: true } } } },
        },
      }),
      prisma.review.count({ where: { profileId } }),
    ]);

    // Calculate average rating
    const aggregate = await prisma.review.aggregate({
      where: { profileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    res.json({
      success: true,
      data: {
        profile: { id: profile.id, businessName: profile.businessName },
        averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : null,
        totalReviews: aggregate._count.rating,
        reviews,
      },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getByProfile };
