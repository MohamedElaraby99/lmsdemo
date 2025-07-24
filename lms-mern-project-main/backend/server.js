import app from "./app.js";
const PORT = process.env.PORT || 8000;
import {v2 as cloudinary} from 'cloudinary';
import Razorpay from "razorpay";

// Set default environment variables if not provided
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'placeholder';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'placeholder';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'placeholder';
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
process.env.RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || 'placeholder_secret';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'; 
         
// cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// razorpay - only initialize if proper credentials are provided
let razorpay;
if (process.env.RAZORPAY_KEY_ID && 
    process.env.RAZORPAY_SECRET && 
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder' && 
    process.env.RAZORPAY_SECRET !== 'placeholder_secret') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });
} else {
  console.log('⚠️ Razorpay not configured - using placeholder credentials');
  // Create a mock razorpay object for development
  razorpay = {
    subscriptions: {
      create: async () => { throw new Error('Razorpay not configured'); },
      all: async () => { throw new Error('Razorpay not configured'); },
      cancel: async () => { throw new Error('Razorpay not configured'); }
    }
  };
}

export { razorpay };

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})