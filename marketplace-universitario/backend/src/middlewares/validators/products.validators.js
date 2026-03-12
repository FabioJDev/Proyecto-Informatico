const { body, query, param } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del producto es obligatorio.')
    .isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres.'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción no puede superar 1000 caracteres.'),
  body('price')
    .notEmpty().withMessage('El precio es obligatorio y debe ser mayor a $0')
    .custom((value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        throw new Error('El precio debe ser un valor positivo mayor a cero');
      }
      return true;
    })
    .toFloat(),
  body('categoryId')
    .notEmpty().withMessage('Debes seleccionar una categoría')
    .trim(),
  body('images')
    .optional()
    .isArray({ max: 5 }).withMessage('Solo se permiten hasta 5 imágenes por publicación'),
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
  query('keyword').optional().trim().isLength({ max: 100 }),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('La búsqueda no puede superar 100 caracteres.'),
  query('categoryId').optional().trim(),
  query('category').optional().trim(),
  query('orderBy').optional().trim().isIn(['recent', 'price_asc', 'price_desc']).withMessage('Orden inválido.'),
];

module.exports = { createProductValidation, updateProductValidation, catalogQueryValidation };
