import mongoose from 'mongoose';
import userModel from '../models/user.model.js';
import courseModel from '../models/course.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const grantContentAccess = async (userId, contentIds) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    // Add content IDs to user's purchased content (avoid duplicates)
    const newContentIds = contentIds.filter(id => !user.purchasedContentIds.includes(id));
    user.purchasedContentIds.push(...newContentIds);
    
    await user.save();

    console.log(`✅ Granted access to ${newContentIds.length} content items for user ${user.email}`);
    console.log(`Total purchased content: ${user.purchasedContentIds.length}`);
    
  } catch (error) {
    console.error('Error granting access:', error);
  }
};

const listUserContent = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(`\n📋 User: ${user.email}`);
    console.log(`Purchased content IDs: ${user.purchasedContentIds.length}`);
    
    if (user.purchasedContentIds.length > 0) {
      console.log('Content IDs:');
      user.purchasedContentIds.forEach((id, index) => {
        console.log(`  ${index + 1}. ${id}`);
      });
    }
    
  } catch (error) {
    console.error('Error listing user content:', error);
  }
};

const listCourseContent = async (courseId) => {
  try {
    const course = await courseModel.findById(courseId);
    if (!course) {
      console.log('Course not found');
      return;
    }

    console.log(`\n📚 Course: ${course.title}`);
    console.log('Available content IDs:');
    
    let contentCount = 0;
    
    // List units and their lessons
    if (course.units && course.units.length > 0) {
      console.log('\nUnits:');
      course.units.forEach((unit, unitIndex) => {
        console.log(`  Unit ${unitIndex + 1}: ${unit.title} (ID: ${unit._id})`);
        if (unit.lessons && unit.lessons.length > 0) {
          unit.lessons.forEach((lesson, lessonIndex) => {
            contentCount++;
            console.log(`    Lesson ${lessonIndex + 1}: ${lesson.title} (ID: ${lesson._id}) - Price: ${lesson.price || 0}`);
          });
        }
      });
    }
    
    // List direct lessons
    if (course.directLessons && course.directLessons.length > 0) {
      console.log('\nDirect Lessons:');
      course.directLessons.forEach((lesson, index) => {
        contentCount++;
        console.log(`  Lesson ${index + 1}: ${lesson.title} (ID: ${lesson._id}) - Price: ${lesson.price || 0}`);
      });
    }
    
    // List unified structure
    if (course.unifiedStructure && course.unifiedStructure.length > 0) {
      console.log('\nUnified Structure:');
      course.unifiedStructure.forEach((item, index) => {
        if (item.type === 'unit') {
          console.log(`  Unit ${index + 1}: ${item.data.title} (ID: ${item._id})`);
          if (item.data.lessons && item.data.lessons.length > 0) {
            item.data.lessons.forEach((lesson, lessonIndex) => {
              contentCount++;
              console.log(`    Lesson ${lessonIndex + 1}: ${lesson.title} (ID: ${lesson._id}) - Price: ${lesson.price || 0}`);
            });
          }
        } else if (item.type === 'lesson') {
          contentCount++;
          console.log(`  Lesson ${index + 1}: ${item.data.title} (ID: ${item._id}) - Price: ${item.data.price || 0}`);
        }
      });
    }
    
    console.log(`\nTotal content items: ${contentCount}`);
    
  } catch (error) {
    console.error('Error listing course content:', error);
  }
};

// Example usage
const main = async () => {
  console.log('🚀 Content Access Management Script\n');
  
  // Example: List content from a course
  // await listCourseContent('6892d9c62a654fac7f22e1ad'); // Replace with actual course ID
  
  // Example: Grant access to specific content
  // await grantContentAccess('USER_ID_HERE', ['LESSON_ID_1', 'LESSON_ID_2']);
  
  // Example: List user's purchased content
  // await listUserContent('USER_ID_HERE');
  
  console.log('\n📝 Usage Examples:');
  console.log('1. List course content: await listCourseContent("COURSE_ID")');
  console.log('2. Grant access: await grantContentAccess("USER_ID", ["LESSON_ID_1", "LESSON_ID_2"])');
  console.log('3. List user content: await listUserContent("USER_ID")');
  
  process.exit(0);
};

main(); 