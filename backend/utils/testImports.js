// utils/testImports.js
import sequelize from '../config/database.js';
import { Admin, Student, Subject, Attendance } from '../models/index.js';

console.log('✅ All imports successful!');
console.log('Sequelize:', typeof sequelize);
console.log('Admin:', typeof Admin);
console.log('Student:', typeof Student);
console.log('Subject:', typeof Subject);
console.log('Attendance:', typeof Attendance);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection test passed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
};

testConnection();