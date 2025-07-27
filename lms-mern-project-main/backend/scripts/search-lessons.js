import mongoose from 'mongoose';
import courseModel from '../models/course.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI_ATLAS || 
                   process.env.MONGO_URI_COMPASS || 
                   process.env.MONGO_URI_COMMUNITY || 
                   'mongodb://localhost:27017/lms_database';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Search for all lessons
const searchAllLessons = async () => {
  try {
    console.log('🔍 Searching for all lessons in the database...\n');
    
    const courses = await courseModel.find({});
    console.log(`📚 Found ${courses.length} courses in the database\n`);
    
    let totalLessons = 0;
    let unitLessons = 0;
    let directLessons = 0;
    
    courses.forEach((course, courseIndex) => {
      console.log(`\n📖 Course ${courseIndex + 1}: ${course.title}`);
      console.log(`   Course ID: ${course._id}`);
      console.log(`   Structure Type: ${course.structureType || 'direct-lessons'}`);
      
      // Count unit lessons
      if (course.units && course.units.length > 0) {
        console.log(`   📋 Units: ${course.units.length}`);
        course.units.forEach((unit, unitIndex) => {
          console.log(`      Unit ${unitIndex + 1}: ${unit.title}`);
          if (unit.lessons && unit.lessons.length > 0) {
            console.log(`         Lessons: ${unit.lessons.length}`);
            unit.lessons.forEach((lesson, lessonIndex) => {
              console.log(`            ${lessonIndex + 1}. ${lesson.title} (ID: ${lesson._id})`);
              unitLessons++;
              totalLessons++;
            });
          } else {
            console.log(`         No lessons in this unit`);
          }
        });
      }
      
      // Count direct lessons
      if (course.directLessons && course.directLessons.length > 0) {
        console.log(`   📝 Direct Lessons: ${course.directLessons.length}`);
        course.directLessons.forEach((lesson, lessonIndex) => {
          console.log(`      ${lessonIndex + 1}. ${lesson.title} (ID: ${lesson._id})`);
          directLessons++;
          totalLessons++;
        });
      } else {
        console.log(`   No direct lessons`);
      }
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total Courses: ${courses.length}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Unit Lessons: ${unitLessons}`);
    console.log(`Direct Lessons: ${directLessons}`);
    
    // Show some sample lesson IDs
    console.log('\n🎯 SAMPLE LESSON IDs:');
    let sampleCount = 0;
    courses.forEach(course => {
      if (sampleCount >= 5) return; // Only show first 5 courses
      
      if (course.units) {
        course.units.forEach(unit => {
          if (unit.lessons && unit.lessons.length > 0 && sampleCount < 5) {
            unit.lessons.forEach(lesson => {
              if (sampleCount < 5) {
                console.log(`   ${lesson.title}: ${lesson._id}`);
                sampleCount++;
              }
            });
          }
        });
      }
      
      if (course.directLessons && course.directLessons.length > 0 && sampleCount < 5) {
        course.directLessons.forEach(lesson => {
          if (sampleCount < 5) {
            console.log(`   ${lesson.title}: ${lesson._id}`);
            sampleCount++;
          }
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error searching lessons:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('🚀 Starting lesson search script...\n');
  
  await searchAllLessons();
  
  console.log('\n✅ Script completed successfully!');
  
  await mongoose.disconnect();
  process.exit(0);
};

// Run the script
main().catch(console.error); 