const express = require('express');
const router = express.Router();
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const { basketValidation } = require('../middleware/validation');
const {
  getBasket,
  addItemToBasket,
  updateBasketItem,
  removeBasketItem,
  clearBasket,
  transferBasket
} = require('../controllers/basketController');

// Basket routes (support both authenticated and anonymous users)
router.get('/', optionalAuth, getBasket);
router.post('/items', optionalAuth, basketValidation.addItem, addItemToBasket);
router.put('/items/:itemId', optionalAuth, basketValidation.updateItem, updateBasketItem);
router.delete('/items/:itemId', optionalAuth, basketValidation.removeItem, removeBasketItem);
router.delete('/', optionalAuth, clearBasket);

// Authenticated user routes
router.post('/transfer', authenticateToken, basketValidation.transferBasket, transferBasket);

module.exports = router;