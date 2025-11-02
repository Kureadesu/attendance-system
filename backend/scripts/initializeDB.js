// backend/scripts/initializeDB.js
import { sequelize } from '../models/index.js';
import initializeData from '../utils/initializeData.js';

const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ force: false }); // Use { force: true } only in development to drop tables
    
    // Run your initialization script
    await initializeData();
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();