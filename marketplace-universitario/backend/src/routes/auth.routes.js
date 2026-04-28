const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../middlewares/validators/auth.validators');

// Apply stricter rate limit to all auth routes
router.use(authLimiter);

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyJWT, authController.me);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// [DEBUG] Test email endpoint (development only)
router.post('/debug/test-password-reset', authController.testPasswordReset);

// [DEBUG] Force password reset without email (development only)
router.post('/debug/force-password-reset', authController.forcePasswordReset);

module.exports = router;
