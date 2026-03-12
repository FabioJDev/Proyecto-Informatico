const express = require('express');
const multer = require('multer');
const router = express.Router();

const usersController = require('../controllers/users.controller');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { updateProfileValidation, updateStatusValidation } = require('../middlewares/validators/users.validators');

// Multer — memory storage, max 2 MB, solo JPG/PNG (CA-03, CA-04)
const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      return cb(null, true);
    }
    const err = new Error('Solo se permiten imágenes JPG o PNG.');
    err.status = 422;
    cb(err);
  },
});

function handleProfileUpload(req, res, next) {
  profileUpload.single('photo')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(422).json({ success: false, message: 'La imagen no puede superar los 2 MB.' });
    }
    return res.status(422).json({ success: false, message: err.message || 'Error al procesar la imagen.' });
  });
}

// [ADMIN] List all users
router.get('/', verifyJWT, requireRole('ADMIN'), usersController.getAll);

// [ADMIN] Suspend / delete user
router.patch('/:id/status', verifyJWT, requireRole('ADMIN'), updateStatusValidation, validate, usersController.updateStatus);

// [EMPRENDEDOR] Get own profile (for edit form pre-fill) — must be before /:id/profile
router.get('/profile/me', verifyJWT, requireRole('EMPRENDEDOR'), usersController.getMyProfile);

// Public — get a user's profile
router.get('/:id/profile', usersController.getProfile);

// [EMPRENDEDOR] Create or update own profile (with optional photo)
router.put(
  '/profile',
  verifyJWT,
  requireRole('EMPRENDEDOR'),
  handleProfileUpload,
  updateProfileValidation,
  validate,
  usersController.updateProfile
);

module.exports = router;
