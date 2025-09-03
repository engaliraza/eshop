'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reviews', {
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isVerifiedPurchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      helpfulCount: {
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

    // Add indexes and constraints
    await queryInterface.addIndex('Reviews', ['userId']);
    await queryInterface.addIndex('Reviews', ['catalogItemId']);
    await queryInterface.addIndex('Reviews', ['rating']);
    await queryInterface.addIndex('Reviews', ['createdAt']);
    await queryInterface.addIndex('Reviews', ['userId', 'catalogItemId'], {
      unique: true,
      name: 'user_catalog_item_review_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reviews');
  }
};
