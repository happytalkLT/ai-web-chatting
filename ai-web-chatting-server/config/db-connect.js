const AppDataSource = require('./database');

let isConnected = false;

async function initializeDatabase() {
  if (isConnected) {
    console.log('Database already connected');
    return AppDataSource;
  }

  try {
    await AppDataSource.initialize();
    isConnected = true;
    console.log('✅ Database connection established successfully');
    console.log(`📍 Connected to MySQL database: ${process.env.DB_NAME}`);
    
    return AppDataSource;
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
}

async function closeDatabase() {
  if (!isConnected) {
    console.log('Database is not connected');
    return;
  }

  try {
    await AppDataSource.destroy();
    isConnected = false;
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error during database closure:', error);
    throw error;
  }
}

function getRepository(entity) {
  if (!isConnected) {
    throw new Error('Database is not connected. Call initializeDatabase() first.');
  }
  return AppDataSource.getRepository(entity);
}

function getDataSource() {
  if (!isConnected) {
    throw new Error('Database is not connected. Call initializeDatabase() first.');
  }
  return AppDataSource;
}

module.exports = {
  initializeDatabase,
  closeDatabase,
  getRepository,
  getDataSource,
  isConnected: () => isConnected
};