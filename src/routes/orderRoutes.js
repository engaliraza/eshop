const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { orderValidation, commonValidation } = require('../middleware/validation');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics
} = require('../controllers/orderController');

// User routes
router.post('/', authenticateToken, orderValidation.createOrder, createOrder);
router.get('/my-orders', authenticateToken, orderValidation.getOrders, getUserOrders);
router.get('/:id', authenticateToken, orderValidation.getOrderById, getOrderById);
router.put('/:id/cancel', authenticateToken, commonValidation.uuidParam('id'), cancelOrder);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, orderValidation.updateOrderStatus, updateOrderStatus);
router.get('/admin/statistics', authenticateToken, requireAdmin, getOrderStatistics);

module.exports = router;