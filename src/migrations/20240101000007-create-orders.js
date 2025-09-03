'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
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
        onDelete: 'RESTRICT'
      },
      orderDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      shipping: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      shipToAddress_Street: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shipToAddress_City: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shipToAddress_State: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shipToAddress_Country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shipToAddress_ZipCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estimatedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actualDeliveryDate: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('Orders', ['userId']);
    await queryInterface.addIndex('Orders', ['status']);
    await queryInterface.addIndex('Orders', ['paymentStatus']);
    await queryInterface.addIndex('Orders', ['orderDate']);
    await queryInterface.addIndex('Orders', ['trackingNumber']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Orders');
  }
};