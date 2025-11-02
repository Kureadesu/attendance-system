// config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory with error handling
console.log('📁 Loading environment variables...');
const envPath = path.join(__dirname, '..', '.env');
console.log('Looking for .env at:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ ERROR loading .env file:', result.error.message);
  throw new Error('Failed to load .env file');
}

console.log('✅ .env file loaded successfully');

// Verify all required environment variables are present
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  throw new Error(`Missing: ${missingVars.join(', ')}`);
}

console.log('🔧 Database Configuration:');
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NOT SET');

// Use connection string method (most reliable)
const connectionString = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:3306/${process.env.DB_NAME}`;

const sequelize = new Sequelize(connectionString, {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

export default sequelize;