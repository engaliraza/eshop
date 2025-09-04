'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Wishlists', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
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
    await queryInterface.addIndex('Wishlists', ['userId']);
    await queryInterface.addIndex('Wishlists', ['catalogItemId']);
    await queryInterface.addIndex('Wishlists', ['userId', 'catalogItemId'], {
      unique: true,
      name: 'user_catalog_item_wishlist_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Wishlists');
  }
};

// Updated: 2025-09-04 16:51:05
