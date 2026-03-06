const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders.controller');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { createOrderValidation } = require('../middlewares/validators/orders.validators');

// All order routes require authentication
router.use(verifyJWT);

router.post('/', requireRole('COMPRADOR'), createOrderValidation, validate, ordersController.create);
router.get('/', ordersController.getAll);
router.patch('/:id/accept', requireRole('EMPRENDEDOR'), ordersController.accept);
router.patch('/:id/reject', requireRole('EMPRENDEDOR'), ordersController.reject);
router.patch('/:id/deliver', requireRole('EMPRENDEDOR'), ordersController.deliver);
router.patch('/:id/cancel', requireRole('COMPRADOR'), ordersController.cancel);

module.exports = router;
