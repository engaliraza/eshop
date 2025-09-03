'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    pictureFileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pictureUri: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'CatalogItems',
    timestamps: true,
    indexes: [
      {
        fields: ['catalogTypeId']
      },
      {
        fields: ['catalogBrandId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['price']
      }
    ]
  });

  CatalogItem.associate = (models) => {
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
  };

  return CatalogItem;
};