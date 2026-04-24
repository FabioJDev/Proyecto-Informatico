const express = require('express');
const router = express.Router();
const multer = require('multer');

const productsController = require('../controllers/products.controller');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');
const { uploadLimiter } = require('../middlewares/rateLimiter.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
  createProductValidation,
  updateProductValidation,
  catalogQueryValidation,
  updateProductStatusValidation,
} = require('../middlewares/validators/products.validators');

/* istanbul ignore next */
function imageFileFilter(_req, file, cb) {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Solo se permiten archivos de imagen.'));
}

// Multer — memory storage (files go to Supabase, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: imageFileFilter,
});

// Public
router.get('/', catalogQueryValidation, validate, productsController.getAll);
router.get('/categories', productsController.getCategories);
router.get('/:id', productsController.getById);

// Protected
router.post(
  '/',
  verifyJWT,
  requireRole('EMPRENDEDOR'),
  uploadLimiter,
  upload.array('images', 5),
  createProductValidation,
  validate,
  productsController.create
);

router.put(
  '/:id',
  verifyJWT,
  requireRole('EMPRENDEDOR'),
  uploadLimiter,
  upload.array('images', 5),
  updateProductValidation,
  validate,
  productsController.update
);

// [ADMIN] Change product status (disable/enable)
router.patch(
  '/:id/status',
  verifyJWT,
  requireRole('ADMIN'),
  updateProductStatusValidation,
  validate,
  productsController.updateStatus
);

router.delete('/:id', verifyJWT, requireRole('EMPRENDEDOR', 'ADMIN'), productsController.remove);

module.exports = router;
