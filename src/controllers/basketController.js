const { Basket, BasketItem, CatalogItem, User } = require('../models');
const { validationResult } = require('express-validator');

// Get or create basket for user
const getOrCreateBasket = async (userId, sessionId = null) => {
  let basket;
  
  if (userId) {
    basket = await Basket.findOne({
      where: { userId, isActive: true },
      include: [
        {
          model: BasketItem,
          as: 'basketItems',
          include: [
            {
              model: CatalogItem,
              as: 'catalogItem',
              attributes: ['id', 'name', 'price', 'pictureUri', 'availableStock']
            }
          ]
        }
      ]
    });
    
    if (!basket) {
      basket = await Basket.create({ userId });
      basket.basketItems = [];
    }
  } else if (sessionId) {
    basket = await Basket.findOne({
      where: { sessionId, isActive: true },
      include: [
        {
          model: BasketItem,
          as: 'basketItems',
          include: [
            {
              model: CatalogItem,
              as: 'catalogItem',
              attributes: ['id', 'name', 'price', 'pictureUri', 'availableStock']
            }
          ]
        }
      ]
    });
    
    if (!basket) {
      basket = await Basket.create({ sessionId });
      basket.basketItems = [];
    }
  }
  
  return basket;
};

// Get user's basket
const getBasket = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const basket = await getOrCreateBasket(userId, sessionId);

    // Calculate totals
    const totalItems = basket.basketItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = basket.basketItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );

    res.json({
      success: true,
      data: {
        basket: {
          id: basket.id,
          items: basket.basketItems,
          totalItems,
          totalPrice: totalPrice.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Get basket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add item to basket
const addItemToBasket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { catalogItemId, quantity = 1 } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    // Check if catalog item exists and is available
    const catalogItem = await CatalogItem.findOne({
      where: { id: catalogItemId, isActive: true }
    });

    if (!catalogItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (catalogItem.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    const basket = await getOrCreateBasket(userId, sessionId);

    // Check if item already exists in basket
    let basketItem = await BasketItem.findOne({
      where: { basketId: basket.id, catalogItemId }
    });

    if (basketItem) {
      // Update quantity
      const newQuantity = basketItem.quantity + parseInt(quantity);
      
      if (catalogItem.availableStock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }
      
      await basketItem.update({ 
        quantity: newQuantity,
        unitPrice: catalogItem.price
      });
    } else {
      // Create new basket item
      basketItem = await BasketItem.create({
        basketId: basket.id,
        catalogItemId,
        quantity: parseInt(quantity),
        unitPrice: catalogItem.price
      });
    }

    // Update basket last modified
    await basket.update({ lastModified: new Date() });

    // Get updated basket
    const updatedBasket = await getOrCreateBasket(userId, sessionId);
    const totalItems = updatedBasket.basketItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = updatedBasket.basketItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );

    res.json({
      success: true,
      message: 'Item added to basket successfully',
      data: {
        basket: {
          id: updatedBasket.id,
          items: updatedBasket.basketItems,
          totalItems,
          totalPrice: totalPrice.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Add item to basket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update basket item quantity
const updateBasketItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const basket = await getOrCreateBasket(userId, sessionId);
    
    const basketItem = await BasketItem.findOne({
      where: { id: itemId, basketId: basket.id },
      include: [
        {
          model: CatalogItem,
          as: 'catalogItem'
        }
      ]
    });

    if (!basketItem) {
      return res.status(404).json({
        success: false,
        message: 'Basket item not found'
      });
    }

    if (basketItem.catalogItem.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    await basketItem.update({ 
      quantity: parseInt(quantity),
      unitPrice: basketItem.catalogItem.price
    });

    // Update basket last modified
    await basket.update({ lastModified: new Date() });

    // Get updated basket
    const updatedBasket = await getOrCreateBasket(userId, sessionId);
    const totalItems = updatedBasket.basketItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = updatedBasket.basketItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );

    res.json({
      success: true,
      message: 'Basket item updated successfully',
      data: {
        basket: {
          id: updatedBasket.id,
          items: updatedBasket.basketItems,
          totalItems,
          totalPrice: totalPrice.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Update basket item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Remove item from basket
const removeBasketItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const basket = await getOrCreateBasket(userId, sessionId);
    
    const basketItem = await BasketItem.findOne({
      where: { id: itemId, basketId: basket.id }
    });

    if (!basketItem) {
      return res.status(404).json({
        success: false,
        message: 'Basket item not found'
      });
    }

    await basketItem.destroy();

    // Update basket last modified
    await basket.update({ lastModified: new Date() });

    // Get updated basket
    const updatedBasket = await getOrCreateBasket(userId, sessionId);
    const totalItems = updatedBasket.basketItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = updatedBasket.basketItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );

    res.json({
      success: true,
      message: 'Item removed from basket successfully',
      data: {
        basket: {
          id: updatedBasket.id,
          items: updatedBasket.basketItems,
          totalItems,
          totalPrice: totalPrice.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Remove basket item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Clear entire basket
const clearBasket = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const basket = await getOrCreateBasket(userId, sessionId);
    
    await BasketItem.destroy({
      where: { basketId: basket.id }
    });

    // Update basket last modified
    await basket.update({ lastModified: new Date() });

    res.json({
      success: true,
      message: 'Basket cleared successfully',
      data: {
        basket: {
          id: basket.id,
          items: [],
          totalItems: 0,
          totalPrice: '0.00'
        }
      }
    });
  } catch (error) {
    console.error('Clear basket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Transfer anonymous basket to user basket
const transferBasket = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Find anonymous basket
    const anonymousBasket = await Basket.findOne({
      where: { sessionId, isActive: true },
      include: [
        {
          model: BasketItem,
          as: 'basketItems'
        }
      ]
    });

    if (!anonymousBasket || anonymousBasket.basketItems.length === 0) {
      return res.json({
        success: true,
        message: 'No items to transfer'
      });
    }

    // Get or create user basket
    const userBasket = await getOrCreateBasket(userId);

    // Transfer items
    for (const item of anonymousBasket.basketItems) {
      const existingItem = await BasketItem.findOne({
        where: { 
          basketId: userBasket.id, 
          catalogItemId: item.catalogItemId 
        }
      });

      if (existingItem) {
        // Update quantity
        await existingItem.update({
          quantity: existingItem.quantity + item.quantity,
          unitPrice: item.unitPrice
        });
      } else {
        // Create new item
        await BasketItem.create({
          basketId: userBasket.id,
          catalogItemId: item.catalogItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });
      }
    }

    // Deactivate anonymous basket
    await anonymousBasket.update({ isActive: false });

    // Get updated user basket
    const updatedBasket = await getOrCreateBasket(userId);
    const totalItems = updatedBasket.basketItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = updatedBasket.basketItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );

    res.json({
      success: true,
      message: 'Basket transferred successfully',
      data: {
        basket: {
          id: updatedBasket.id,
          items: updatedBasket.basketItems,
          totalItems,
          totalPrice: totalPrice.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Transfer basket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getBasket,
  addItemToBasket,
  updateBasketItem,
  removeBasketItem,
  clearBasket,
  transferBasket
};
// Updated: 2025-09-04 16:51:05
