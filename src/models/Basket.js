'use strict';
module.exports = (sequelize, DataTypes) => {
  const Basket = sequelize.define('Basket', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow anonymous baskets
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true // For anonymous users
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastModified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    hooks: {
      beforeUpdate: (basket) => {
        basket.lastModified = new Date();
      }
    }
  });

  Basket.associate = function(models) {
    Basket.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Basket.hasMany(models.BasketItem, { foreignKey: 'basketId', as: 'basketItems' });
  };

  return Basket;
};