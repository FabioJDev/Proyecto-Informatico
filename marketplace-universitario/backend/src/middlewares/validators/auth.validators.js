const { body } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail().withMessage('Correo electrónico inválido.')
    .normalizeEmail()
    .custom((value) => {
      // Allow any .edu or .edu.co domain for institutional email
      if (!value.match(/^[^\s@]+@[^\s@]+\.edu(\.[a-z]{2})?$/i)) {
        throw new Error('Solo se permiten correos institucionales (dominio .edu).');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula.')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número.'),
  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es requerida.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden.');
      }
      return true;
    }),
  body('role')
    .isIn(['EMPRENDEDOR', 'COMPRADOR']).withMessage('Rol inválido. Elige EMPRENDEDOR o COMPRADOR.'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Correo electrónico inválido.').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida.').trim(),
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Correo electrónico inválido.').normalizeEmail(),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token de recuperación requerido.').trim(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula.')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número.'),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
