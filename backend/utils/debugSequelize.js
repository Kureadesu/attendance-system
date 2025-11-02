// utils/debugSequelize.js
import { Sequelize } from 'sequelize';

console.log('🔍 Debugging Sequelize connection...');

// Test with VERY explicit configuration
const sequelize = new Sequelize({
  database: 'attendance_system',
  username: 'root',
  password: 'kUreadesu3',
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  logging: console.log, // This will show the actual connection attempt
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Override the constructor to see what's being passed
const originalConstructor = Sequelize.prototype.constructor;
Sequelize.prototype.constructor = function(...args) {
  console.log('\n🔧 Sequelize constructor called with:');
  console.log('   Args:', args);
  return originalConstructor.apply(this, args);
};

const testConnection = async () => {
  try {
    console.log('\n🔄 Attempting to connect...');
    await sequelize.authenticate();
    console.log('✅ Sequelize connection successful!');
    
  } catch (error) {
    console.error('❌ Sequelize connection failed:', error.message);
    console.error('   Full error:', error);
    
  } finally {
    await sequelize.close();
  }
};

testConnection();