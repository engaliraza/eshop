const { CatalogItem, CatalogBrand, CatalogType } = require('../models');
const { Op } = require('sequelize');

// Get all catalog items with filtering and pagination
const getCatalogItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'name',
      sortOrder = 'ASC',
      brandId,
      typeId,
      minPrice,
      maxPrice,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    // Apply filters
    if (brandId) {
      where.catalogBrandId = brandId;
    }

    if (typeId) {
      where.catalogTypeId = typeId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await CatalogItem.findAndCountAll({
      where,
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
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching catalog items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog items',
      error: error.message
    });
  }
};

// Get catalog item by ID
const getCatalogItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await CatalogItem.findOne({
      where: { id, isActive: true },
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
      ]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Error fetching catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Get all catalog brands
const getCatalogBrands = async (req, res) => {
  try {
    const brands = await CatalogBrand.findAll({
      order: [['brand', 'ASC']]
    });

    res.json({
      success: true,
      data: brands
    });

  } catch (error) {
    console.error('Error fetching catalog brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
};

// Get all catalog types
const getCatalogTypes = async (req, res) => {
  try {
    const types = await CatalogType.findAll({
      order: [['type', 'ASC']]
    });

    res.json({
      success: true,
      data: types
    });

  } catch (error) {
    console.error('Error fetching catalog types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch types',
      error: error.message
    });
  }
};

// Create new catalog item (Admin only)
const createCatalogItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      catalogTypeId,
      catalogBrandId,
      availableStock = 0
    } = req.body;

    const newItem = await CatalogItem.create({
      name,
      description,
      price: parseFloat(price),
      catalogTypeId,
      catalogBrandId,
      availableStock: parseInt(availableStock),
      isActive: true
    });

    const item = await CatalogItem.findOne({
      where: { id: newItem.id },
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
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: item
    });

  } catch (error) {
    console.error('Error creating catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update catalog item (Admin only)
const updateCatalogItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedRowsCount] = await CatalogItem.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedItem = await CatalogItem.findOne({
      where: { id },
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
      ]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Error updating catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete catalog item (Admin only)
const deleteCatalogItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await CatalogItem.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
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
  deleteCatalogItem
};
// Updated: 2025-09-04 16:51:05
