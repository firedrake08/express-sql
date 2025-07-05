// Global setup for Jest
module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'testdb_test';
  process.env.LOG_LEVEL = 'error';
  
  console.log('🧪 Test environment initialized');
};