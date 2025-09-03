const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './dev.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  },
  production: {
    dialect: 'sqlite',
    storage: './production.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
};