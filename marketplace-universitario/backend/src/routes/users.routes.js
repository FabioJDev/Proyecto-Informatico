const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { updateProfileValidation, updateStatusValidation } = require('../middlewares/validators/users.validators');

// [ADMIN] List all users
router.get('/', verifyJWT, requireRole('ADMIN'), usersController.getAll);

// [ADMIN] Suspend / delete user
router.patch('/:id/status', verifyJWT, requireRole('ADMIN'), updateStatusValidation, validate, usersController.updateStatus);

// Public — get a user's profile
router.get('/:id/profile', usersController.getProfile);

// [EMPRENDEDOR] Create or update own profile
router.put('/profile', verifyJWT, requireRole('EMPRENDEDOR'), updateProfileValidation, validate, usersController.updateProfile);

module.exports = router;
