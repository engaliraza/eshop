'use strict';
module.exports = (sequelize, DataTypes) => {
  const CatalogItem = sequelize.define('CatalogItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    pictureFileName: {
      type: DataTypes.STRING
    },
    pictureUri: {
      type: DataTypes.STRING
    },
    catalogTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CatalogTypes',
        key: 'id'
      }
    },
    catalogBrandId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CatalogBrands',
        key: 'id'
      }
    },
    availableStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    restockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maxStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    onReorder: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  CatalogItem.associate = function(models) {
    CatalogItem.belongsTo(models.CatalogType, { 
      foreignKey: 'catalogTypeId', 
      as: 'catalogType' 
    });
    CatalogItem.belongsTo(models.CatalogBrand, { 
      foreignKey: 'catalogBrandId', 
      as: 'catalogBrand' 
    });
    CatalogItem.hasMany(models.BasketItem, { 
      foreignKey: 'catalogItemId', 
      as: 'basketItems' 
    });
    CatalogItem.hasMany(models.OrderItem, { 
      foreignKey: 'catalogItemId', 
      as: 'orderItems' 
    });
    CatalogItem.hasMany(models.Review, { 
      foreignKey: 'catalogItemId', 
      as: 'reviews' 
    });
    CatalogItem.hasMany(models.Wishlist, { 
      foreignKey: 'catalogItemId', 
      as: 'wishlists' 
    });
  };

  return CatalogItem;
};