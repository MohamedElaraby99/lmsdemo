import mongoose from "mongoose";

console.log('Testing MongoDB connection...');

const testConnection = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/lms', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Available collections:', collections.map(c => c.name));
        
        await mongoose.connection.close();
        console.log('✅ Connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        console.log('💡 Make sure MongoDB is running locally or use MongoDB Atlas');
    }
}

testConnection(); 