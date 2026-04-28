const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');
const { sendPasswordReset, sendWelcomeEmail } = require('../services/email.service');
const COST_FACTOR = parseInt(process.env.BCRYPT_COST_FACTOR, 10) || 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function setCookieAndRespond(res, token, user) {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  return res.json({
    success: true,
    message: 'Autenticación exitosa.',
    token, // also returned in body for cross-domain Bearer auth
    user: { id: user.id, email: user.email, role: user.role, status: user.status, profile: user.profile },
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Este correo ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, COST_FACTOR);
    const user = await prisma.user.create({
      data: { email, passwordHash, role },
      include: { profile: true },
    });

    // Fire-and-forget: do not let email failure break registration (RNF)
    sendWelcomeEmail(user.email, user.role).catch((err) => {
      console.error('[email] Welcome email failed:', err.message);
    });

    const token = signToken(user);
    return setCookieAndRespond(res.status(201), token, user);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // findFirst + mode:'insensitive' prevents login failures caused by email case mismatches
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { profile: true },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Tu cuenta ha sido suspendida. Contacta al administrador.' });
    }

    if (user.status === 'DELETED') {
      return res.status(403).json({ success: false, message: 'Esta cuenta no existe.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    const token = signToken(user);
    return setCookieAndRespond(res, token, user);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie('jwt');
  res.json({ success: true, message: 'Sesión cerrada correctamente.' });
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: { select: { businessName: true, photoUrl: true } },
      },
    });

    if (!user) {
      res.clearCookie('jwt');
      return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond 200 to avoid email enumeration
    if (!user) {
      return res.json({ success: true, message: 'Si ese correo existe, recibirás instrucciones.' });
    }

    const token = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    });

    // Fire-and-forget: email failures must not break the reset flow (RNF)
    sendPasswordReset(email, token).catch((err) => {
      console.error('[email] Password reset email failed:', err.message);
      console.error('[email] Stack:', err.stack);
    });

    res.json({ success: true, message: 'Si ese correo existe, recibirás instrucciones.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, COST_FACTOR);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });

    res.json({ success: true, message: 'Contraseña actualizada exitosamente.' });
  } catch (err) {
    next(err);
  }
}

// [DEBUG] Test password reset email (development only)
async function testPasswordReset(req, res, _next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Endpoint no disponible en producción.' });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requerido.' });
    }

    const testToken = 'test-token-123456789';
    const testUrl = `${process.env.FRONTEND_URL}/reset-password?token=${testToken}`;
    
    console.log(`[DEBUG] Enviando email de prueba a: ${email}`);
    console.log(`[DEBUG] URL del test: ${testUrl}`);
    
    await sendPasswordReset(email, testToken);
    
    res.json({ 
      success: true, 
      message: 'Email de prueba enviado. Revisa los logs del servidor y la consola del navegador.',
      testToken,
      testUrl
    });
  } catch (err) {
    console.error('[DEBUG] Error enviando email de prueba:', err);
    res.status(500).json({ 
      success: false, 
      message: `Error: ${err.message}`,
      error: err.toString()
    });
  }
}

// [DEBUG] Force password reset WITHOUT email (development only)
async function forcePasswordReset(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Endpoint no disponible en producción.' });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requerido.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const token = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordResetToken: token, 
        passwordResetExpiry: expiry 
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    console.log(`[DEBUG] 🔓 Forzado reset para: ${email}`);
    console.log(`[DEBUG] Token: ${token}`);
    console.log(`[DEBUG] URL: ${resetUrl}`);
    console.log(`[DEBUG] Expira en: ${expiry.toISOString()}`);

    res.json({
      success: true,
      message: 'Reset token generado sin enviar email.',
      token,
      resetUrl,
      expiresAt: expiry.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, forgotPassword, resetPassword, testPasswordReset, forcePasswordReset };
