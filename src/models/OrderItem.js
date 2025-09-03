'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Orders',
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
    productName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productDescription: {
      type: DataTypes.TEXT
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    pictureUri: {
      type: DataTypes.STRING
    }
  });

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    OrderItem.belongsTo(models.CatalogItem, { foreignKey: 'catalogItemId', as: 'catalogItem' });
  };

  return OrderItem;
};