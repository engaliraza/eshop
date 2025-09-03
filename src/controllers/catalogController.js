const { CatalogItem, CatalogBrand, CatalogType, Review, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/products');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all catalog items with filtering, sorting, and pagination
const getCatalogItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      brandId,
      typeId,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'ASC',
      inStock = false
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const whereClause = { isActive: true };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (brandId) whereClause.catalogBrandId = brandId;
    if (typeId) whereClause.catalogTypeId = typeId;
    
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') {
      whereClause.availableStock = { [Op.gt]: 0 };
    }

    // Build order clause
    const validSortFields = ['name', 'price', 'createdAt', 'averageRating'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows: items } = await CatalogItem.findAndCountAll({
      where: whereClause,
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
      ],
      order: [[orderField, orderDirection]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get catalog items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single catalog item by ID
const getCatalogItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await CatalogItem.findOne({
      where: { id, isActive: true },
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
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Catalog item not found'
      });
    }

    res.json({
      success: true,
      data: { item }
    });
  } catch (error) {
    console.error('Get catalog item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get catalog brands
const getCatalogBrands = async (req, res) => {
  try {
    const brands = await CatalogBrand.findAll({
      where: { isActive: true },
      order: [['brand', 'ASC']],
      attributes: ['id', 'brand', 'description', 'logoUri']
    });

    res.json({
      success: true,
      data: { brands }
    });
  } catch (error) {
    console.error('Get catalog brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get catalog types
const getCatalogTypes = async (req, res) => {
  try {
    const types = await CatalogType.findAll({
      where: { isActive: true },
      order: [['type', 'ASC']],
      attributes: ['id', 'type', 'description', 'iconUri']
    });

    res.json({
      success: true,
      data: { types }
    });
  } catch (error) {
    console.error('Get catalog types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Create catalog item
const createCatalogItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      price,
      catalogTypeId,
      catalogBrandId,
      availableStock,
      restockThreshold,
      maxStockThreshold
    } = req.body;

    let pictureFileName = null;
    let pictureUri = null;

    if (req.file) {
      pictureFileName = req.file.filename;
      pictureUri = `/uploads/products/${req.file.filename}`;
    }

    const item = await CatalogItem.create({
      name,
      description,
      price: parseFloat(price),
      catalogTypeId,
      catalogBrandId,
      availableStock: parseInt(availableStock) || 0,
      restockThreshold: parseInt(restockThreshold) || 0,
      maxStockThreshold: parseInt(maxStockThreshold) || 0,
      pictureFileName,
      pictureUri
    });

    const createdItem = await CatalogItem.findByPk(item.id, {
      include: [
        { model: CatalogBrand, as: 'catalogBrand' },
        { model: CatalogType, as: 'catalogType' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Catalog item created successfully',
      data: { item: createdItem }
    });
  } catch (error) {
    console.error('Create catalog item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update catalog item
const updateCatalogItem = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const item = await CatalogItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Catalog item not found'
      });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.pictureFileName = req.file.filename;
      updateData.pictureUri = `/uploads/products/${req.file.filename}`;
      
      // Delete old image if exists
      if (item.pictureFileName) {
        try {
          await fs.unlink(path.join(__dirname, '../uploads/products', item.pictureFileName));
        } catch (error) {
          console.log('Error deleting old image:', error.message);
        }
      }
    }

    await item.update(updateData);

    const updatedItem = await CatalogItem.findByPk(id, {
      include: [
        { model: CatalogBrand, as: 'catalogBrand' },
        { model: CatalogType, as: 'catalogType' }
      ]
    });

    res.json({
      success: true,
      message: 'Catalog item updated successfully',
      data: { item: updatedItem }
    });
  } catch (error) {
    console.error('Update catalog item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Delete catalog item
const deleteCatalogItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await CatalogItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Catalog item not found'
      });
    }

    // Soft delete by setting isActive to false
    await item.update({ isActive: false });

    res.json({
      success: true,
      message: 'Catalog item deleted successfully'
    });
  } catch (error) {
    console.error('Delete catalog item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getCatalogItems,
  getCatalogItemById,
  getCatalogBrands,
  getCatalogTypes,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  upload
};