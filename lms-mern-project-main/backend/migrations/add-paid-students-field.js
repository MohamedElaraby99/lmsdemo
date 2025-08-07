import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Migration function
const addPaidStudentsField = async () => {
    try {
        console.log('Starting migration: Adding paidStudents field to lessons...');
        
        // Get all courses
        const courses = await mongoose.connection.db.collection('courses').find({}).toArray();
        console.log(`Found ${courses.length} courses to update`);
        
        let updatedCourses = 0;
        let updatedLessons = 0;
        
        for (const course of courses) {
            let courseUpdated = false;
            
            // Update lessons in units
            if (course.units && Array.isArray(course.units)) {
                for (const unit of course.units) {
                    if (unit.lessons && Array.isArray(unit.lessons)) {
                        for (const lesson of unit.lessons) {
                            if (!lesson.paidStudents) {
                                lesson.paidStudents = [];
                                courseUpdated = true;
                                updatedLessons++;
                            }
                        }
                    }
                }
            }
            
            // Update direct lessons
            if (course.directLessons && Array.isArray(course.directLessons)) {
                for (const lesson of course.directLessons) {
                    if (!lesson.paidStudents) {
                        lesson.paidStudents = [];
                        courseUpdated = true;
                        updatedLessons++;
                    }
                }
            }
            
            // Save updated course
            if (courseUpdated) {
                await mongoose.connection.db.collection('courses').updateOne(
                    { _id: course._id },
                    { $set: course }
                );
                updatedCourses++;
            }
        }
        
        console.log(`Migration completed successfully!`);
        console.log(`Updated ${updatedCourses} courses`);
        console.log(`Updated ${updatedLessons} lessons with paidStudents field`);
        
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run migration
connectDB().then(() => {
    addPaidStudentsField();
}); 