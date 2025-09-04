'use strict';
module.exports = (sequelize, DataTypes) => {
  const CatalogBrand = sequelize.define('CatalogBrand', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    brand: {
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
    logoUri: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  CatalogBrand.associate = function(models) {
    CatalogBrand.hasMany(models.CatalogItem, { 
      foreignKey: 'catalogBrandId', 
      as: 'catalogItems' 
    });
  };

  return CatalogBrand;
};
// Updated: 2025-09-04 16:51:05
