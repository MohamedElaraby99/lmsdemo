import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

const fixUnifiedStructureLessons = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const courseModel = mongoose.model('Course', new mongoose.Schema({}));

        console.log('🔍 Finding all courses...');
        const courses = await courseModel.find({});
        console.log(`📚 Found ${courses.length} courses`);

        let totalLessonsUpdated = 0;

        for (const course of courses) {
            console.log(`\n📖 Processing course: ${course.title}`);
            let courseUpdated = false;

            // Check unified structure
            if (course.unifiedStructure && Array.isArray(course.unifiedStructure)) {
                for (const item of course.unifiedStructure) {
                    if (item.type === 'lesson' && item.data) {
                        if (!item.data._id) {
                            item.data._id = new mongoose.Types.ObjectId();
                            console.log(`  ✅ Added _id to lesson in unified structure: ${item.data.title}`);
                            courseUpdated = true;
                            totalLessonsUpdated++;
                        }
                    } else if (item.type === 'unit' && item.data && item.data.lessons && Array.isArray(item.data.lessons)) {
                        for (const lesson of item.data.lessons) {
                            if (!lesson._id) {
                                lesson._id = new mongoose.Types.ObjectId();
                                console.log(`  ✅ Added _id to lesson in unit within unified structure: ${lesson.title}`);
                                courseUpdated = true;
                                totalLessonsUpdated++;
                            }
                        }
                    }
                }
            }

            // Save the course if it was updated
            if (courseUpdated) {
                await course.save();
                console.log(`  💾 Saved course: ${course.title}`);
            }
        }

        console.log(`\n✅ Migration completed!`);
        console.log(`📊 Total lessons updated: ${totalLessonsUpdated}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run the migration
fixUnifiedStructureLessons(); 