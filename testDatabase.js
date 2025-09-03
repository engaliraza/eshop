const sqlite3 = require('sqlite3').verbose();

console.log('🔍 Testing database connection and data...');

const db = new sqlite3.Database('./dev.sqlite', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Test queries
db.all("SELECT * FROM CatalogItems LIMIT 5", [], (err, rows) => {
  if (err) {
    console.error('❌ Error querying CatalogItems:', err.message);
  } else {
    console.log('✅ Sample products from database:');
    rows.forEach(row => {
      console.log(`   - ${row.name}: $${row.price}`);
    });
  }

  db.all("SELECT * FROM CatalogBrands", [], (err, brands) => {
    if (err) {
      console.error('❌ Error querying CatalogBrands:', err.message);
    } else {
      console.log('✅ Brands in database:');
      brands.forEach(brand => {
        console.log(`   - ${brand.brand}: ${brand.description}`);
      });
    }

    db.all("SELECT * FROM CatalogTypes", [], (err, types) => {
      if (err) {
        console.error('❌ Error querying CatalogTypes:', err.message);
      } else {
        console.log('✅ Types in database:');
        types.forEach(type => {
          console.log(`   - ${type.type}: ${type.description}`);
        });
      }

      console.log('🎯 Database test completed');
      db.close();
    });
  });
});
