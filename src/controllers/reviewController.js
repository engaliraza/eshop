const { Review, User, CatalogItem, Order, OrderItem } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

// Create a review
const createReview = async (req, res) => {
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
    const { catalogItemId, rating, title, comment } = req.body;

    // Check if catalog item exists
    const catalogItem = await CatalogItem.findByPk(catalogItemId, { transaction });
    if (!catalogItem) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      where: { userId, catalogItemId },
      transaction
    });

    if (existingReview) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this item (for verified purchase)
    const hasPurchased = await OrderItem.findOne({
      include: [
        {
          model: Order,
          as: 'order',
          where: { 
            userId, 
            status: { [Op.in]: ['delivered', 'completed'] }
          }
        }
      ],
      where: { catalogItemId },
      transaction
    });

    // Create review
    const review = await Review.create({
      userId,
      catalogItemId,
      rating: parseInt(rating),
      title,
      comment,
      isVerifiedPurchase: !!hasPurchased
    }, { transaction });

    // Update catalog item rating
    const reviews = await Review.findAll({
      where: { catalogItemId },
      transaction
    });

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    await catalogItem.update({
      averageRating: averageRating.toFixed(2),
      reviewCount
    }, { transaction });

    await transaction.commit();

    // Get created review with user info
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review: createdReview }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { catalogItemId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const validSortFields = ['createdAt', 'rating', 'helpfulCount'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { catalogItemId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [[orderField, orderDirection]],
      limit: parseInt(limit),
      offset: offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    // Get rating distribution
    const ratingDistribution = await Review.findAll({
      where: { catalogItemId },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('rating')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      where: { id, userId },
      transaction
    });

    if (!review) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.update({
      rating: parseInt(rating),
      title,
      comment
    }, { transaction });

    // Update catalog item rating
    const reviews = await Review.findAll({
      where: { catalogItemId: review.catalogItemId },
      transaction
    });

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await CatalogItem.update({
      averageRating: averageRating.toFixed(2)
    }, {
      where: { id: review.catalogItemId },
      transaction
    });

    await transaction.commit();

    const updatedReview = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const whereClause = { id };
    if (userRole !== 'admin') {
      whereClause.userId = userId;
    }

    const review = await Review.findOne({
      where: whereClause,
      transaction
    });

    if (!review) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const catalogItemId = review.catalogItemId;
    await review.destroy({ transaction });

    // Update catalog item rating
    const remainingReviews = await Review.findAll({
      where: { catalogItemId },
      transaction
    });

    let averageRating = 0;
    let reviewCount = remainingReviews.length;

    if (reviewCount > 0) {
      averageRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
    }

    await CatalogItem.update({
      averageRating: averageRating.toFixed(2),
      reviewCount
    }, {
      where: { id: catalogItemId },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark review as helpful
const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.update({
      helpfulCount: review.helpfulCount + 1
    });

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { helpfulCount: review.helpfulCount + 1 }
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markReviewHelpful
};
