'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    shipping: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    // Shipping Address
    shipToAddress_Street: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipToAddress_City: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipToAddress_State: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipToAddress_Country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipToAddress_ZipCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Payment Information
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'cash_on_delivery'),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    transactionId: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    trackingNumber: {
      type: DataTypes.STRING
    },
    estimatedDeliveryDate: {
      type: DataTypes.DATE
    },
    actualDeliveryDate: {
      type: DataTypes.DATE
    }
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
  };

  return Order;
};