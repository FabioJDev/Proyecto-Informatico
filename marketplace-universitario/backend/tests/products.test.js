process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-minimum-32-chars';
process.env.JWT_EXPIRES_IN = '8h';
process.env.BCRYPT_COST_FACTOR = '4';
process.env.FRONTEND_URL = 'http://localhost:5173';

const request = require('supertest');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');

const prisma = new PrismaClient();

let entrepreneurCookie;
let buyerCookie;
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
});
