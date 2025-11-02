// utils/testMySQLDirect.js
import mysql from 'mysql2/promise';

const testMySQLDirect = async () => {
  console.log('🔧 Testing MySQL connection directly...');
  
  const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: 'kUreadesu3',
    database: 'attendance_system'
  };

  console.log('Connection config:', {
    ...connectionConfig,
    password: '***' + connectionConfig.password.slice(-3)
  });

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('✅ MySQL connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Query test passed:', rows[0].result);
    
    // Check databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\n📊 Available databases:');
    databases.forEach(db => {
      console.log(`   - ${db.Database}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error number:', error.errno);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Password might be incorrect. Try:');
      console.log('   mysql -u root -p');
      console.log('   (enter your password to test)');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 MySQL service might not be running.');
      console.log('   Start MySQL service:');
      console.log('   - macOS: brew services start mysql');
      console.log('   - Ubuntu: sudo service mysql start');
      console.log('   - Windows: net start mysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database does not exist.');
      console.log('   Create it: CREATE DATABASE attendance_system;');
    }
  }
};

testMySQLDirect();