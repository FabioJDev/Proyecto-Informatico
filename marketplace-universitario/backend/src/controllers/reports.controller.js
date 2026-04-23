const prisma = require('../lib/prisma');

// GET /api/reports/admin — [ADMIN] global metrics by month (RF-21)
async function adminReport(req, res, next) {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Parallel queries
    const [
      totalUsers,
      totalOrders,
      activeProducts,
      ordersThisMonth,
      newUsersThisMonth,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({
        where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, price: true } },
          buyer: { select: { email: true } },
          seller: { select: { profile: { select: { businessName: true } } } },
        },
      }),
    ]);

    // Monthly orders over the last 12 months using raw query
    // CAST to INTEGER to avoid BigInt serialization issues in JSON.stringify
    const monthlyOrders = await prisma.$queryRaw`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        CAST(COUNT(*) AS INTEGER) as total,
        CAST(SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS INTEGER) as delivered
      FROM orders
      WHERE created_at >= ${twelveMonthsAgo}
      GROUP BY month
      ORDER BY month ASC
    `;

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalProducts: activeProducts,
          totalOrders,
          ordersThisMonth,
          newUsersThisMonth,
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        monthlyOrders,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/entrepreneur — [EMPRENDEDOR] personal summary (RF-22)
async function entrepreneurReport(req, res, next) {
  try {
    const sellerId = req.user.id;

    const [
      totalOrders,
      ordersByStatus,
      totalProducts,
      profile,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { sellerId } }),
      prisma.order.groupBy({
        by: ['status'],
        where: { sellerId },
        _count: { status: true },
      }),
      prisma.product.count({ where: { sellerId, status: 'ACTIVE' } }),
      prisma.profile.findUnique({
        where: { userId: sellerId },
        include: {
          reviews: { select: { rating: true } },
        },
      }),
      prisma.order.findMany({
        where: { sellerId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, price: true } },
          buyer: { select: { email: true } },
        },
      }),
    ]);

    // Calculate average rating
    const avgRating =
      profile?.reviews.length > 0
        ? parseFloat(
            (profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length).toFixed(1)
          )
        : null;

    const statusSummary = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        profile: profile
          ? { businessName: profile.businessName, photoUrl: profile.photoUrl }
          : null,
        summary: {
          totalOrders,
          totalProducts,
          pending: statusSummary.PENDING || 0,
          accepted: statusSummary.ACCEPTED || 0,
          delivered: statusSummary.DELIVERED || 0,
          rejected: statusSummary.REJECTED || 0,
          cancelled: statusSummary.CANCELLED || 0,
          averageRating: avgRating,
          totalReviews: profile?.reviews.length || 0,
        },
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { adminReport, entrepreneurReport };
