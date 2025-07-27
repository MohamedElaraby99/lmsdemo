import mongoose from 'mongoose';
import courseModel from '../models/course.model.js';
import lessonPurchaseModel from '../models/lessonPurchase.model.js';
import examResultModel from '../models/examResult.model.js';
import dotenv from 'dotenv';

dotenv.config();

const LESSON_ID = '6886b4b88d2a8b948f49bac3'; // Welcome to the Course lesson

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Try to get MongoDB URI from environment variables
    let mongoUri = process.env.MONGO_URI_ATLAS || 
                   process.env.MONGO_URI_COMPASS || 
                   process.env.MONGO_URI_COMMUNITY || 
                   'mongodb://localhost:27017/lms_database';
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📡 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Make sure MongoDB is running and accessible');
    console.log('🔧 You can set environment variables: MONGO_URI_ATLAS, MONGO_URI_COMPASS, or MONGO_URI_COMMUNITY');
    process.exit(1);
  }
};

// Find the lesson in all courses
const findLesson = async () => {
  try {
    console.log(`🔍 Searching for lesson ID: ${LESSON_ID}`);
    
    // Search in units.lessons
    const courseWithUnitLesson = await courseModel.findOne({
      'units.lessons._id': LESSON_ID
    });
    
    // Search in directLessons
    const courseWithDirectLesson = await courseModel.findOne({
      'directLessons._id': LESSON_ID
    });
    
    if (courseWithUnitLesson) {
      console.log('📚 Found lesson in course units!');
      const unit = courseWithUnitLesson.units.find(u => 
        u.lessons.some(l => l._id.toString() === LESSON_ID)
      );
      const lesson = unit.lessons.find(l => l._id.toString() === LESSON_ID);
      
      console.log('\n📋 COURSE DETAILS:');
      console.log(`Course ID: ${courseWithUnitLesson._id}`);
      console.log(`Course Title: ${courseWithUnitLesson.title}`);
      console.log(`Unit Title: ${unit.title}`);
      console.log(`Lesson Title: ${lesson.title}`);
      console.log(`Lesson Description: ${lesson.description}`);
      console.log(`Lesson Price: ${lesson.price || 'Not set'} EGP`);
      console.log(`Has Video: ${lesson.lecture?.secure_url ? 'Yes' : 'No'}`);
      console.log(`Has PDF: ${lesson.pdf?.secure_url ? 'Yes' : 'No'}`);
      console.log(`Has Training Exam: ${lesson.trainingExam?.questions?.length > 0 ? 'Yes' : 'No'}`);
      console.log(`Has Final Exam: ${lesson.finalExam?.questions?.length > 0 ? 'Yes' : 'No'}`);
      
      return {
        courseId: courseWithUnitLesson._id,
        unitId: unit._id,
        lessonId: lesson._id,
        lessonType: 'unit',
        course: courseWithUnitLesson,
        unit: unit,
        lesson: lesson
      };
      
    } else if (courseWithDirectLesson) {
      console.log('📚 Found lesson in course direct lessons!');
      const lesson = courseWithDirectLesson.directLessons.find(l => 
        l._id.toString() === LESSON_ID
      );
      
      console.log('\n📋 COURSE DETAILS:');
      console.log(`Course ID: ${courseWithDirectLesson._id}`);
      console.log(`Course Title: ${courseWithDirectLesson.title}`);
      console.log(`Lesson Title: ${lesson.title}`);
      console.log(`Lesson Description: ${lesson.description}`);
      console.log(`Lesson Price: ${lesson.price || 'Not set'} EGP`);
      console.log(`Has Video: ${lesson.lecture?.secure_url ? 'Yes' : 'No'}`);
      console.log(`Has PDF: ${lesson.pdf?.secure_url ? 'Yes' : 'No'}`);
      console.log(`Has Training Exam: ${lesson.trainingExam?.questions?.length > 0 ? 'Yes' : 'No'}`);
      console.log(`Has Final Exam: ${lesson.finalExam?.questions?.length > 0 ? 'Yes' : 'No'}`);
      
      return {
        courseId: courseWithDirectLesson._id,
        unitId: null,
        lessonId: lesson._id,
        lessonType: 'direct',
        course: courseWithDirectLesson,
        unit: null,
        lesson: lesson
      };
      
    } else {
      console.log('❌ Lesson not found in any course!');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error finding lesson:', error);
    return null;
  }
};

// Get lesson purchase history
const getLessonPurchases = async (lessonId) => {
  try {
    const purchases = await lessonPurchaseModel.find({
      lessonId: lessonId
    }).populate('user', 'fullName email').populate('course', 'title');
    
    console.log('\n💰 PURCHASE HISTORY:');
    console.log(`Total purchases: ${purchases.length}`);
    
    if (purchases.length > 0) {
      purchases.forEach((purchase, index) => {
        console.log(`\n${index + 1}. Purchase ID: ${purchase._id}`);
        console.log(`   User: ${purchase.user?.fullName} (${purchase.user?.email})`);
        console.log(`   Course: ${purchase.course?.title}`);
        console.log(`   Amount: ${purchase.amount} ${purchase.currency}`);
        console.log(`   Status: ${purchase.status}`);
        console.log(`   Date: ${purchase.createdAt}`);
      });
    } else {
      console.log('   No purchases found for this lesson');
    }
    
    return purchases;
  } catch (error) {
    console.error('❌ Error getting purchase history:', error);
    return [];
  }
};

// Get exam results for this lesson
const getExamResults = async (lessonId) => {
  try {
    const results = await examResultModel.find({
      lessonId: lessonId
    }).populate('user', 'fullName email').populate('course', 'title');
    
    console.log('\n📝 EXAM RESULTS:');
    console.log(`Total exam attempts: ${results.length}`);
    
    if (results.length > 0) {
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. Exam ID: ${result._id}`);
        console.log(`   User: ${result.user?.fullName} (${result.user?.email})`);
        console.log(`   Course: ${result.course?.title}`);
        console.log(`   Exam Type: ${result.examType}`);
        console.log(`   Score: ${result.score}/${result.totalQuestions} (${result.correctAnswers} correct, ${result.wrongAnswers} wrong)`);
        console.log(`   Passed: ${result.passed ? 'Yes' : 'No'}`);
        console.log(`   Time Taken: ${result.timeTaken} minutes`);
        console.log(`   Date: ${result.completedAt}`);
      });
    } else {
      console.log('   No exam results found for this lesson');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error getting exam results:', error);
    return [];
  }
};

// Update lesson details
const updateLesson = async (lessonData) => {
  try {
    const { courseId, unitId, lessonId, lessonType } = lessonData;
    
    console.log('\n✏️ UPDATING LESSON...');
    
    let updateQuery;
    if (lessonType === 'unit') {
      updateQuery = {
        $set: {
          [`units.$[unit].lessons.$[lesson].title`]: 'Updated Lesson Title',
          [`units.$[unit].lessons.$[lesson].description`]: 'This lesson has been updated via script'
        }
      };
    } else {
      updateQuery = {
        $set: {
          [`directLessons.$[lesson].title`]: 'Updated Lesson Title',
          [`directLessons.$[lesson].description`]: 'This lesson has been updated via script'
        }
      };
    }
    
    const arrayFilters = [];
    if (lessonType === 'unit') {
      arrayFilters.push({ 'unit._id': unitId });
    }
    arrayFilters.push({ 'lesson._id': lessonId });
    
    const result = await courseModel.updateOne(
      { _id: courseId },
      updateQuery,
      { arrayFilters }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Lesson updated successfully!');
    } else {
      console.log('❌ No changes made to lesson');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating lesson:', error);
    return null;
  }
};

// Delete lesson
const deleteLesson = async (lessonData) => {
  try {
    const { courseId, unitId, lessonId, lessonType } = lessonData;
    
    console.log('\n🗑️ DELETING LESSON...');
    
    let updateQuery;
    if (lessonType === 'unit') {
      updateQuery = {
        $pull: {
          [`units.$[unit].lessons`]: { _id: lessonId }
        }
      };
    } else {
      updateQuery = {
        $pull: {
          directLessons: { _id: lessonId }
        }
      };
    }
    
    const arrayFilters = lessonType === 'unit' ? [{ 'unit._id': unitId }] : [];
    
    const result = await courseModel.updateOne(
      { _id: courseId },
      updateQuery,
      { arrayFilters }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Lesson deleted successfully!');
    } else {
      console.log('❌ No lesson was deleted');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error deleting lesson:', error);
    return null;
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('🚀 Starting lesson management script...\n');
  
  // Find the lesson
  const lessonData = await findLesson();
  
  if (!lessonData) {
    console.log('❌ Lesson not found. Exiting...');
    process.exit(1);
  }
  
  // Get additional data
  await getLessonPurchases(LESSON_ID);
  await getExamResults(LESSON_ID);
  
  console.log('\n🎯 LESSON MANAGEMENT OPTIONS:');
  console.log('1. Update lesson title and description');
  console.log('2. Delete lesson');
  console.log('3. Exit');
  
  // For now, just show the data
  console.log('\n📊 SUMMARY:');
  console.log(`Lesson ID: ${LESSON_ID}`);
  console.log(`Course ID: ${lessonData.courseId}`);
  console.log(`Lesson Type: ${lessonData.lessonType}`);
  console.log(`Lesson Title: ${lessonData.lesson.title}`);
  
  console.log('\n✅ Script completed successfully!');
  
  await mongoose.disconnect();
  process.exit(0);
};

// Run the script
main().catch(console.error); 