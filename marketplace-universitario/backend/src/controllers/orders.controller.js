const prisma = require('../lib/prisma');
const {
  sendOrderConfirmation,
  sendNewOrderToSeller,
  sendOrderStatusChange,
} = require('../services/email.service');

// POST /api/orders — [COMPRADOR] create order
async function create(req, res, next) {
  try {
    const buyerId = req.user.id;
    const { productId, quantity, message } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: { select: { id: true, email: true } } },
    });

    if (!product || product.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Producto no disponible.' });
    }

    if (product.sellerId === buyerId) {
      return res.status(400).json({ success: false, message: 'No puedes comprar tus propios productos.' });
    }

    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId: product.sellerId,
        productId,
        quantity,
        message,
        status: 'PENDING',
      },
      include: {
        product: { select: { name: true, price: true } },
        buyer: { select: { email: true } },
        seller: { select: { email: true, profile: { select: { businessName: true } } } },
      },
    });

    // Fire emails asynchronously (RF-15 < 5s)
    const orderDate = new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const orderDetails = {
      orderId: order.id,
      productName: order.product.name,
      quantity: order.quantity,
      sellerName: order.seller.profile?.businessName || order.seller.email,
      buyerEmail: order.buyer.email,
      buyerName: order.buyer.email.split('@')[0],
      message: order.message,
      orderDate,
    };

    void Promise.all([
      sendOrderConfirmation(order.buyer.email, orderDetails).catch((e) =>
        console.error('[email] sendOrderConfirmation failed:', e.message)
      ),
      sendNewOrderToSeller(order.seller.email, orderDetails).catch((e) =>
        console.error('[email] sendNewOrderToSeller failed:', e.message)
      ),
    ]);

    res.status(201).json({ success: true, message: 'Pedido creado exitosamente.', data: order });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders — list orders for authenticated user
async function getAll(req, res, next) {
  try {
    const { id: userId, role } = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // ADMIN sees all; buyer sees own buys; seller sees own sells
    let where = {};
    if (role === 'COMPRADOR') {
      where = { buyerId: userId, ...(status && { status }) };
    } else if (role === 'EMPRENDEDOR') {
      where = { sellerId: userId, ...(status && { status }) };
    } else if (role === 'ADMIN') {
      where = status ? { status } : {};
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, price: true, images: true } },
          buyer: { select: { id: true, email: true } },
          seller: { select: { id: true, email: true, profile: { select: { businessName: true } } } },
          review: { select: { id: true, rating: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// Helper: update order status and send notification email
async function updateOrderStatus(req, res, next, newStatus, allowedCurrentStatuses) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        buyer: { select: { email: true } },
        seller: { select: { email: true, profile: { select: { businessName: true } } } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }

    // Ownership check
    if (newStatus === 'CANCELLED' && order.buyerId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo el comprador puede cancelar el pedido.' });
    }
    if (['ACCEPTED', 'REJECTED', 'DELIVERED'].includes(newStatus) && order.sellerId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo el vendedor puede realizar esta acción.' });
    }

    if (!allowedCurrentStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `El pedido en estado "${order.status}" no puede ser ${newStatus.toLowerCase()}.`,
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });

    // Send status change email to buyer (RF-17)
    if (['ACCEPTED', 'REJECTED', 'DELIVERED'].includes(newStatus)) {
      const orderDetails = {
        orderId: order.id,
        productName: order.product.name,
        sellerName: order.seller.profile?.businessName || order.seller.email,
      };
      sendOrderStatusChange(order.buyer.email, newStatus, orderDetails).catch((e) =>
        console.error('[email] sendOrderStatusChange failed:', e.message)
      );
    }

    const messages = {
      ACCEPTED: 'Pedido aceptado.',
      REJECTED: 'Pedido rechazado.',
      DELIVERED: 'Pedido marcado como entregado.',
      CANCELLED: 'Pedido cancelado.',
    };

    res.json({ success: true, message: messages[newStatus], data: updated });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/orders/:id/accept — [EMPRENDEDOR]
async function accept(req, res, next) {
  return updateOrderStatus(req, res, next, 'ACCEPTED', ['PENDING']);
}

// PATCH /api/orders/:id/reject — [EMPRENDEDOR]
async function reject(req, res, next) {
  return updateOrderStatus(req, res, next, 'REJECTED', ['PENDING']);
}

// PATCH /api/orders/:id/deliver — [EMPRENDEDOR]
async function deliver(req, res, next) {
  return updateOrderStatus(req, res, next, 'DELIVERED', ['ACCEPTED']);
}

// PATCH /api/orders/:id/cancel — [COMPRADOR]
async function cancel(req, res, next) {
  return updateOrderStatus(req, res, next, 'CANCELLED', ['PENDING']);
}

// POST /api/orders/test-email — [DEV ONLY] send a test confirmation email
async function sendTestEmail(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not available in production.' });
  }
  try {
    const to = req.body.email || req.user.email;
    const orderDate = new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    await sendOrderConfirmation(to, {
      orderId: 'TEST-' + Date.now(),
      productName: 'Producto de prueba',
      quantity: 2,
      sellerName: 'Emprendedor UAO',
      buyerEmail: to,
      buyerName: to.split('@')[0],
      message: 'Este es un mensaje de prueba.',
      orderDate,
    });
    res.json({ success: true, message: `Email de prueba enviado a ${to}` });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, accept, reject, deliver, cancel, sendTestEmail };
