const { body } = require('express-validator');

const createOrderValidation = [
  body('productId')
    .notEmpty().withMessage('El ID del producto es requerido.')
    .trim(),
  body('quantity')
    .isInt({ min: 1, max: 100 }).withMessage('La cantidad debe ser entre 1 y 100.')
    .toInt(),
  body('message')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 }).withMessage('El mensaje no puede superar 500 caracteres.'),
];

module.exports = { createOrderValidation };
