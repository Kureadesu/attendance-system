// backend/utils/createAdmin.js
import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';
import { sequelize } from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database
    await sequelize.sync();
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
      console.log('   You can use the default credentials: admin / admin123');
      return;
    }

    // Create admin
    const admin = await Admin.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.original) {
      console.error('   Database error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
};

// Run the script
createAdmin();