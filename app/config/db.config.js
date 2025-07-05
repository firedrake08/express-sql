require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Database configuration
module.exports = {
  HOST: process.env.DB_HOST || 'localhost',
  USER: process.env.DB_USER || 'root',
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME || 'testdb',
  dialect: process.env.DB_DIALECT || 'mysql',
  
  // Connection pool configuration
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 5,
    min: parseInt(process.env.DB_POOL_MIN) || 0,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
  
  // Additional Sequelize options
  define: {
    timestamps: true, // Enable timestamps by default
    underscored: true, // Use snake_case for automatically added attributes
    freezeTableName: true, // Don't pluralize table names
    paranoid: true, // Enable soft deletes
  },
  
  // Logging configuration
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  
  // Connection retry configuration
  retry: {
    max: 3,
    timeout: 60000,
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /TIMEOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTDOWN/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  }
};
