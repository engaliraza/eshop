const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
require('dotenv').config();

// Import middleware
const { setupSecurity } = require('./middleware/security');
const { generalRateLimit, apiRateLimit } = require('./middleware/auth');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const basketRoutes = require('./routes/basketRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import models and database
const { Sequelize } = require('sequelize');
const db = require('./models');

// Force SQLite connection for development
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './dev.sqlite',
  logging: false // Quieter logs
});

const app = express();
const port = 5001; // Hardcode the port to 5001

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
setupSecurity(app);

// Session configuration
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'Sessions',
  checkExpirationInterval: 15 * 60 * 1000, // 15 minutes
  expiration: 24 * 60 * 60 * 1000 // 24 hours
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiRateLimit);
app.use(generalRateLimit);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/basket', basketRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/admin', adminRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync session store
    await sessionStore.sync();
    console.log('✅ Session store synchronized.');

    // Sync database models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }

    // Start server
    const server = app.listen(port, () => {
      console.log(`🚀 Server is running on port: ${port}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated');
        sequelize.close();
      });
    });

    process.on('SIGINT', () => {
      console.log('👋 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated');
        sequelize.close();
      });
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('💥 Unhandled Promise Rejection:', err.message);
  console.log('Shutting down the server due to unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('💥 Uncaught Exception:', err.message);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;