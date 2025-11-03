// utils/createAdmin.js
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import Admin from '../models/Admin.js';

const createAdmin = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database - this will create missing tables/columns
    console.log('🔧 Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Admin data
    const adminData = {
      username: 'admin',
      password_hash: await bcrypt.hash('admin123', 12)
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { username: adminData.username }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      
      // Test if password works
      const isValid = await existingAdmin.validatePassword('admin123');
      console.log(`   Default password works: ${isValid ? 'YES' : 'NO'}`);
      
      if (!isValid) {
        console.log('🔄 Updating admin password...');
        existingAdmin.password_hash = await bcrypt.hash('admin123', 12);
        await existingAdmin.save();
        console.log('✅ Admin password updated');
      }
      return;
    }

    // Create admin
    const admin = await Admin.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log('   Password: admin123');
    console.log(`   Created: ${admin.created_at}`);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.original) {
      console.error('   Database error:', error.original.message);
      
      if (error.original.code === 'ER_BAD_FIELD_ERROR') {
        console.log('\n💡 Database schema is outdated.');
        console.log('   Run: node utils/resetDatabase.js');
      }
    }
  } finally {
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
};

createAdmin();