'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create admin user
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      await queryInterface.bulkInsert('Users', [{
        id: adminId,
        email: 'admin@eshop.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }], { transaction });

      // Create demo customer
      const customerId = uuidv4();
      const customerPassword = await bcrypt.hash('Customer123!', 12);
      
      await queryInterface.bulkInsert('Users', [{
        id: customerId,
        email: 'customer@example.com',
        password: customerPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }], { transaction });

      // Create brands
      const brandData = [
        { id: uuidv4(), brand: 'Nike', description: 'Just Do It' },
        { id: uuidv4(), brand: 'Adidas', description: 'Impossible is Nothing' },
        { id: uuidv4(), brand: 'Apple', description: 'Think Different' },
        { id: uuidv4(), brand: 'Samsung', description: 'Do What You Can\'t' },
        { id: uuidv4(), brand: 'Sony', description: 'Be Moved' }
      ];
      await queryInterface.bulkInsert('CatalogBrands', brandData.map(b => ({ ...b, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })), { transaction });

      // Create types
      const typeData = [
        { id: uuidv4(), type: 'Shoes', description: 'Footwear' },
        { id: uuidv4(), type: 'Clothing', description: 'Apparel' },
        { id: uuidv4(), type: 'Electronics', description: 'Gadgets' },
        { id: uuidv4(), type: 'Accessories', description: 'Fashion and tech' },
        { id: uuidv4(), type: 'Sports Equipment', description: 'Fitness gear' }
      ];
      await queryInterface.bulkInsert('CatalogTypes', typeData.map(t => ({ ...t, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })), { transaction });

      // Create catalog items
      const catalogItems = [
        {
          id: uuidv4(),
          name: 'Nike Air Max 270',
          description: 'The Nike Air Max 270 delivers visible cushioning under every step.',
          price: 150.00,
          catalogTypeId: typeData.find(t => t.type === 'Shoes').id,
          catalogBrandId: brandData.find(b => b.brand === 'Nike').id,
          availableStock: 50,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'Adidas Ultraboost 22',
          description: 'These running shoes deliver incredible energy return with every step.',
          price: 180.00,
          catalogTypeId: typeData.find(t => t.type === 'Shoes').id,
          catalogBrandId: brandData.find(b => b.brand === 'Adidas').id,
          availableStock: 35,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'iPhone 15 Pro',
          description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip.',
          price: 999.00,
          catalogTypeId: typeData.find(t => t.type === 'Electronics').id,
          catalogBrandId: brandData.find(b => b.brand === 'Apple').id,
          availableStock: 25,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      await queryInterface.bulkInsert('CatalogItems', catalogItems, { transaction });

      await transaction.commit();
      console.log('✅ Demo data seeded successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error seeding demo data:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete('CatalogItems', null, { transaction });
      await queryInterface.bulkDelete('CatalogTypes', null, { transaction });
      await queryInterface.bulkDelete('CatalogBrands', null, { transaction });
      await queryInterface.bulkDelete('Users', null, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
// Updated: 2025-09-04 16:51:05
