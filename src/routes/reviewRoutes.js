const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validation');
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markReviewHelpful
} = require('../controllers/reviewController');

// Public routes
router.get('/products/:catalogItemId', reviewValidation.getProductReviews, getProductReviews);

// User routes
router.post('/', authenticateToken, reviewValidation.createReview, createReview);
router.put('/:id', authenticateToken, reviewValidation.updateReview, updateReview);
router.delete('/:id', authenticateToken, deleteReview);
router.post('/:id/helpful', markReviewHelpful);

module.exports = router;

// Updated: 2025-09-04 16:51:05
