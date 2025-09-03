const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { catalogValidation, userValidation } = require('../middleware/validation');
const { User, CatalogItem, Order, Review } = require('../models');
const { Op } = require('sequelize');

// Dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockItems
    ] = await Promise.all([
      User.count({ where: { role: 'customer', isActive: true } }),
      CatalogItem.count({ where: { isActive: true } }),
      Order.count(),
      Order.sum('total'),
      Order.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      }),
      CatalogItem.findAll({
        where: {
          isActive: true,
          availableStock: { [Op.lte]: 10 }
        },
        order: [['availableStock', 'ASC']],
        limit: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue || 0
        },
        recentOrders,
        lowStockItems
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User management
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) whereClause.role = role;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      attributes: { exclude: ['password'] }
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle user active status
router.put('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Brand management
router.post('/brands', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { brand, description } = req.body;
    
    const { CatalogBrand } = require('../models');
    const newBrand = await CatalogBrand.create({ brand, description });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: { brand: newBrand }
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Type management
router.post('/types', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, description } = req.body;
    
    const { CatalogType } = require('../models');
    const newType = await CatalogType.create({ type, description });

    res.status(201).json({
      success: true,
      message: 'Type created successfully',
      data: { type: newType }
    });
  } catch (error) {
    console.error('Create type error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
