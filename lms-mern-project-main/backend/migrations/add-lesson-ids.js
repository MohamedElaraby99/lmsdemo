import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
configDotenv();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

const addLessonIds = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const courseModel = mongoose.model('Course', new mongoose.Schema({}));

        console.log('🔍 Finding all courses...');
        const courses = await courseModel.find({});
        console.log(`📚 Found ${courses.length} courses`);

        let totalLessonsUpdated = 0;
        let totalUnitsUpdated = 0;

        for (const course of courses) {
            console.log(`\n📖 Processing course: ${course.title}`);
            let courseUpdated = false;

            // Check and update units
            if (course.units && Array.isArray(course.units)) {
                for (const unit of course.units) {
                    // Add _id to unit if missing
                    if (!unit._id) {
                        unit._id = new mongoose.Types.ObjectId();
                        console.log(`  ✅ Added _id to unit: ${unit.title}`);
                        courseUpdated = true;
                        totalUnitsUpdated++;
                    }

                    // Check and update lessons in unit
                    if (unit.lessons && Array.isArray(unit.lessons)) {
                        for (const lesson of unit.lessons) {
                            if (!lesson._id) {
                                lesson._id = new mongoose.Types.ObjectId();
                                console.log(`    ✅ Added _id to lesson in unit: ${lesson.title}`);
                                courseUpdated = true;
                                totalLessonsUpdated++;
                            }
                        }
                    }
                }
            }

            // Check and update direct lessons
            if (course.directLessons && Array.isArray(course.directLessons)) {
                for (const lesson of course.directLessons) {
                    if (!lesson._id) {
                        lesson._id = new mongoose.Types.ObjectId();
                        console.log(`  ✅ Added _id to direct lesson: ${lesson.title}`);
                        courseUpdated = true;
                        totalLessonsUpdated++;
                    }
                }
            }

            // Check and update unified structure
            if (course.unifiedStructure && Array.isArray(course.unifiedStructure)) {
                for (const item of course.unifiedStructure) {
                    if (item.type === 'lesson' && item.data) {
                        if (!item.data._id) {
                            item.data._id = new mongoose.Types.ObjectId();
                            console.log(`  ✅ Added _id to lesson in unified structure: ${item.data.title}`);
                            courseUpdated = true;
                            totalLessonsUpdated++;
                        }
                    } else if (item.type === 'unit' && item.data) {
                        // Add _id to unit if missing
                        if (!item.data._id) {
                            item.data._id = new mongoose.Types.ObjectId();
                            console.log(`  ✅ Added _id to unit in unified structure: ${item.data.title}`);
                            courseUpdated = true;
                            totalUnitsUpdated++;
                        }

                        // Check and update lessons in unit within unified structure
                        if (item.data.lessons && Array.isArray(item.data.lessons)) {
                            for (const lesson of item.data.lessons) {
                                if (!lesson._id) {
                                    lesson._id = new mongoose.Types.ObjectId();
                                    console.log(`    ✅ Added _id to lesson in unit within unified structure: ${lesson.title}`);
                                    courseUpdated = true;
                                    totalLessonsUpdated++;
                                }
                            }
                        }
                    }
                }
            }

            // Save the course if any changes were made
            if (courseUpdated) {
                await course.save();
                console.log(`  💾 Saved course: ${course.title}`);
            } else {
                console.log(`  ✅ Course already has all required IDs: ${course.title}`);
            }
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`  - Total courses processed: ${courses.length}`);
        console.log(`  - Total units updated: ${totalUnitsUpdated}`);
        console.log(`  - Total lessons updated: ${totalLessonsUpdated}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the migration
addLessonIds(); 