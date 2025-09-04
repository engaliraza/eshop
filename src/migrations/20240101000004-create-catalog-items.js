'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CatalogItems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      pictureFileName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pictureUri: {
        type: Sequelize.STRING,
        allowNull: true
      },
      catalogTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'CatalogTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      catalogBrandId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'CatalogBrands',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      availableStock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      restockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      maxStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      onReorder: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      averageRating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
        allowNull: false
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('CatalogItems', ['name']);
    await queryInterface.addIndex('CatalogItems', ['catalogTypeId']);
    await queryInterface.addIndex('CatalogItems', ['catalogBrandId']);
    await queryInterface.addIndex('CatalogItems', ['price']);
    await queryInterface.addIndex('CatalogItems', ['isActive']);
    await queryInterface.addIndex('CatalogItems', ['availableStock']);
    await queryInterface.addIndex('CatalogItems', ['averageRating']);
    await queryInterface.addIndex('CatalogItems', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CatalogItems');
  }
};

// Updated: 2025-09-04 16:51:05
