const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * verifyJWT — Extracts and validates JWT from httpOnly cookie.
 * Sets req.user = { id, email, role }
 * Also checks if user is suspended or deleted to close session
 */
async function verifyJWT(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado. Inicia sesión para continuar.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is not suspended/deleted
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user) {
      res.clearCookie('jwt');
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado. Sesión cerrada.' 
      });
    }

    // Check if user is suspended or deleted
    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      res.clearCookie('jwt');
      return res.status(401).json({ 
        success: false, 
        message: `Tu cuenta ha sido ${user.status === 'SUSPENDED' ? 'suspendida' : 'eliminada'}. Sesión cerrada.` 
      });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
        : 'Token inválido. Inicia sesión nuevamente.';

    res.clearCookie('jwt');
    return res.status(401).json({ success: false, message });
  }
}

/**
 * requireRole — RBAC middleware.
 * Usage: requireRole('ADMIN') or requireRole('EMPRENDEDOR', 'ADMIN')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}.`,
      });
    }

    next();
  };
}

module.exports = { verifyJWT, requireRole };
