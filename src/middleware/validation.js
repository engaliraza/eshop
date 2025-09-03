const { body, param, query } = require('express-validator');

// User validation rules
const userValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6, max: 100 })
      .withMessage('Password must be between 6 and 100 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name can only contain letters and spaces')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name can only contain letters and spaces')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6, max: 100 })
      .withMessage('New password must be between 6 and 100 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6, max: 100 })
      .withMessage('New password must be between 6 and 100 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
  ]
};

// Catalog validation rules
const catalogValidation = {
  createItem: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('price')
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    body('catalogTypeId')
      .isUUID()
      .withMessage('Valid catalog type ID is required'),
    body('catalogBrandId')
      .isUUID()
      .withMessage('Valid catalog brand ID is required'),
    body('availableStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Available stock must be a non-negative integer'),
    body('restockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Restock threshold must be a non-negative integer'),
    body('maxStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Max stock threshold must be a non-negative integer')
  ],

  updateItem: [
    param('id')
      .isUUID()
      .withMessage('Valid catalog item ID is required'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    body('catalogTypeId')
      .optional()
      .isUUID()
      .withMessage('Valid catalog type ID is required'),
    body('catalogBrandId')
      .optional()
      .isUUID()
      .withMessage('Valid catalog brand ID is required'),
    body('availableStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Available stock must be a non-negative integer')
  ],

  getItems: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be non-negative'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be non-negative'),
    query('sortBy')
      .optional()
      .isIn(['name', 'price', 'createdAt', 'averageRating'])
      .withMessage('Sort by must be one of: name, price, createdAt, averageRating'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC'),
    query('brandId')
      .optional()
      .isUUID()
      .withMessage('Brand ID must be a valid UUID'),
    query('typeId')
      .optional()
      .isUUID()
      .withMessage('Type ID must be a valid UUID')
  ],

  getItemById: [
    param('id')
      .isUUID()
      .withMessage('Valid catalog item ID is required')
  ]
};

// Basket validation rules
const basketValidation = {
  addItem: [
    body('catalogItemId')
      .isUUID()
      .withMessage('Valid catalog item ID is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100')
  ],

  updateItem: [
    param('itemId')
      .isUUID()
      .withMessage('Valid basket item ID is required'),
    body('quantity')
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100')
  ],

  removeItem: [
    param('itemId')
      .isUUID()
      .withMessage('Valid basket item ID is required')
  ],

  transferBasket: [
    body('sessionId')
      .notEmpty()
      .withMessage('Session ID is required')
  ]
};

// Order validation rules
const orderValidation = {
  createOrder: [
    body('shipToAddress_Street')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Street address must be between 5 and 200 characters'),
    body('shipToAddress_City')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City must be between 2 and 100 characters'),
    body('shipToAddress_State')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('State must be between 2 and 100 characters'),
    body('shipToAddress_Country')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Country must be between 2 and 100 characters'),
    body('shipToAddress_ZipCode')
      .trim()
      .matches(/^[0-9]{5}(-[0-9]{4})?$/)
      .withMessage('ZIP code must be in format 12345 or 12345-6789'),
    body('paymentMethod')
      .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
      .withMessage('Invalid payment method'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters')
  ],

  getOrders: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status')
  ],

  getOrderById: [
    param('id')
      .isUUID()
      .withMessage('Valid order ID is required')
  ],

  updateOrderStatus: [
    param('id')
      .isUUID()
      .withMessage('Valid order ID is required'),
    body('status')
      .optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    body('paymentStatus')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'refunded'])
      .withMessage('Invalid payment status'),
    body('trackingNumber')
      .optional()
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('Tracking number must be between 5 and 50 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters')
  ]
};

// Review validation rules
const reviewValidation = {
  createReview: [
    body('catalogItemId')
      .isUUID()
      .withMessage('Valid catalog item ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Review title must be between 5 and 100 characters'),
    body('comment')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Review comment must be between 10 and 1000 characters')
  ],

  updateReview: [
    param('id')
      .isUUID()
      .withMessage('Valid review ID is required'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Review title must be between 5 and 100 characters'),
    body('comment')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Review comment must be between 10 and 1000 characters')
  ],

  getProductReviews: [
    param('catalogItemId')
      .isUUID()
      .withMessage('Valid catalog item ID is required'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'rating', 'helpfulCount'])
      .withMessage('Sort by must be one of: createdAt, rating, helpfulCount'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC')
  ]
};

// Wishlist validation rules
const wishlistValidation = {
  addToWishlist: [
    body('catalogItemId')
      .isUUID()
      .withMessage('Valid catalog item ID is required')
  ],

  removeFromWishlist: [
    param('id')
      .isUUID()
      .withMessage('Valid wishlist item ID is required')
  ],

  checkWishlistItem: [
    param('catalogItemId')
      .isUUID()
      .withMessage('Valid catalog item ID is required')
  ],

  getWishlist: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ]
};

// Common parameter validations
const commonValidation = {
  uuidParam: (paramName) => [
    param(paramName)
      .isUUID()
      .withMessage(`Valid ${paramName} is required`)
  ],

  paginationQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  userValidation,
  catalogValidation,
  basketValidation,
  orderValidation,
  reviewValidation,
  wishlistValidation,
  commonValidation
};
