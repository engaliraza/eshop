const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

console.log('🌱 Starting database population...');

// Open database connection
const db = new sqlite3.Database('./dev.sqlite', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Function to create tables and insert data
function populateDatabase() {
  // Create tables
  const createTables = `
    CREATE TABLE IF NOT EXISTS CatalogBrands (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CatalogTypes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CatalogItems (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      catalogTypeId TEXT,
      catalogBrandId TEXT,
      availableStock INTEGER DEFAULT 0,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (catalogTypeId) REFERENCES CatalogTypes(id),
      FOREIGN KEY (catalogBrandId) REFERENCES CatalogBrands(id)
    );

    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      role TEXT DEFAULT 'customer',
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Baskets (
      id TEXT PRIMARY KEY,
      userId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS BasketItems (
      id TEXT PRIMARY KEY,
      basketId TEXT,
      catalogItemId TEXT,
      quantity INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (basketId) REFERENCES Baskets(id),
      FOREIGN KEY (catalogItemId) REFERENCES CatalogItems(id)
    );
  `;

  db.exec(createTables, (err) => {
    if (err) {
      console.error('❌ Error creating tables:', err.message);
      return;
    }
    console.log('✅ Tables created successfully');

    // Generate UUIDs for brands and types
    const brandIds = {
      nike: uuidv4(),
      adidas: uuidv4(),
      apple: uuidv4(),
      samsung: uuidv4(),
      sony: uuidv4()
    };

    const typeIds = {
      shoes: uuidv4(),
      clothing: uuidv4(),
      electronics: uuidv4(),
      accessories: uuidv4(),
      sports: uuidv4()
    };

    // Insert brands
    const insertBrands = db.prepare(`
      INSERT OR REPLACE INTO CatalogBrands (id, brand, description, createdAt, updatedAt) 
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);

    const brands = [
      [brandIds.nike, 'Nike', 'Just Do It'],
      [brandIds.adidas, 'Adidas', 'Impossible is Nothing'],
      [brandIds.apple, 'Apple', 'Think Different'],
      [brandIds.samsung, 'Samsung', 'Do What You Can\'t'],
      [brandIds.sony, 'Sony', 'Be Moved']
    ];

    brands.forEach(brand => {
      insertBrands.run(brand, (err) => {
        if (err) console.error('Error inserting brand:', err.message);
      });
    });
    insertBrands.finalize();
    console.log('✅ Brands inserted');

    // Insert types
    const insertTypes = db.prepare(`
      INSERT OR REPLACE INTO CatalogTypes (id, type, description, createdAt, updatedAt) 
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);

    const types = [
      [typeIds.shoes, 'Shoes', 'Footwear'],
      [typeIds.clothing, 'Clothing', 'Apparel'],
      [typeIds.electronics, 'Electronics', 'Gadgets'],
      [typeIds.accessories, 'Accessories', 'Fashion and tech'],
      [typeIds.sports, 'Sports Equipment', 'Fitness gear']
    ];

    types.forEach(type => {
      insertTypes.run(type, (err) => {
        if (err) console.error('Error inserting type:', err.message);
      });
    });
    insertTypes.finalize();
    console.log('✅ Types inserted');

    // Insert catalog items
    const insertItems = db.prepare(`
      INSERT OR REPLACE INTO CatalogItems (id, name, description, price, catalogTypeId, catalogBrandId, availableStock, isActive, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const items = [
      [uuidv4(), 'Nike Air Max 270', 'The Nike Air Max 270 delivers visible cushioning under every step.', 150.00, typeIds.shoes, brandIds.nike, 50, 1],
      [uuidv4(), 'Adidas Ultraboost 22', 'These running shoes deliver incredible energy return with every step.', 180.00, typeIds.shoes, brandIds.adidas, 35, 1],
      [uuidv4(), 'iPhone 15 Pro', 'Forged in titanium and featuring the groundbreaking A17 Pro chip.', 999.00, typeIds.electronics, brandIds.apple, 25, 1],
      [uuidv4(), 'Nike Air Force 1', 'The classic basketball shoe that never goes out of style.', 120.00, typeIds.shoes, brandIds.nike, 40, 1],
      [uuidv4(), 'Adidas Stan Smith', 'The world\'s most popular tennis shoe.', 85.00, typeIds.shoes, brandIds.adidas, 60, 1],
      [uuidv4(), 'Samsung Galaxy S24', 'The latest flagship smartphone with AI features.', 799.00, typeIds.electronics, brandIds.samsung, 30, 1],
      [uuidv4(), 'Nike Dri-FIT T-Shirt', 'Moisture-wicking fabric keeps you dry and comfortable.', 35.00, typeIds.clothing, brandIds.nike, 100, 1],
      [uuidv4(), 'Adidas Track Jacket', 'Classic 3-stripes design with modern comfort.', 75.00, typeIds.clothing, brandIds.adidas, 45, 1],
      [uuidv4(), 'Sony WH-1000XM5', 'Industry-leading noise canceling headphones.', 399.00, typeIds.electronics, brandIds.sony, 20, 1],
      [uuidv4(), 'Nike Sports Watch', 'Track your fitness goals with precision.', 249.00, typeIds.accessories, brandIds.nike, 15, 1]
    ];

    items.forEach(item => {
      insertItems.run(item, (err) => {
        if (err) console.error('Error inserting item:', err.message);
      });
    });
    insertItems.finalize();
    console.log('✅ Catalog items inserted');

    // Create admin user
    bcrypt.hash('Admin123!', 12, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing admin password:', err.message);
        return;
      }

      const insertAdmin = db.prepare(`
        INSERT OR REPLACE INTO Users (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      insertAdmin.run([uuidv4(), 'admin@eshop.com', hashedPassword, 'Admin', 'User', 'admin', 1], (err) => {
        if (err) console.error('Error inserting admin:', err.message);
        else console.log('✅ Admin user created');
      });
      insertAdmin.finalize();

      // Create demo customer
      bcrypt.hash('Customer123!', 12, (err, customerHashedPassword) => {
        if (err) {
          console.error('Error hashing customer password:', err.message);
          return;
        }

        const insertCustomer = db.prepare(`
          INSERT OR REPLACE INTO Users (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) 
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `);

        insertCustomer.run([uuidv4(), 'customer@example.com', customerHashedPassword, 'John', 'Doe', 'customer', 1], (err) => {
          if (err) console.error('Error inserting customer:', err.message);
          else console.log('✅ Demo customer created');
        });
        insertCustomer.finalize();

        // Verify data
        db.all("SELECT COUNT(*) as count FROM CatalogItems", [], (err, result) => {
          if (err) {
            console.error('Error counting items:', err.message);
          } else {
            console.log(`📊 Total products in database: ${result[0].count}`);
          }

          db.all("SELECT COUNT(*) as count FROM CatalogBrands", [], (err, result) => {
            if (err) {
              console.error('Error counting brands:', err.message);
            } else {
              console.log(`📊 Total brands in database: ${result[0].count}`);
            }

            db.all("SELECT COUNT(*) as count FROM CatalogTypes", [], (err, result) => {
              if (err) {
                console.error('Error counting types:', err.message);
              } else {
                console.log(`📊 Total types in database: ${result[0].count}`);
              }

              console.log('🎉 Database population completed successfully!');
              console.log('🚀 You can now start your Node.js backend server');
              
              db.close((err) => {
                if (err) {
                  console.error('Error closing database:', err.message);
                } else {
                  console.log('✅ Database connection closed');
                }
              });
            });
          });
        });
      });
    });
  });
}

// Run the population
populateDatabase();

# Updated: 2025-09-04 16:47:56

 / /   R e p o s i t o r y   u p d a t e d   f o r   N o d e . j s / R e a c t   m i g r a t i o n :   0 9 / 0 4 / 2 0 2 5   1 6 : 5 3 : 5 6  
 