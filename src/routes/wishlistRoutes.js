const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { wishlistValidation } = require('../middleware/validation');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistItem,
  clearWishlist
} = require('../controllers/wishlistController');

// All wishlist routes require authentication
router.get('/', authenticateToken, wishlistValidation.getWishlist, getWishlist);
router.post('/', authenticateToken, wishlistValidation.addToWishlist, addToWishlist);
router.delete('/:id', authenticateToken, wishlistValidation.removeFromWishlist, removeFromWishlist);
router.get('/check/:catalogItemId', authenticateToken, wishlistValidation.checkWishlistItem, checkWishlistItem);
router.delete('/', authenticateToken, clearWishlist);

module.exports = router;
