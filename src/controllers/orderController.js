const { Order, OrderItem, Basket, BasketItem, CatalogItem, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

// Create order from basket
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const {
      shipToAddress_Street,
      shipToAddress_City,
      shipToAddress_State,
      shipToAddress_Country,
      shipToAddress_ZipCode,
      paymentMethod,
      notes
    } = req.body;

    // Get user's active basket
    const basket = await Basket.findOne({
      where: { userId, isActive: true },
      include: [
        {
          model: BasketItem,
          as: 'basketItems',
          include: [
            {
              model: CatalogItem,
              as: 'catalogItem'
            }
          ]
        }
      ],
      transaction
    });

    if (!basket || basket.basketItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Basket is empty'
      });
    }

    // Validate stock availability
    for (const basketItem of basket.basketItems) {
      if (basketItem.catalogItem.availableStock < basketItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${basketItem.catalogItem.name}. Available: ${basketItem.catalogItem.availableStock}, Requested: ${basketItem.quantity}`
        });
      }
    }

    // Calculate totals
    const subtotal = basket.basketItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );
    
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create order
    const order = await Order.create({
      userId,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      shipToAddress_Street,
      shipToAddress_City,
      shipToAddress_State,
      shipToAddress_Country,
      shipToAddress_ZipCode,
      paymentMethod,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    }, { transaction });

    // Create order items and update stock
    for (const basketItem of basket.basketItems) {
      await OrderItem.create({
        orderId: order.id,
        catalogItemId: basketItem.catalogItemId,
        productName: basketItem.catalogItem.name,
        productDescription: basketItem.catalogItem.description,
        unitPrice: basketItem.unitPrice,
        quantity: basketItem.quantity,
        pictureUri: basketItem.catalogItem.pictureUri
      }, { transaction });

      // Update stock
      await basketItem.catalogItem.update({
        availableStock: basketItem.catalogItem.availableStock - basketItem.quantity
      }, { transaction });
    }

    // Clear basket
    await BasketItem.destroy({
      where: { basketId: basket.id },
      transaction
    });

    await basket.update({ isActive: false }, { transaction });

    await transaction.commit();

    // Get complete order with items
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems'
        },
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: createdOrder }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: CatalogItem,
              as: 'catalogItem',
              attributes: ['id', 'name', 'pictureUri']
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
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const whereClause = { id };
    if (userRole !== 'admin') {
      whereClause.userId = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: CatalogItem,
              as: 'catalogItem',
              attributes: ['id', 'name', 'pictureUri']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cancel order (user can only cancel pending orders)
const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: CatalogItem,
              as: 'catalogItem'
            }
          ]
        }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }

    // Restore stock
    for (const orderItem of order.orderItems) {
      await orderItem.catalogItem.update({
        availableStock: orderItem.catalogItem.availableStock + orderItem.quantity
      }, { transaction });
    }

    // Update order status
    await order.update({
      status: 'cancelled',
      paymentStatus: 'refunded'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus, 
      startDate, 
      endDate,
      search 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const includeClause = [
      {
        model: OrderItem,
        as: 'orderItems'
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }
    ];

    if (search) {
      includeClause[1].where = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber, notes } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    // Set delivery dates based on status
    if (status === 'shipped' && !order.estimatedDeliveryDate) {
      updateData.estimatedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
    
    if (status === 'delivered') {
      updateData.actualDeliveryDate = new Date();
    }

    await order.update(updateData);

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems'
        },
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get order statistics (Admin)
const getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders
    ] = await Promise.all([
      Order.count({ where: whereClause }),
      Order.sum('total', { where: whereClause }),
      Order.findAll({
        where: whereClause,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
        ],
        group: ['status']
      }),
      Order.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue || 0,
        ordersByStatus,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get order statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics
};