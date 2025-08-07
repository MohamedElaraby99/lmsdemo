import fetch from 'node-fetch';

const testServerPurchase = async () => {
    try {
        console.log('🧪 Testing server purchase functionality...');
        
        // Test data
        const purchaseData = {
            courseId: '6892748afe6b01671ed40f7c',
            lessonId: '6892748afe6b01671ed40f82',
            lessonTitle: 'New Lesson',
            amount: 10
        };

        console.log('📤 Sending purchase request with data:', purchaseData);

        // Make a request to the purchase endpoint
        const response = await fetch('http://localhost:4000/api/v1/lesson-purchases/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // You'll need to add a valid Authorization header here
                // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
            },
            body: JSON.stringify(purchaseData)
        });

        const responseData = await response.json();
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response data:', responseData);

        if (response.ok) {
            console.log('✅ Purchase successful!');
        } else {
            console.log('❌ Purchase failed:', responseData.message);
        }

    } catch (error) {
        console.error('❌ Error testing server purchase:', error.message);
    }
};

testServerPurchase(); 