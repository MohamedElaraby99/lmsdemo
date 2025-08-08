#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

// Load environment variables
dotenv.config();

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};

// Helper function to validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate password strength
const validatePassword = (password) => {
    if (password.length < 6) {
        return "Password must be at least 6 characters long";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
        return "Password must contain at least one number";
    }
    return null;
};

// Helper function to generate random password
const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

const createAdminAccount = async () => {
    console.log("🚀 LMS Admin Account Creator");
    console.log("=============================\n");
    
    try {
        // Get database connection string with fallbacks
        let uri = process.env.MONGO_URI_ATLAS || 
                  process.env.MONGO_URI_COMPASS || 
                  process.env.MONGO_URI_COMMUNITY || 
                  process.env.MONGO_URI || 
                  process.env.MONGODB_URI;
        
        const dbType = process.env.DB_TYPE || 'atlas';
        console.log(`📊 Database Type: ${dbType.toUpperCase()}`);
        
        // If no URI found, try to construct from individual variables
        if (!uri) {
            switch (dbType) {
                case 'atlas':
                    uri = process.env.MONGO_URI_ATLAS;
                    break;
                case 'compass':
                    uri = process.env.MONGO_URI_COMPASS;
                    break;
                case 'community':
                    uri = process.env.MONGO_URI_COMMUNITY;
                    break;
                default:
                    // Try common environment variable names
                    uri = process.env.MONGO_URI || process.env.MONGODB_URI;
            }
        }
        
        if (!uri) {
            console.error("❌ No database connection string found!");
            console.log("\n💡 Please set one of these environment variables:");
            console.log("   - MONGO_URI_ATLAS");
            console.log("   - MONGO_URI_COMPASS");
            console.log("   - MONGO_URI_COMMUNITY");
            console.log("   - MONGO_URI");
            console.log("   - MONGODB_URI");
            console.log("\n📝 Example .env file:");
            console.log("   MONGO_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/lms");
            console.log("   DB_TYPE=atlas");
            console.log("\n🔧 Or run with environment variable:");
            console.log("   MONGO_URI_ATLAS=your_connection_string node scripts/create-admin-account.js");
            process.exit(1);
        }
        
        console.log(`🔗 Connecting to database...`);
        
        // Connect to database
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log("✅ Database connected successfully!\n");
        
        // Choose creation mode
        console.log("📋 Choose creation mode:");
        console.log("1. Quick Admin (default credentials)");
        console.log("2. Custom Admin (interactive)");
        console.log("3. Bulk Admin (multiple accounts)");
        
        const mode = await askQuestion("\nEnter mode (1-3, default: 1): ") || "1";
        
        switch (mode) {
            case "1":
                await createQuickAdmin();
                break;
            case "2":
                await createCustomAdmin();
                break;
            case "3":
                await createBulkAdmins();
                break;
            default:
                console.log("❌ Invalid mode selected. Using Quick Admin mode.");
                await createQuickAdmin();
        }
        
    } catch (error) {
        console.error("❌ Error creating admin account:", error.message);
        console.log("\n💡 Troubleshooting tips:");
        console.log("1. Check your database connection");
        console.log("2. Verify your .env file settings");
        console.log("3. Ensure database server is running");
        console.log("4. Check if the User model is properly defined");
        console.log("5. Verify your MongoDB connection string");
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        rl.close();
    }
};

const createQuickAdmin = async () => {
    console.log("\n⚡ Quick Admin Mode");
    console.log("==================\n");
    
    // Default admin account details
    const adminData = {
        fullName: "System Administrator",
        username: "admin",
        email: "admin@lms.com",
        password: "Admin123!",
        role: "ADMIN",
        isActive: true
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
        $or: [
            { email: adminData.email },
            { username: adminData.username }
        ]
    });
    
    if (existingAdmin) {
        console.log("⚠️ Admin account already exists!");
        console.log(`📧 Email: ${existingAdmin.email}`);
        console.log(`👤 Username: ${existingAdmin.username}`);
        console.log(`🔑 Role: ${existingAdmin.role}`);
        return;
    }
    
    // Create admin account
    console.log("👤 Creating admin account...");
    const admin = new User(adminData);
    await admin.save();
    
    console.log("✅ Admin account created successfully!");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Username: ${admin.username}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🔐 Password: ${adminData.password}`);
    console.log("\n💡 You can now login with these credentials");
    console.log("🌐 Go to: http://localhost:5173/login");
};

const createCustomAdmin = async () => {
    console.log("\n🎨 Custom Admin Mode");
    console.log("===================\n");
    
    // Get admin details from user
    console.log("📝 Please enter admin details:");
    
    const fullName = await askQuestion("Full Name: ");
    const username = await askQuestion("Username: ");
    const email = await askQuestion("Email: ");
    
    // Ask for password or generate one
    const passwordChoice = await askQuestion("Generate random password? (y/n, default: n): ") || "n";
    let password;
    
    if (passwordChoice.toLowerCase() === 'y' || passwordChoice.toLowerCase() === 'yes') {
        password = generateRandomPassword();
        console.log(`🔐 Generated password: ${password}`);
    } else {
        password = await askQuestion("Password: ");
        
        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            console.log(`⚠️ ${passwordError}`);
            const continueChoice = await askQuestion("Continue anyway? (y/n): ");
            if (continueChoice.toLowerCase() !== 'y' && continueChoice.toLowerCase() !== 'yes') {
                console.log("❌ Admin account creation cancelled.");
                return;
            }
        }
    }
    
    // Validate input
    if (!fullName || !username || !email || !password) {
        throw new Error("All fields are required!");
    }
    
    if (!isValidEmail(email)) {
        throw new Error("Invalid email format!");
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
        $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
        ]
    });
    
    if (existingAdmin) {
        console.log("\n⚠️ Admin account already exists!");
        console.log(`📧 Email: ${existingAdmin.email}`);
        console.log(`👤 Username: ${existingAdmin.username}`);
        console.log(`🔑 Role: ${existingAdmin.role}`);
        return;
    }
    
    // Confirm creation
    console.log("\n📋 Admin Account Details:");
    console.log(`👤 Full Name: ${fullName}`);
    console.log(`🔑 Username: ${username}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👑 Role: ADMIN`);
    
    const confirm = await askQuestion("\n❓ Do you want to create this admin account? (y/n): ");
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log("❌ Admin account creation cancelled.");
        return;
    }
    
    // Create admin account
    console.log("\n👤 Creating admin account...");
    const admin = new User({
        fullName: fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
        role: "ADMIN",
        isActive: true
    });
    
    await admin.save();
    
    console.log("✅ Admin account created successfully!");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Username: ${admin.username}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🔐 Password: ${password}`);
    console.log("\n💡 You can now login with these credentials");
    console.log("🌐 Go to: http://localhost:5173/login");
};

const createBulkAdmins = async () => {
    console.log("\n📦 Bulk Admin Mode");
    console.log("==================\n");
    
    const count = parseInt(await askQuestion("How many admin accounts to create? (default: 3): ") || "3");
    
    if (count < 1 || count > 10) {
        console.log("❌ Please enter a number between 1 and 10.");
        return;
    }
    
    console.log(`\n📝 Creating ${count} admin accounts...\n`);
    
    const createdAdmins = [];
    
    for (let i = 1; i <= count; i++) {
        console.log(`\n--- Admin Account ${i}/${count} ---`);
        
        const fullName = await askQuestion(`Full Name for Admin ${i}: `);
        const username = await askQuestion(`Username for Admin ${i}: `);
        const email = await askQuestion(`Email for Admin ${i}: `);
        
        // Generate random password for bulk creation
        const password = generateRandomPassword();
        
        if (!fullName || !username || !email) {
            console.log(`⚠️ Skipping Admin ${i} - missing required fields`);
            continue;
        }
        
        if (!isValidEmail(email)) {
            console.log(`⚠️ Skipping Admin ${i} - invalid email format`);
            continue;
        }
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });
        
        if (existingAdmin) {
            console.log(`⚠️ Admin ${i} already exists!`);
            continue;
        }
        
        try {
            // Create admin account
            const admin = new User({
                fullName: fullName,
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password: password,
                role: "ADMIN",
                isActive: true
            });
            
            await admin.save();
            
            createdAdmins.push({
                fullName,
                username: admin.username,
                email: admin.email,
                password
            });
            
            console.log(`✅ Admin ${i} created successfully!`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   👤 Username: ${admin.username}`);
            console.log(`   🔐 Password: ${password}`);
            
        } catch (error) {
            console.log(`❌ Error creating Admin ${i}: ${error.message}`);
        }
    }
    
    // Summary
    console.log("\n📊 Summary:");
    console.log(`✅ Successfully created ${createdAdmins.length} admin accounts`);
    console.log(`❌ Failed to create ${count - createdAdmins.length} admin accounts`);
    
    if (createdAdmins.length > 0) {
        console.log("\n📋 Created Admin Accounts:");
        createdAdmins.forEach((admin, index) => {
            console.log(`\n${index + 1}. ${admin.fullName}`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   👤 Username: ${admin.username}`);
            console.log(`   🔐 Password: ${admin.password}`);
        });
        
        console.log("\n💡 You can now login with any of these credentials");
        console.log("🌐 Go to: http://localhost:5173/login");
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdminAccount();
}

export default createAdminAccount;
