const rateLimit = require('express-rate-limit');

/**
 * General rate limiter — 100 requests per 1 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo en 15 minutos.',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

/**
 * Auth rate limiter — 10 requests per 15 minutes (anti brute-force)
 * In development, limit is raised to 200 to avoid blocking during testing.
 */
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 200 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

/**
 * Upload limiter — 20 requests per 15 minutes (for file upload endpoints)
 */
const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite de subidas alcanzado. Intenta de nuevo en 15 minutos.',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };
