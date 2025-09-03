const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Database connection
const db = new sqlite3.Database('./dev.sqlite');

// API Routes
app.get('/api/v1/catalog/items', (req, res) => {
  console.log('📦 Fetching catalog items...');
  
  const query = `
    SELECT 
      ci.*,
      cb.brand as brandName,
      cb.description as brandDescription,
      ct.type as typeName,
      ct.description as typeDescription
    FROM CatalogItems ci
    LEFT JOIN CatalogBrands cb ON ci.catalogBrandId = cb.id
    LEFT JOIN CatalogTypes ct ON ci.catalogTypeId = ct.id
    WHERE ci.isActive = 1
    ORDER BY ci.name ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: err.message
      });
    }

    console.log(`✅ Found ${rows.length} products`);
    
    const formattedData = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      availableStock: row.availableStock,
      isActive: row.isActive,
      catalogBrand: {
        id: row.catalogBrandId,
        brand: row.brandName,
        description: row.brandDescription
      },
      catalogType: {
        id: row.catalogTypeId,
        type: row.typeName,
        description: row.typeDescription
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));

    res.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    });
  });
});

app.get('/api/v1/catalog/brands', (req, res) => {
  console.log('🏷️ Fetching brands...');
  
  db.all('SELECT * FROM CatalogBrands ORDER BY brand ASC', [], (err, rows) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch brands',
        error: err.message
      });
    }

    console.log(`✅ Found ${rows.length} brands`);
    res.json({
      success: true,
      data: rows
    });
  });
});

app.get('/api/v1/catalog/types', (req, res) => {
  console.log('📂 Fetching types...');
  
  db.all('SELECT * FROM CatalogTypes ORDER BY type ASC', [], (err, rows) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch types',
        error: err.message
      });
    }

    console.log(`✅ Found ${rows.length} types`);
    res.json({
      success: true,
      data: rows
    });
  });
});

// Basic basket endpoint (placeholder)
app.get('/api/v1/basket', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'temp-basket',
      items: [],
      totalItems: 0,
      totalPrice: 0
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 Simple eShop server running on port:', port);
  console.log('📱 Environment: development');
  console.log('🔗 API Base URL:', `http://localhost:${port}/api/v1`);
  console.log('✅ Ready to serve your React frontend!');
});
