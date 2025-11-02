// backend/utils/testConnection.js
import { Sequelize } from 'sequelize';

const testConnection = async () => {
  const sequelize = new Sequelize(
    'attendance_system',  // database name
    'root',               // username
    'kUreadesu3',         // password - your actual password
    {
      host: 'localhost',
      dialect: 'mysql',
      logging: true
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test if we can query
    const [results] = await sequelize.query('SELECT 1 + 1 AS result');
    console.log('✅ Query test passed:', results[0].result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.original) {
      console.error('   MySQL error:', error.original.message);
      
      // Common solutions
      if (error.original.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('\n💡 Solution: Check your MySQL username and password');
        console.log('   Try: mysql -u root -p');
      } else if (error.original.code === 'ER_BAD_DB_ERROR') {
        console.log('\n💡 Solution: Database does not exist');
        console.log('   Run: CREATE DATABASE attendance_system;');
      }
    }
  } finally {
    await sequelize.close();
  }
};

testConnection();