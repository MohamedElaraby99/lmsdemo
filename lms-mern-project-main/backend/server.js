import app from "./app.js";
const PORT = process.env.PORT;
import {v2 as cloudinary} from 'cloudinary';
import Razorpay from "razorpay"; 
         
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