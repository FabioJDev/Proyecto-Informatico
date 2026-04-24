process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-minimum-32-chars';
process.env.JWT_EXPIRES_IN = '8h';
process.env.BCRYPT_COST_FACTOR = '4';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Mock email service to prevent RESEND_API_KEY requirement in test environment
jest.mock('../src/services/email.service', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordReset: jest.fn().mockResolvedValue(true),
  sendOrderConfirmation: jest.fn().mockResolvedValue(true),
  sendNewOrderToSeller: jest.fn().mockResolvedValue(true),
  sendOrderStatusChange: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');

const prisma = new PrismaClient();

let entrepreneurCookie;
let buyerCookie;
let seller2Cookie;
let adminCookie;
let categoryId;
let productId;

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────
beforeAll(async () => {
  await prisma.$connect();

  // Cleanup
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { contains: '@testproducts.edu' } } });

  // Create category
  const category = await prisma.category.upsert({
    where: { name: 'Test Category' },
    update: {},
    create: { name: 'Test Category' },
  });
  categoryId = category.id;

  // Create entrepreneur user
  const hash = await bcrypt.hash('ValidPass1', 4);
  await prisma.user.create({
    data: {
      email: 'seller@testproducts.edu',
      passwordHash: hash,
      role: 'EMPRENDEDOR',
      profile: {
        create: { businessName: 'Test Shop', description: 'A test shop' },
      },
    },
  });

  // Create buyer user
  await prisma.user.create({
    data: {
      email: 'buyer@testproducts.edu',
      passwordHash: hash,
      role: 'COMPRADOR',
    },
  });

  // Login entrepreneur
  const sellerRes = await request(app).post('/api/auth/login').send({
    email: 'seller@testproducts.edu',
    password: 'ValidPass1',
  });
  entrepreneurCookie = sellerRes.headers['set-cookie'];

  // Login buyer
  const buyerRes = await request(app).post('/api/auth/login').send({
    email: 'buyer@testproducts.edu',
    password: 'ValidPass1',
  });
  buyerCookie = buyerRes.headers['set-cookie'];

  // Create seller2 (EMPRENDEDOR without profile) via API
  const seller2Res = await request(app).post('/api/auth/register').send({
    email: 'seller2@testproducts.edu',
    password: 'ValidPass1',
    confirmPassword: 'ValidPass1',
    role: 'EMPRENDEDOR',
  });
  seller2Cookie = seller2Res.headers['set-cookie'];

  // Create admin user directly via Prisma (role not registrable via API)
  await prisma.user.upsert({
    where: { email: 'admin@testproducts.edu' },
    update: {},
    create: { email: 'admin@testproducts.edu', passwordHash: hash, role: 'ADMIN' },
  });
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@testproducts.edu',
    password: 'ValidPass1',
  });
  adminCookie = adminRes.headers['set-cookie'];
});

afterAll(async () => {
  await prisma.product.deleteMany({ where: { category: { name: 'Test Category' } } });
  await prisma.user.deleteMany({ where: { email: { contains: '@testproducts.edu' } } });
  await prisma.category.deleteMany({ where: { name: 'Test Category' } });
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────
// GET /api/products
// ─────────────────────────────────────────────
describe('GET /api/products', () => {
  test('✓ retorna listado paginado sin autenticación', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.limit).toBe(12);
  });

  test('✓ acepta parámetros de paginación', async () => {
    const res = await request(app).get('/api/products?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.page).toBe(1);
  });

  test('✓ filtra por categoría correctamente', async () => {
    const res = await request(app).get(`/api/products?categoryId=${categoryId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // All returned products should belong to the category
    res.body.data.forEach((p) => {
      expect(p.category.id).toBe(categoryId);
    });
  });

  test('✓ filtra por keyword', async () => {
    const res = await request(app).get('/api/products?keyword=nonexistentkeyword12345');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('✓ rechaza rango de precio inválido (min > max)', async () => {
    const res = await request(app).get('/api/products?minPrice=1000&maxPrice=500');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('✓ acepta rango de precio válido', async () => {
    const res = await request(app).get('/api/products?minPrice=100&maxPrice=50000');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.filters.minPrice).toBe(100);
    expect(res.body.filters.maxPrice).toBe(50000);
  });

  test('✓ ordena por precio ascendente', async () => {
    const res = await request(app).get('/api/products?orderBy=price_asc');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ ordena por precio descendente', async () => {
    const res = await request(app).get('/api/products?orderBy=price_desc');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ filtra por vendedor (sellerId)', async () => {
    const seller = await prisma.user.findFirst({ where: { email: 'seller@testproducts.edu' } });
    const res = await request(app).get(`/api/products?sellerId=${seller.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────
// POST /api/products
// ─────────────────────────────────────────────
describe('POST /api/products', () => {
  test('✓ [EMPRENDEDOR autenticado] crea producto exitosamente', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Test Product')
      .field('description', 'A detailed description of the test product')
      .field('price', '25000')
      .field('categoryId', categoryId);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Product');
    expect(res.body.data.status).toBe('ACTIVE');

    productId = res.body.data.id;
  });

  test('✓ [COMPRADOR] retorna 403', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', buyerCookie)
      .field('name', 'Unauthorized Product')
      .field('description', 'Should not be created')
      .field('price', '5000')
      .field('categoryId', categoryId);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('✓ sin autenticación retorna 401', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'No auth product',
      description: 'Should fail',
      price: 1000,
      categoryId,
    });

    expect(res.status).toBe(401);
  });

  test('✓ validación falla sin nombre', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', entrepreneurCookie)
      .field('description', 'Missing name test')
      .field('price', '5000')
      .field('categoryId', categoryId);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('✓ [EMPRENDEDOR sin perfil] retorna 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', seller2Cookie)
      .field('name', 'No Profile Product')
      .field('description', 'Seller has no profile')
      .field('price', '5000')
      .field('categoryId', categoryId);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/perfil/i);
  });

  test('✓ categoría inexistente retorna 404', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Category Test Product')
      .field('description', 'Testing with invalid category')
      .field('price', '5000')
      .field('categoryId', '00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/categor/i);
  });
});

// ─────────────────────────────────────────────
// GET /api/products/:id
// ─────────────────────────────────────────────
describe('GET /api/products/:id', () => {
  test('✓ retorna detalle de producto existente', async () => {
    if (!productId) return;

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(productId);
  });

  test('✓ 404 para producto inexistente', async () => {
    const res = await request(app).get('/api/products/nonexistentid123');

    expect(res.status).toBe(404);
  });

  test('✓ 404 para producto con estado DELETED', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Temp Product To Delete')
      .field('description', 'Will be soft-deleted for test')
      .field('price', '5000')
      .field('categoryId', categoryId);
    const tmpId = createRes.body.data?.id;

    await prisma.product.update({ where: { id: tmpId }, data: { status: 'DELETED' } });

    const res = await request(app).get(`/api/products/${tmpId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// GET /api/products/categories
// ─────────────────────────────────────────────
describe('GET /api/products/categories', () => {
  test('✓ retorna lista de categorías sin autenticación', async () => {
    const res = await request(app).get('/api/products/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─────────────────────────────────────────────
// PUT /api/products/:id
// ─────────────────────────────────────────────
describe('PUT /api/products/:id', () => {
  test('✓ [EMPRENDEDOR] actualiza su propio producto', async () => {
    if (!productId) return;

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Updated Product Name')
      .field('description', 'Updated description for testing')
      .field('price', '30000');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Product Name');
  });

  test('✓ [COMPRADOR] no puede actualizar (403)', async () => {
    if (!productId) return;

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Cookie', buyerCookie)
      .field('name', 'Should fail');

    expect(res.status).toBe(403);
  });

  test('✓ sin autenticación retorna 401', async () => {
    const res = await request(app).put('/api/products/someid').send({ name: 'fail' });
    expect(res.status).toBe(401);
  });

  test('✓ 404 para producto inexistente', async () => {
    const res = await request(app)
      .put('/api/products/00000000-0000-0000-0000-000000000000')
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Update nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('✓ [otro vendedor] no puede actualizar el producto (403)', async () => {
    if (!productId) return;
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Cookie', seller2Cookie)
      .field('name', 'Unauthorized update');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('✓ maneja existingImages con JSON inválido (usa imágenes actuales)', async () => {
    if (!productId) return;
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Cookie', entrepreneurCookie)
      .field('existingImages', 'invalid-json-string');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ maneja existingImages como JSON no-array (usa arreglo vacío)', async () => {
    if (!productId) return;
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Cookie', entrepreneurCookie)
      .field('existingImages', '"not-an-array"');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────
// DELETE /api/products/:id
// ─────────────────────────────────────────────
describe('DELETE /api/products/:id', () => {
  let deleteProductId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Product To Delete')
      .field('description', 'This product will be deleted in the test')
      .field('price', '5000')
      .field('categoryId', categoryId);
    deleteProductId = res.body.data?.id;
  });

  test('✓ [EMPRENDEDOR] elimina su propio producto', async () => {
    if (!deleteProductId) return;

    const res = await request(app)
      .delete(`/api/products/${deleteProductId}`)
      .set('Cookie', entrepreneurCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ 404 para producto inexistente', async () => {
    const res = await request(app)
      .delete('/api/products/nonexistentproductid123')
      .set('Cookie', entrepreneurCookie);

    expect(res.status).toBe(404);
  });

  test('✓ sin autenticación retorna 401', async () => {
    const res = await request(app).delete('/api/products/someid');
    expect(res.status).toBe(401);
  });

  test('✓ [otro vendedor] no puede eliminar el producto (403)', async () => {
    if (!productId) return;
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Cookie', seller2Cookie);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('✓ 409 si el producto tiene pedidos activos', async () => {
    const productRes = await request(app)
      .post('/api/products')
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Product With Active Orders')
      .field('description', 'Has a pending order')
      .field('price', '5000')
      .field('categoryId', categoryId);
    const activeOrderProductId = productRes.body.data?.id;

    await request(app)
      .post('/api/orders')
      .set('Cookie', buyerCookie)
      .send({ productId: activeOrderProductId, quantity: 1 });

    const res = await request(app)
      .delete(`/api/products/${activeOrderProductId}`)
      .set('Cookie', entrepreneurCookie);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('HAS_ACTIVE_ORDERS');
  });
});

// ─────────────────────────────────────────────
// PATCH /api/products/:id/status
// ─────────────────────────────────────────────
describe('PATCH /api/products/:id/status', () => {
  test('✓ [no ADMIN] retorna 403', async () => {
    if (!productId) return;
    const res = await request(app)
      .patch(`/api/products/${productId}/status`)
      .set('Cookie', entrepreneurCookie)
      .send({ status: 'INACTIVE' });
    expect(res.status).toBe(403);
  });

  test('✓ [ADMIN] 404 para producto inexistente', async () => {
    const res = await request(app)
      .patch('/api/products/00000000-0000-0000-0000-000000000000/status')
      .set('Cookie', adminCookie)
      .send({ status: 'INACTIVE' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('✓ [ADMIN] 404 para producto con estado DELETED', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Cookie', entrepreneurCookie)
      .field('name', 'Deleted Status Product')
      .field('description', 'Will be deleted before status update')
      .field('price', '5000')
      .field('categoryId', categoryId);
    const tmpId = createRes.body.data?.id;
    await prisma.product.update({ where: { id: tmpId }, data: { status: 'DELETED' } });

    const res = await request(app)
      .patch(`/api/products/${tmpId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('✓ [ADMIN] estado inválido retorna 422 (validador)', async () => {
    if (!productId) return;
    const res = await request(app)
      .patch(`/api/products/${productId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'DELETED' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('✓ [ADMIN] cambia estado de ACTIVE a INACTIVE', async () => {
    if (!productId) return;
    const res = await request(app)
      .patch(`/api/products/${productId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'INACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('INACTIVE');
  });

  test('✓ [ADMIN] mismo estado devuelve 200 sin modificar', async () => {
    if (!productId) return;
    const res = await request(app)
      .patch(`/api/products/${productId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'INACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('✓ [ADMIN] cambia estado de INACTIVE a ACTIVE', async () => {
    if (!productId) return;
    const res = await request(app)
      .patch(`/api/products/${productId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');
  });
});
