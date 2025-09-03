'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    role: {
      type: DataTypes.ENUM('customer', 'admin'),
      defaultValue: 'customer'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE
    },
    resetPasswordToken: {
      type: DataTypes.STRING
    },
    resetPasswordExpires: {
      type: DataTypes.DATE
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  });

  User.associate = function(models) {
    User.hasMany(models.Basket, { foreignKey: 'userId', as: 'baskets' });
    User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
    User.hasMany(models.Review, { foreignKey: 'userId', as: 'reviews' });
    User.hasMany(models.Wishlist, { foreignKey: 'userId', as: 'wishlists' });
  };

  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};