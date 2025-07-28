import axios from 'axios';

const testStagesAPI = async () => {
  try {
    console.log('Testing stages API...');
    const response = await axios.get('http://localhost:4000/api/v1/stages');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ API is working correctly');
      console.log('Number of stages:', response.data.data.stages.length);
      console.log('Stages:', response.data.data.stages.map(s => s.name));
    } else {
      console.log('❌ API returned success: false');
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
};

testStagesAPI(); 