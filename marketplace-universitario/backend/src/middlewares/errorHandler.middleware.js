/**
 * Global Express error handler (RNF-09)
 * Provides descriptive messages for users, never leaks stack traces in production.
 *
 * Usage: place as the LAST middleware in app.js
 */
function errorHandler(err, req, res, _next) {
  // Normalize status code
  let status = err.status || err.statusCode || 500;

  // Prisma known errors → user-friendly messages
  if (err.code === 'P2002') {
    status = 409;
    err.message = 'Ya existe un registro con ese valor único.';
  } else if (err.code === 'P2025') {
    status = 404;
    err.message = 'El recurso solicitado no fue encontrado.';
  } else if (err.code === 'P2003') {
    status = 400;
    err.message = 'Referencia inválida: el recurso relacionado no existe.';
  }

  // Log in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ErrorHandler] ${status} — ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  const response = {
    success: false,
    message: err.message || 'Error interno del servidor.',
  };

  // Include validation errors array if present
  if (err.errors) {
    response.errors = err.errors;
  }

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
