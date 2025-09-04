const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { catalogValidation } = require('../middleware/validation');
const {
  getCatalogItems,
  getCatalogItemById,
  getCatalogBrands,
  getCatalogTypes,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  upload
} = require('../controllers/catalogController');

// Public routes
router.get('/items', catalogValidation.getItems, getCatalogItems);
router.get('/items/:id', catalogValidation.getItemById, getCatalogItemById);
router.get('/brands', getCatalogBrands);
router.get('/types', getCatalogTypes);

// Admin routes
router.post('/items', 
  authenticateToken, 
  requireAdmin,  
  catalogValidation.createItem, 
  createCatalogItem
);

router.put('/items/:id', 
  authenticateToken, 
  requireAdmin, 
  upload.single('image'), 
  catalogValidation.updateItem, 
  updateCatalogItem
);

router.delete('/items/:id', 
  authenticateToken, 
  requireAdmin, 
  catalogValidation.getItemById, 
  deleteCatalogItem
);

module.exports = router;
// Updated: 2025-09-04 16:51:05
