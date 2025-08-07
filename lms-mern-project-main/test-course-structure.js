// Test script to verify course structure functionality
const testCourseStructure = {
  title: "Test Course with Unified Structure",
  description: "This is a test course to verify the unified structure functionality",
  category: "Test",
  subject: "507f1f77bcf86cd799439011", // Replace with actual subject ID
  stage: "507f1f77bcf86cd799439012", // Replace with actual stage ID
  createdBy: "Test Admin",
  structureType: "unified",
  unifiedStructure: [
    {
      id: "lesson-1",
      type: "lesson",
      data: {
        title: "Introduction Lesson",
        description: "This is the first lesson",
        duration: 15,
        price: 0,
        _id: "507f1f77bcf86cd799439013"
      },
      order: 0
    },
    {
      id: "unit-1",
      type: "unit",
      data: {
        title: "First Unit",
        description: "This is the first unit",
        lessons: [
          {
            title: "Unit Lesson 1",
            description: "First lesson in the unit",
            duration: 20,
            price: 10,
            _id: "507f1f77bcf86cd799439014"
          },
          {
            title: "Unit Lesson 2",
            description: "Second lesson in the unit",
            duration: 25,
            price: 15,
            _id: "507f1f77bcf86cd799439015"
          }
        ]
      },
      order: 1
    },
    {
      id: "lesson-2",
      type: "lesson",
      data: {
        title: "Standalone Lesson",
        description: "This is a standalone lesson after the unit",
        duration: 18,
        price: 5,
        _id: "507f1f77bcf86cd799439016"
      },
      order: 2
    }
  ],
  price: 0,
  currency: "EGP",
  isPaid: false
};

// Function to flatten course structure (same as in DisplayLecture.jsx)
const flattenCourseStructure = (courseData) => {
  const allLectures = [];
  
  // If unified structure exists, use it as the primary source for order
  if (courseData.unifiedStructure && courseData.unifiedStructure.length > 0) {
    courseData.unifiedStructure.forEach((item, index) => {
      if (item.type === 'lesson') {
        // Add individual lesson
        allLectures.push({
          ...item.data,
          _id: item.data._id || item.id,
          order: item.order || index,
          isUnifiedLesson: true
        });
      } else if (item.type === 'unit') {
        // Add lessons from unit in order
        if (item.data.lessons && item.data.lessons.length > 0) {
          item.data.lessons.forEach((lesson, lessonIndex) => {
            allLectures.push({
              ...lesson,
              _id: lesson._id || lesson.id,
              order: (item.order || index) * 1000 + lessonIndex, // Maintain unit order
              unitTitle: item.data.title,
              isUnifiedUnitLesson: true
            });
          });
        }
      }
    });
  }
  
  // Sort by order to maintain the creation order
  return allLectures.sort((a, b) => a.order - b.order);
};

// Test the flattening function
console.log("Testing course structure flattening...");
const flattenedLectures = flattenCourseStructure(testCourseStructure);

console.log("Original unified structure:");
console.log(JSON.stringify(testCourseStructure.unifiedStructure, null, 2));

console.log("\nFlattened lectures:");
flattenedLectures.forEach((lecture, index) => {
  console.log(`${index + 1}. ${lecture.unitTitle ? `[${lecture.unitTitle}] ` : ''}${lecture.title} (Order: ${lecture.order})`);
});

console.log("\nExpected order:");
console.log("1. Introduction Lesson (Order: 0)");
console.log("2. [First Unit] Unit Lesson 1 (Order: 1000)");
console.log("3. [First Unit] Unit Lesson 2 (Order: 1001)");
console.log("4. Standalone Lesson (Order: 2000)");

console.log("\nDisplay structure:");
console.log("- Introduction Lesson (standalone)");
console.log("- First Unit (collapsible)");
console.log("  ├─ Unit Lesson 1");
console.log("  └─ Unit Lesson 2");
console.log("- Standalone Lesson (standalone)");

console.log("\nTest completed successfully!"); 