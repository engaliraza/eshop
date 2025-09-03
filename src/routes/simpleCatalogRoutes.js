const express = require('express');
const router = express.Router();
const { CatalogItem, CatalogBrand, CatalogType } = require('../models');

// Get all catalog items
router.get('/items', async (req, res) => {
  try {
    console.log('📦 Fetching catalog items...');
    
    const items = await CatalogItem.findAll({
      where: { isActive: true },
      include: [
        {
          model: CatalogBrand,
          as: 'catalogBrand',
          attributes: ['id', 'brand', 'description']
        },
        {
          model: CatalogType,
          as: 'catalogType',
          attributes: ['id', 'type', 'description']
        }
      ],
      order: [['name', 'ASC']]
    });

    console.log(`✅ Found ${items.length} catalog items`);

    res.json({
      success: true,
      data: items,
      count: items.length
    });

  } catch (error) {
    console.error('❌ Error fetching catalog items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog items',
      error: error.message
    });
  }
});

// Get catalog brands
router.get('/brands', async (req, res) => {
  try {
    console.log('🏷️ Fetching catalog brands...');
    
    const brands = await CatalogBrand.findAll({
      order: [['brand', 'ASC']]
    });

    console.log(`✅ Found ${brands.length} brands`);

    res.json({
      success: true,
      data: brands
    });

  } catch (error) {
    console.error('❌ Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
});

// Get catalog types
router.get('/types', async (req, res) => {
  try {
    console.log('📂 Fetching catalog types...');
    
    const types = await CatalogType.findAll({
      order: [['type', 'ASC']]
    });

    console.log(`✅ Found ${types.length} types`);

    res.json({
      success: true,
      data: types
    });

  } catch (error) {
    console.error('❌ Error fetching types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch types',
      error: error.message
    });
  }
});

module.exports = router;
