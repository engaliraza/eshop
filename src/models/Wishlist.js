'use strict';
module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
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
    catalogItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CatalogItems',
        key: 'id'
      }
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'catalogItemId']
      }
    ]
  });

  Wishlist.associate = function(models) {
    Wishlist.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Wishlist.belongsTo(models.CatalogItem, { foreignKey: 'catalogItemId', as: 'catalogItem' });
  };

  return Wishlist;
};
