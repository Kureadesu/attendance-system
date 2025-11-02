// utils/checkDatabase.js
import sequelize from '../config/database.js';

const checkDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check if tables exist and their structure
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('\n📊 Existing tables:');
    
    if (tables.length === 0) {
      console.log('   No tables found in database');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }

    // Check each table's structure if they exist
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    for (const tableName of tableNames) {
      console.log(`\n🔍 ${tableName} table structure:`);
      const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
      columns.forEach(column => {
        console.log(`   - ${column.Field} (${column.Type})`);
      });
    }

    // If no tables exist, show how to create them
    if (tables.length === 0) {
      console.log('\n💡 No tables found. Run:');
      console.log('   node utils/resetDatabase.js');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('   Database error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('\n✅ Database connection closed');
  }
};

checkDatabase();