'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OrderItems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Orders',
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
        onDelete: 'RESTRICT'
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      productDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pictureUri: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.addIndex('OrderItems', ['orderId']);
    await queryInterface.addIndex('OrderItems', ['catalogItemId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('OrderItems');
  }
};
