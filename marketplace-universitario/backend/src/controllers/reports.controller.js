const prisma = require('../lib/prisma');

// GET /api/reports/admin — [ADMIN] global metrics by month (RF-21)
async function adminReport(req, res, next) {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Fast parallel queries - limited data
    const [
      totalUsers,
      totalActiveProducts,
      totalOrders,
      totalEntrepreneurs,
      totalBuyers,
      ordersByStatus,
      revenueData,
    ] = await Promise.all([
      prisma.user.count({ where: { status: { not: 'DELETED' } } }),
      prisma.product.count({ where: { status: 'ACTIVE', seller: { status: 'ACTIVE' } } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'EMPRENDEDOR', status: { not: 'DELETED' } } }),
      prisma.user.count({ where: { role: 'COMPRADOR', status: { not: 'DELETED' } } }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Get revenue data - limit to 5000 records
      prisma.order.findMany({
        where: {
          createdAt: { gte: twelveMonthsAgo },
          status: 'DELIVERED',
        },
        select: {
          createdAt: true,
          product: { select: { price: true } },
        },
        take: 5000,
      }),
    ]);

    // Group revenue by month
    const revenueByMonth = {};
    revenueData.forEach((order) => {
      const month = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[month] = (revenueByMonth[month] || 0) + parseFloat(order.product.price || 0);
    });

    const revenueArray = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Get top entrepreneurs - limited query
    const topEntrepreneurs = await prisma.user.findMany({
      where: { role: 'EMPRENDEDOR', status: { not: 'DELETED' } },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            businessName: true,
            photoUrl: true,
            reviews: { select: { rating: true }, take: 50 },
          },
        },
        ordersAsSeller: {
          select: { product: { select: { price: true } } },
          take: 50,
        },
      },
      orderBy: { ordersAsSeller: { _count: 'desc' } },
      take: 15,
    });

    // Calculate metrics for top entrepreneurs
    const topEntrepreneursList = topEntrepreneurs
      .map((e) => {
        const totalOrders = e.ordersAsSeller.length;
        const totalRevenue = e.ordersAsSeller.reduce(
          (sum, order) => sum + parseFloat(order.product.price || 0),
          0
        );
        const avgRating =
          e.profile?.reviews && e.profile.reviews.length > 0
            ? parseFloat(
                (e.profile.reviews.reduce((sum, r) => sum + r.rating, 0) / e.profile.reviews.length).toFixed(1)
              )
            : 0;

        return {
          id: e.id,
          email: e.email,
          role: e.role,
          profile: {
            businessName: e.profile?.businessName || '',
            photoUrl: e.profile?.photoUrl || null,
          },
          totalOrders,
          totalRevenue,
          avgRating,
        };
      })
      .filter((e) => e.totalOrders > 0)
      .sort((a, b) => b.totalOrders - a.totalOrders || b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalEntrepreneurs,
        totalBuyers,
        totalActiveProducts,
        totalOrders,
        revenueByMonth: revenueArray,
        ordersByStatus: ordersByStatus.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        topEntrepreneurs: topEntrepreneursList,
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
