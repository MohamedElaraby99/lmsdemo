import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    });
    
    await adminUser.save();
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
