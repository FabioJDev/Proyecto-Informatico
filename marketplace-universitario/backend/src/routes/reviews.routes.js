const express = require('express');
const router = express.Router();

const reviewsController = require('../controllers/reviews.controller');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { createReviewValidation } = require('../middlewares/validators/reviews.validators');

// Public — get reviews for a profile
router.get('/profile/:profileId', reviewsController.getByProfile);

// Protected — create a review
router.post('/', verifyJWT, requireRole('COMPRADOR'), createReviewValidation, validate, reviewsController.create);

module.exports = router;
