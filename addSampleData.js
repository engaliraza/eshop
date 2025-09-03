const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./dev.sqlite');

async function addSampleData() {
  console.log('🌱 Adding sample data to database...');

  try {
    // First, let's check what tables exist
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('Error checking tables:', err);
        return;
      }
      
      console.log('📋 Existing tables:', tables.map(t => t.name));
      
      // Create tables if they don't exist
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
      `;

      db.exec(createTables, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          return;
        }

        console.log('✅ Tables created/verified');

        // Insert sample data
        const brandId1 = uuidv4();
        const brandId2 = uuidv4();
        const brandId3 = uuidv4();
        
        const typeId1 = uuidv4();
        const typeId2 = uuidv4();

        // Insert brands
        const insertBrands = `
          INSERT OR IGNORE INTO CatalogBrands (id, brand, description) VALUES
          ('${brandId1}', 'Nike', 'Just Do It'),
          ('${brandId2}', 'Adidas', 'Impossible is Nothing'),
          ('${brandId3}', 'Apple', 'Think Different');
        `;

        // Insert types
        const insertTypes = `
          INSERT OR IGNORE INTO CatalogTypes (id, type, description) VALUES
          ('${typeId1}', 'Shoes', 'Footwear'),
          ('${typeId2}', 'Electronics', 'Gadgets');
        `;

        // Insert catalog items
        const insertItems = `
          INSERT OR IGNORE INTO CatalogItems (id, name, description, price, catalogTypeId, catalogBrandId, availableStock, isActive) VALUES
          ('${uuidv4()}', 'Nike Air Max 270', 'The Nike Air Max 270 delivers visible cushioning under every step.', 150.00, '${typeId1}', '${brandId1}', 50, 1),
          ('${uuidv4()}', 'Adidas Ultraboost 22', 'These running shoes deliver incredible energy return with every step.', 180.00, '${typeId1}', '${brandId2}', 35, 1),
          ('${uuidv4()}', 'iPhone 15 Pro', 'Forged in titanium and featuring the groundbreaking A17 Pro chip.', 999.00, '${typeId2}', '${brandId3}', 25, 1),
          ('${uuidv4()}', 'Nike Air Force 1', 'The classic basketball shoe that never goes out of style.', 120.00, '${typeId1}', '${brandId1}', 40, 1),
          ('${uuidv4()}', 'Adidas Stan Smith', 'The world''s most popular tennis shoe.', 85.00, '${typeId1}', '${brandId2}', 60, 1);
        `;

        db.exec(insertBrands, (err) => {
          if (err) console.error('Error inserting brands:', err);
          else console.log('✅ Brands inserted');

          db.exec(insertTypes, (err) => {
            if (err) console.error('Error inserting types:', err);
            else console.log('✅ Types inserted');

            db.exec(insertItems, (err) => {
              if (err) console.error('Error inserting items:', err);
              else console.log('✅ Catalog items inserted');

              // Insert admin user
              bcrypt.hash('Admin123!', 12, (err, hashedPassword) => {
                if (err) {
                  console.error('Error hashing password:', err);
                  return;
                }

                const insertAdmin = `
                  INSERT OR IGNORE INTO Users (id, email, password, firstName, lastName, role, isActive) VALUES
                  ('${uuidv4()}', 'admin@eshop.com', '${hashedPassword}', 'Admin', 'User', 'admin', 1);
                `;

                db.exec(insertAdmin, (err) => {
                  if (err) console.error('Error inserting admin:', err);
                  else console.log('✅ Admin user created');

                  // Verify data
                  db.all("SELECT COUNT(*) as count FROM CatalogItems", [], (err, result) => {
                    if (err) console.error('Error counting items:', err);
                    else console.log(`📊 Total products: ${result[0].count}`);

                    console.log('🎉 Sample data added successfully!');
                    db.close();
                  });
                });
              });
            });
          });
        });
      });
    });

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    db.close();
  }
}

addSampleData();
