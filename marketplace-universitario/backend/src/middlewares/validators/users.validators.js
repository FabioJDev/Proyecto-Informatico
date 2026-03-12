const { body, param } = require('express-validator');

const updateProfileValidation = [
  body('businessName')
    .trim()
    .escape()
    .notEmpty().withMessage('El nombre del emprendimiento es obligatorio.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre del emprendimiento debe tener entre 3 y 100 caracteres.'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar 500 caracteres.'),
  body('contactInfo')
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 200 }).withMessage('La información de contacto no puede superar 200 caracteres.'),
];

const updateStatusValidation = [
  param('id').notEmpty().withMessage('ID de usuario requerido.').trim(),
  body('status')
    .isIn(['ACTIVE', 'SUSPENDED', 'DELETED']).withMessage('Estado inválido.'),
];

module.exports = { updateProfileValidation, updateStatusValidation };
