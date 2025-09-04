'use strict';
module.exports = (sequelize, DataTypes) => {
  const CatalogType = sequelize.define('CatalogType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 50]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    iconUri: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  CatalogType.associate = function(models) {
    CatalogType.hasMany(models.CatalogItem, { 
      foreignKey: 'catalogTypeId', 
      as: 'catalogItems' 
    });
  };

  return CatalogType;
};
// Updated: 2025-09-04 16:51:05
