process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-minimum-32-chars';
process.env.JWT_EXPIRES_IN = '8h';
process.env.BCRYPT_COST_FACTOR = '4';
process.env.FRONTEND_URL = 'http://localhost:5173';

const request = require('supertest');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');

// Mock email service to avoid real SMTP calls in tests
jest.mock('../src/services/email.service', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue(true),
  sendNewOrderToSeller: jest.fn().mockResolvedValue(true),
  sendOrderStatusChange: jest.fn().mockResolvedValue(true),
  sendPasswordReset: jest.fn().mockResolvedValue(true),
}));
const emailService = require('../src/services/email.service');

const prisma = new PrismaClient();

let buyerCookie;
let buyer2Cookie;
let sellerCookie;
let adminCookie;
let productId;
let inactiveProductId;
let orderId;
let acceptedOrderId;

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────
beforeAll(async () => {
  await prisma.$connect();

  // Cleanup
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({ where: { product: { category: { name: 'Orders Test Cat' } } } });
  await prisma.product.deleteMany({ where: { category: { name: 'Orders Test Cat' } } });
  await prisma.profile.deleteMany({ where: { user: { email: { contains: '@orderstest.edu' } } } });
  await prisma.user.deleteMany({ where: { email: { contains: '@orderstest.edu' } } });

  const hash = await bcrypt.hash('ValidPass1', 4);

  // Create seller
  const seller = await prisma.user.create({
    data: {
      email: 'seller@orderstest.edu',
      passwordHash: hash,
      role: 'EMPRENDEDOR',
      profile: { create: { businessName: 'Test Seller Shop' } },
    },
  });

  // Create buyer
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@orderstest.edu',
      passwordHash: hash,
      role: 'COMPRADOR',
    },
  });

  // Create category & product
  const category = await prisma.category.upsert({
    where: { name: 'Orders Test Cat' },
    update: {},
    create: { name: 'Orders Test Cat' },
  });

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: category.id,
      name: 'Test Product for Orders',
      description: 'A product used for order testing',
      price: 15000,
      images: [],
    },
  });
  productId = product.id;

  // Create INACTIVE product (for 404 test)
  const inactiveProduct = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: category.id,
      name: 'Inactive Product',
      description: 'Not available for orders',
      price: 5000,
      images: [],
      status: 'INACTIVE',
    },
  });
  inactiveProductId = inactiveProduct.id;

  // Pre-create an ACCEPTED order for cancel-after-accept test
  const acceptedOrder = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      sellerId: seller.id,
      productId: product.id,
      quantity: 1,
      status: 'ACCEPTED',
    },
  });
  acceptedOrderId = acceptedOrder.id;

  // Create buyer2 (for cancel-by-non-owner test)
  await prisma.user.create({
    data: { email: 'buyer2@orderstest.edu', passwordHash: hash, role: 'COMPRADOR' },
  });

  // Create admin user
  await prisma.user.create({
    data: { email: 'admin@orderstest.edu', passwordHash: hash, role: 'ADMIN' },
  });

  // Login all users
  const sellerRes = await request(app).post('/api/auth/login').send({
    email: 'seller@orderstest.edu',
    password: 'ValidPass1',
  });
  sellerCookie = sellerRes.headers['set-cookie'];

  const buyerRes = await request(app).post('/api/auth/login').send({
    email: 'buyer@orderstest.edu',
    password: 'ValidPass1',
  });
  buyerCookie = buyerRes.headers['set-cookie'];

  const buyer2Res = await request(app).post('/api/auth/login').send({
    email: 'buyer2@orderstest.edu',
    password: 'ValidPass1',
  });
  buyer2Cookie = buyer2Res.headers['set-cookie'];

  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@orderstest.edu',
    password: 'ValidPass1',
  });
  adminCookie = adminRes.headers['set-cookie'];
});

afterAll(async () => {
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({ where: { product: { category: { name: 'Orders Test Cat' } } } });
  await prisma.product.deleteMany({ where: { category: { name: 'Orders Test Cat' } } });
  await prisma.profile.deleteMany({ where: { user: { email: { contains: '@orderstest.edu' } } } });
  await prisma.user.deleteMany({ where: { email: { contains: '@orderstest.edu' } } });
  await prisma.category.deleteMany({ where: { name: 'Orders Test Cat' } });
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────
// POST /api/orders
// ─────────────────────────────────────────────
describe('POST /api/orders', () => {
  test('✓ [COMPRADOR] crea pedido → estado PENDING', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId, quantity: 2, message: 'Please wrap nicely' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.quantity).toBe(2);

    orderId = res.body.data.id;
  });

  test('✓ [EMPRENDEDOR] no puede crear pedidos (403)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', sellerCookie)
      .send({ productId, quantity: 1 });

    expect(res.status).toBe(403);
  });

  test('✓ sin autenticación retorna 401', async () => {
    const res = await request(app).post('/api/orders').send({ productId, quantity: 1 });
    expect(res.status).toBe(401);
  });

  test('✓ 404 si el producto no existe', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('✓ 404 si el producto está INACTIVO', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId: inactiveProductId, quantity: 1 });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('✓ crea pedido aunque los emails fallen', async () => {
    emailService.sendOrderConfirmation.mockRejectedValueOnce(new Error('SMTP error'));
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId, quantity: 1 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────
// PATCH /api/orders/:id/accept
// ─────────────────────────────────────────────
describe('PATCH /api/orders/:id/accept', () => {
  test('✓ [EMPRENDEDOR] acepta pedido → estado ACCEPTED', async () => {
    if (!orderId) return;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/accept`)
      .set('Cookie', sellerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  test('✓ [COMPRADOR] no puede aceptar pedidos (403)', async () => {
    if (!orderId) return;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/accept`)
      .set('Cookie', buyerCookie);

    expect(res.status).toBe(403);
  });

  test('✓ 404 para pedido inexistente', async () => {
    const res = await request(app)
      .patch('/api/orders/00000000-0000-0000-0000-000000000000/accept')
      .set('Cookie', sellerCookie);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('✓ acepta pedido aunque el email de notificación falle', async () => {
    const newOrderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId, quantity: 1 });
    const tempOrderId = newOrderRes.body.data?.id;

    emailService.sendOrderStatusChange.mockRejectedValueOnce(new Error('SMTP error'));
    const res = await request(app)
      .patch(`/api/orders/${tempOrderId}/accept`)
      .set('Cookie', sellerCookie);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACCEPTED');
  });
});

// ─────────────────────────────────────────────
// PATCH /api/orders/:id/cancel
// ─────────────────────────────────────────────
describe('PATCH /api/orders/:id/cancel', () => {
  test('✓ [COMPRADOR] cancela pedido PENDING', async () => {
    // Create a fresh PENDING order
    const newOrderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId, quantity: 1 });

    const newOrderId = newOrderRes.body.data?.id;
    expect(newOrderId).toBeDefined();

    const res = await request(app)
      .patch(`/api/orders/${newOrderId}/cancel`)
      .set('Cookie', buyerCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  test('✓ error si pedido ya fue ACCEPTED', async () => {
    // Try to cancel the pre-seeded ACCEPTED order
    const res = await request(app)
      .patch(`/api/orders/${acceptedOrderId}/cancel`)
      .set('Cookie', buyerCookie);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no puede ser/i);
  });

  test('✓ otro comprador no puede cancelar el pedido (403)', async () => {
    const newOrderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId, quantity: 1 });
    const tempOrderId = newOrderRes.body.data?.id;

    const res = await request(app)
      .patch(`/api/orders/${tempOrderId}/cancel`)
      .set('Cookie', buyer2Cookie);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// PATCH /api/orders/:id/reject
// ─────────────────────────────────────────────
describe('PATCH /api/orders/:id/reject', () => {
  test('✓ [EMPRENDEDOR] rechaza pedido PENDING', async () => {
    // Create a fresh order to reject
    const newOrderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId, quantity: 1 });

    const newOrderId = newOrderRes.body.data?.id;
    expect(newOrderId).toBeDefined();

    const res = await request(app)
      .patch(`/api/orders/${newOrderId}/reject`)
      .set('Cookie', sellerCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REJECTED');
  });
});

// ─────────────────────────────────────────────
// GET /api/orders
// ─────────────────────────────────────────────
describe('GET /api/orders', () => {
  test('✓ [COMPRADOR] lista sus pedidos', async () => {
    const res = await request(app).get('/api/orders').set('Cookie', buyerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test('✓ [COMPRADOR] filtra por estado', async () => {
    const res = await request(app).get('/api/orders?status=PENDING').set('Cookie', buyerCookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((o) => expect(o.status).toBe('PENDING'));
  });

  test('✓ [EMPRENDEDOR] lista sus ventas', async () => {
    const res = await request(app).get('/api/orders').set('Cookie', sellerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ [EMPRENDEDOR] filtra por estado', async () => {
    const res = await request(app).get('/api/orders?status=DELIVERED').set('Cookie', sellerCookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ [ADMIN] lista todos los pedidos', async () => {
    const res = await request(app).get('/api/orders').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ [ADMIN] filtra todos los pedidos por estado', async () => {
    const res = await request(app).get('/api/orders?status=PENDING').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ sin autenticación retorna 401', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// PATCH /api/orders/:id/deliver
// ─────────────────────────────────────────────
describe('PATCH /api/orders/:id/deliver', () => {
  test('✓ [EMPRENDEDOR] entrega pedido ACCEPTED', async () => {
    const res = await request(app)
      .patch(`/api/orders/${acceptedOrderId}/deliver`)
      .set('Cookie', sellerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DELIVERED');
  });

  test('✓ [COMPRADOR] no puede entregar pedidos (403)', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/deliver`)
      .set('Cookie', buyerCookie);

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────
// POST /api/orders/test-email
// ─────────────────────────────────────────────
describe('POST /api/orders/test-email', () => {
  test('✓ envía email de prueba con email en el body', async () => {
    const res = await request(app)
      .post('/api/orders/test-email')
      .set('Cookie', buyerCookie)
      .send({ email: 'test@orderstest.edu' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ usa el email del usuario autenticado si no se provee email', async () => {
    const res = await request(app)
      .post('/api/orders/test-email')
      .set('Cookie', buyerCookie)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
