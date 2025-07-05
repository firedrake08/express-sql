const dbConfig = require('../config/db.config.js');
const { Sequelize } = require('sequelize');

// Create Sequelize instance with improved configuration
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0, // Use Sequelize.Op instead of string operators
  
  pool: dbConfig.pool,
  define: dbConfig.define,
  logging: dbConfig.logging,
  retry: dbConfig.retry,
  
  // Additional performance and security configurations
  dialectOptions: {
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // Enable SSL in production
    ...(process.env.NODE_ENV === 'production' && {
      ssl: {
        require: true,
        rejectUnauthorized: false // Set to true in production with proper certificates
      }
    })
  },
  
  // Query optimization
  query: {
    raw: false, // Return Sequelize instances by default
    nest: false,
    type: Sequelize.QueryTypes.SELECT
  }
});

// Database object
const db = {};

// Attach Sequelize and sequelize instance
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Tutorial = require('./tutorial.model.js')(sequelize, Sequelize);

// Define associations here if needed
// Example: db.Tutorial.hasMany(db.Comment);

// Add database utility methods
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

db.syncDatabase = async (options = {}) => {
  try {
    const syncOptions = {
      force: false,
      alter: process.env.NODE_ENV === 'development',
      ...options
    };
    
    await sequelize.sync(syncOptions);
    console.log('Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('Unable to sync database:', error);
    return false;
  }
};

db.closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully.');
    return true;
  } catch (error) {
    console.error('Error closing database connection:', error);
    return false;
  }
};

module.exports = db;
