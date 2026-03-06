const { body, query, param } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .escape()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
  body('description')
    .trim()
    .escape()
    .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres.'),
  body('price')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo.')
    .toFloat(),
  body('categoryId')
    .notEmpty().withMessage('La categoría es requerida.')
    .trim(),
  body('images')
    .optional()
    .isArray({ max: 5 }).withMessage('Se permiten máximo 5 imágenes.'),
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres.'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo.')
    .toFloat(),
  body('categoryId')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Estado inválido.'),
  body('images')
    .optional()
    .isArray({ max: 5 }).withMessage('Se permiten máximo 5 imágenes.'),
];

const catalogQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite inválido (1-50).').toInt(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Precio mínimo inválido.').toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Precio máximo inválido.').toFloat(),
  query('keyword').optional().trim().escape().isLength({ max: 100 }),
  query('categoryId').optional().trim(),
];

module.exports = { createProductValidation, updateProductValidation, catalogQueryValidation };
