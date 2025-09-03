'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BasketItems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      basketId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Baskets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      catalogItemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'CatalogItems',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
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

    // Add indexes and constraints
    await queryInterface.addIndex('BasketItems', ['basketId']);
    await queryInterface.addIndex('BasketItems', ['catalogItemId']);
    await queryInterface.addIndex('BasketItems', ['basketId', 'catalogItemId'], {
      unique: true,
      name: 'basket_catalog_item_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BasketItems');
  }
};
