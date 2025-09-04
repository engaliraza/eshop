'use strict';
module.exports = (sequelize, DataTypes) => {
  const BasketItem = sequelize.define('BasketItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    basketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Baskets',
        key: 'id'
      }
    },
    catalogItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CatalogItems',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['basketId', 'catalogItemId']
      }
    ]
  });

  BasketItem.associate = function(models) {
    BasketItem.belongsTo(models.Basket, { foreignKey: 'basketId', as: 'basket' });
    BasketItem.belongsTo(models.CatalogItem, { foreignKey: 'catalogItemId', as: 'catalogItem' });
  };

  return BasketItem;
};
// Updated: 2025-09-04 16:51:05
