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
} = require('../middlewares/validators/products.validators');

// Multer — memory storage (files go to Supabase, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Solo se permiten archivos de imagen.'));
  },
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

router.delete('/:id', verifyJWT, requireRole('EMPRENDEDOR', 'ADMIN'), productsController.remove);

module.exports = router;
