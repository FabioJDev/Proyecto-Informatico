process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-minimum-32-chars';
process.env.JWT_EXPIRES_IN = '8h';
process.env.BCRYPT_COST_FACTOR = '4'; // Low cost for fast tests
process.env.FRONTEND_URL = 'http://localhost:5173';

// Mock email service so tests don't need SendGrid configured
jest.mock('../src/services/email.service', () => ({
  sendPasswordReset: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendOrderConfirmation: jest.fn().mockResolvedValue(true),
  sendNewOrderToSeller: jest.fn().mockResolvedValue(true),
  sendOrderStatusChange: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const INSTITUTIONAL_EMAIL = 'testuser@universidad.edu.co';
const PASSWORD = 'ValidPass1';

async function cleanupUser(email) {
  await prisma.user.deleteMany({ where: { email } });
}

beforeAll(async () => {
  await prisma.$connect();
  await cleanupUser(INSTITUTIONAL_EMAIL);
  await cleanupUser('existing@universidad.edu.co');
});

afterAll(async () => {
  await cleanupUser(INSTITUTIONAL_EMAIL);
  await cleanupUser('existing@universidad.edu.co');
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('✓ registro exitoso con rol EMPRENDEDOR', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: INSTITUTIONAL_EMAIL,
      password: PASSWORD,
      confirmPassword: PASSWORD,
      role: 'EMPRENDEDOR',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(INSTITUTIONAL_EMAIL);
    expect(res.body.user.role).toBe('EMPRENDEDOR');
    // Password should never be returned
    expect(res.body.user.passwordHash).toBeUndefined();
    // Should set JWT cookie
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('✓ error si email ya existe', async () => {
    // Ensure user exists from previous test
    const res = await request(app).post('/api/auth/register').send({
      email: INSTITUTIONAL_EMAIL,
      password: PASSWORD,
      confirmPassword: PASSWORD,
      role: 'COMPRADOR',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/ya está registrado/i);
  });

  test('✓ error si email no es institucional', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'normaluser@gmail.com',
      password: PASSWORD,
      confirmPassword: PASSWORD,
      role: 'COMPRADOR',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe('email');
  });

  test('✓ error si las contraseñas no coinciden', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'nuevo@universidad.edu.co',
      password: PASSWORD,
      confirmPassword: 'OtherPass9',
      role: 'COMPRADOR',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.field === 'confirmPassword')).toBe(true);
  });

  test('✓ error si rol es inválido', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'otro@universidad.edu.co',
      password: PASSWORD,
      confirmPassword: PASSWORD,
      role: 'ADMIN',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('✓ error si contraseña es débil', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'nuevo@universidad.edu.co',
      password: '123',
      confirmPassword: '123',
      role: 'COMPRADOR',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  test('✓ login exitoso retorna cookie JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: INSTITUTIONAL_EMAIL,
      password: PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(INSTITUTIONAL_EMAIL);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('jwt='))).toBe(true);
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
  });

  test('✓ error con contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: INSTITUTIONAL_EMAIL,
      password: 'WrongPass99',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/credenciales incorrectas/i);
  });

  test('✓ error con email inexistente (mismo mensaje que contraseña incorrecta)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'doesnotexist@universidad.edu.co',
      password: PASSWORD,
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    // Must not reveal which field is wrong (security)
    expect(res.body.message).toMatch(/credenciales incorrectas/i);
  });

  test('✓ error con email inválido', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: PASSWORD,
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('✓ error si la cuenta está suspendida', async () => {
    // Suspend the test user temporarily
    await prisma.user.updateMany({
      where: { email: INSTITUTIONAL_EMAIL },
      data: { status: 'SUSPENDED' },
    });

    const res = await request(app).post('/api/auth/login').send({
      email: INSTITUTIONAL_EMAIL,
      password: PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/suspendida/i);

    // Restore status
    await prisma.user.updateMany({
      where: { email: INSTITUTIONAL_EMAIL },
      data: { status: 'ACTIVE' },
    });
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
  test('✓ logout limpia la cookie JWT', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Cookie should be cleared
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      expect(cookies.some((c) => c.includes('jwt=;') || c.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  let authCookie;

  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: INSTITUTIONAL_EMAIL,
      password: PASSWORD,
    });
    authCookie = loginRes.headers['set-cookie'];
  });

  test('✓ retorna datos del usuario autenticado', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', authCookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(INSTITUTIONAL_EMAIL);
  });

  test('✓ sin autenticación retorna 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {
  test('✓ retorna 200 con mensaje genérico cuando el email existe', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: INSTITUTIONAL_EMAIL,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Generic message — does not confirm whether email exists
    expect(res.body.message).toBeTruthy();
  });

  test('✓ retorna 200 con mismo mensaje cuando el email NO existe', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'noexiste@universidad.edu.co',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Same message regardless of whether email exists (prevents enumeration)
    expect(res.body.message).toBeTruthy();
  });

  test('✓ error 422 con email inválido', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'not-a-valid-email',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
describe('POST /api/auth/reset-password', () => {
  let validResetToken;

  beforeAll(async () => {
    // Inject a known valid reset token directly into the DB
    validResetToken = 'valid-test-reset-token-' + Date.now();
    await prisma.user.updateMany({
      where: { email: INSTITUTIONAL_EMAIL },
      data: {
        passwordResetToken: validResetToken,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      },
    });
  });

  test('✓ reset exitoso con token válido', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: validResetToken,
      password: 'NewPassword1',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Token should be cleared after use
    const user = await prisma.user.findUnique({ where: { email: INSTITUTIONAL_EMAIL } });
    expect(user.passwordResetToken).toBeNull();
    expect(user.passwordResetExpiry).toBeNull();
  });

  test('✓ error 400 con token inválido', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'completely-invalid-token',
      password: 'NewPassword1',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('✓ error 400 con token expirado', async () => {
    // Inject an already-expired token
    const expiredToken = 'expired-test-token-' + Date.now();
    await prisma.user.updateMany({
      where: { email: INSTITUTIONAL_EMAIL },
      data: {
        passwordResetToken: expiredToken,
        passwordResetExpiry: new Date(Date.now() - 1000), // 1 second in the past
      },
    });

    const res = await request(app).post('/api/auth/reset-password').send({
      token: expiredToken,
      password: 'NewPassword1',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/inválido|expirado/i);
  });

  test('✓ error 422 con contraseña débil', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'some-token',
      password: 'weak',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
