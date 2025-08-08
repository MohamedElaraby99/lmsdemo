import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const connectToDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    await connectToDb();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }
    
    // Create admin user - don't hash password manually, let the model handle it
    const adminUser = new User({
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@lms.com',
      password: 'Admin123!', // Will be hashed by the pre-save middleware
      role: 'ADMIN',
      isActive: true
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@lms.com');
    console.log('👤 Username: admin');
    console.log('🔐 Password: Admin123!');
    console.log('👑 Role: ADMIN');
    console.log('\n💡 You can now login with these credentials');
    console.log('🌐 Go to: http://localhost:5173/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
