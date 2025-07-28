const axios = require('axios');

// Test the exam endpoints
async function testExamEndpoints() {
  const baseURL = 'http://localhost:5000/api/v1';
  
  // Sample exam data
  const examData = {
    questions: [
      {
        question: "What is the main topic of this lesson?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is the correct answer explanation."
      }
    ],
    passingScore: 70,
    timeLimit: 30
  };

  try {
    console.log('Testing exam endpoints...');
    
    // Test training exam endpoint
    console.log('\n1. Testing training exam endpoint...');
    const trainingResponse = await axios.post(
      `${baseURL}/courses/688385e.../units/6886b97.../lessons/6886b97.../training-exam`,
      examData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      }
    );
    console.log('Training exam response:', trainingResponse.status);
    
    // Test final exam endpoint
    console.log('\n2. Testing final exam endpoint...');
    const finalResponse = await axios.post(
      `${baseURL}/courses/688385e.../units/6886b97.../lessons/6886b97.../final-exam`,
      examData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      }
    );
    console.log('Final exam response:', finalResponse.status);
    
  } catch (error) {
    console.error('Error testing endpoints:', error.response?.status, error.response?.data);
  }
}

testExamEndpoints(); 