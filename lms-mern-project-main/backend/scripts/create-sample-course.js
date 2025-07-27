import mongoose from 'mongoose';
import courseModel from '../models/course.model.js';
import subjectModel from '../models/subject.model.js';
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

// Create a sample subject first
const createSampleSubject = async () => {
  try {
    console.log('📚 Creating sample subject...');
    
    const existingSubject = await subjectModel.findOne({ title: 'Sample Subject' });
    if (existingSubject) {
      console.log('✅ Sample subject already exists');
      return existingSubject._id;
    }
    
    const subject = await subjectModel.create({
      title: 'Sample Subject',
      description: 'A sample subject for testing purposes',
      category: 'Technology',
      instructor: 'Sample Instructor',
      duration: '4 weeks',
      level: 'Beginner',
      price: 100,
      status: 'active',
      rating: 4.5,
      studentsEnrolled: 0,
      lessons: 5,
      tags: ['sample', 'test', 'demo'],
      featured: true
    });
    
    console.log('✅ Sample subject created:', subject._id);
    return subject._id;
  } catch (error) {
    console.error('❌ Error creating subject:', error);
    return null;
  }
};

// Create a sample course with lessons
const createSampleCourse = async (subjectId) => {
  try {
    console.log('📖 Creating sample course with lessons...');
    
    const sampleCourse = {
      title: 'Sample Course with Lessons',
      description: 'This is a sample course created for testing lesson management functionality',
      category: 'Technology',
      subject: subjectId,
      stage: '1 ابتدائي',
      createdBy: 'Admin',
      structureType: 'mixed',
      price: 50,
      currency: 'EGP',
      isPaid: true,
      numberOfLectures: 5,
      units: [
        {
          title: 'Unit 1: Introduction',
          description: 'Introduction to the course',
          order: 1,
          price: 10,
          lessons: [
            {
              title: 'Welcome to the Course',
              description: 'Introduction lesson to get you started',
              duration: 15,
              order: 1,
              price: 5,
              lecture: {
                youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                secure_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                public_id: 'dQw4w9WgXcQ'
              },
              trainingExam: {
                questions: [
                  {
                    question: 'What is the main topic of this course?',
                    options: ['Programming', 'Design', 'Technology', 'Business'],
                    correctAnswer: 2,
                    explanation: 'This course focuses on technology concepts.'
                  }
                ],
                passingScore: 70,
                timeLimit: 10
              }
            },
            {
              title: 'Getting Started',
              description: 'Learn how to navigate through the course',
              duration: 20,
              order: 2,
              price: 8,
              lecture: {
                youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                secure_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                public_id: 'dQw4w9WgXcQ'
              }
            }
          ]
        },
        {
          title: 'Unit 2: Advanced Topics',
          description: 'Advanced concepts and techniques',
          order: 2,
          price: 15,
          lessons: [
            {
              title: 'Advanced Concepts',
              description: 'Deep dive into advanced topics',
              duration: 25,
              order: 1,
              price: 12,
              lecture: {
                youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                secure_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                public_id: 'dQw4w9WgXcQ'
              },
              finalExam: {
                questions: [
                  {
                    question: 'Which concept is most important?',
                    options: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
                    correctAnswer: 2,
                    explanation: 'Advanced concepts are crucial for mastery.'
                  }
                ],
                passingScore: 80,
                timeLimit: 15
              }
            }
          ]
        }
      ],
      directLessons: [
        {
          title: 'Bonus Lesson 1',
          description: 'Additional content for extra learning',
          duration: 10,
          order: 1,
          price: 5,
          lecture: {
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            secure_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            public_id: 'dQw4w9WgXcQ'
          }
        },
        {
          title: 'Bonus Lesson 2',
          description: 'More bonus content',
          duration: 12,
          order: 2,
          price: 5,
          lecture: {
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            secure_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            public_id: 'dQw4w9WgXcQ'
          }
        }
      ]
    };
    
    const course = await courseModel.create(sampleCourse);
    
    console.log('✅ Sample course created successfully!');
    console.log(`📖 Course ID: ${course._id}`);
    console.log(`📚 Course Title: ${course.title}`);
    console.log(`📋 Total Units: ${course.units.length}`);
    console.log(`📝 Total Direct Lessons: ${course.directLessons.length}`);
    
    // Show lesson IDs
    console.log('\n🎯 LESSON IDs CREATED:');
    course.units.forEach((unit, unitIndex) => {
      console.log(`\n📋 Unit ${unitIndex + 1}: ${unit.title}`);
      unit.lessons.forEach((lesson, lessonIndex) => {
        console.log(`   Lesson ${lessonIndex + 1}: ${lesson.title} (ID: ${lesson._id})`);
      });
    });
    
    console.log('\n📝 Direct Lessons:');
    course.directLessons.forEach((lesson, lessonIndex) => {
      console.log(`   Lesson ${lessonIndex + 1}: ${lesson.title} (ID: ${lesson._id})`);
    });
    
    return course;
  } catch (error) {
    console.error('❌ Error creating course:', error);
    return null;
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('🚀 Creating sample data for testing...\n');
  
  // Create sample subject
  const subjectId = await createSampleSubject();
  if (!subjectId) {
    console.log('❌ Failed to create subject. Exiting...');
    process.exit(1);
  }
  
  // Create sample course
  const course = await createSampleCourse(subjectId);
  if (!course) {
    console.log('❌ Failed to create course. Exiting...');
    process.exit(1);
  }
  
  console.log('\n🎉 Sample data created successfully!');
  console.log('💡 You can now use these lesson IDs to test the lesson management functionality.');
  
  await mongoose.disconnect();
  process.exit(0);
};

// Run the script
main().catch(console.error); 