const { body } = require('express-validator');

const createReviewValidation = [
  body('orderId')
    .notEmpty().withMessage('El ID del pedido es requerido.')
    .trim(),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5.')
    .toInt(),
  body('comment')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 300 }).withMessage('El comentario no puede superar 300 caracteres.'),
];

module.exports = { createReviewValidation };
