const { Wishlist, CatalogItem, CatalogBrand, CatalogType } = require('../models');
const { validationResult } = require('express-validator');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: wishlistItems } = await Wishlist.findAndCountAll({
      where: { userId },
      include: [
        {
          model: CatalogItem,
          as: 'catalogItem',
          where: { isActive: true },
          include: [
            {
              model: CatalogBrand,
              as: 'catalogBrand',
              attributes: ['id', 'brand']
            },
            {
              model: CatalogType,
              as: 'catalogType',
              attributes: ['id', 'type']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        items: wishlistItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { catalogItemId } = req.body;

    // Check if catalog item exists
    const catalogItem = await CatalogItem.findOne({
      where: { id: catalogItemId, isActive: true }
    });

    if (!catalogItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if item already in wishlist
    const existingItem = await Wishlist.findOne({
      where: { userId, catalogItemId }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      catalogItemId
    });

    const createdItem = await Wishlist.findByPk(wishlistItem.id, {
      include: [
        {
          model: CatalogItem,
          as: 'catalogItem',
          include: [
            {
              model: CatalogBrand,
              as: 'catalogBrand',
              attributes: ['id', 'brand']
            },
            {
              model: CatalogType,
              as: 'catalogType',
              attributes: ['id', 'type']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: { item: createdItem }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const wishlistItem = await Wishlist.findOne({
      where: { id, userId }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await wishlistItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check if item is in wishlist
const checkWishlistItem = async (req, res) => {
  try {
    const { catalogItemId } = req.params;
    const userId = req.user.userId;

    const wishlistItem = await Wishlist.findOne({
      where: { userId, catalogItemId }
    });

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem,
        wishlistItemId: wishlistItem?.id || null
      }
    });
  } catch (error) {
    console.error('Check wishlist item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Wishlist.destroy({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistItem,
  clearWishlist
};

// Updated: 2025-09-04 16:51:05
