const jwt = require('jsonwebtoken');

/**
 * verifyJWT — Extracts and validates JWT from httpOnly cookie.
 * Sets req.user = { id, email, role }
 */
function verifyJWT(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado. Inicia sesión para continuar.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
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
