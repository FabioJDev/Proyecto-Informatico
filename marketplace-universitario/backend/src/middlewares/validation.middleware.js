const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator results.
 * If there are validation errors, returns 422 with details.
 * Otherwise calls next().
 */
// basically DTOs.:b
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Datos inválidos. Revisa los campos indicados.',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
}

module.exports = { validate };
