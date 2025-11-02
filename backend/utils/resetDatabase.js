// utils/resetDatabase.js
import sequelize from '../config/database.js';
import '../models/index.js'; // This imports and registers all models

const resetDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Drop all tables (WARNING: This will delete all data!)
    console.log('🗑️  Dropping existing tables...');
    await sequelize.drop();
    console.log('✅ Tables dropped');

    // Create all tables with proper schema
    console.log('🔧 Creating tables with proper schema...');
    await sequelize.sync({ force: false });
    console.log('✅ Tables created successfully');

    console.log('\n🎉 Database reset complete!');
    console.log('All tables now have the correct schema with timestamps.');

  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    if (error.original) {
      console.error('   Database error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
};

resetDatabase();