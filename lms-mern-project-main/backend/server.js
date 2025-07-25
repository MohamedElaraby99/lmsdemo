import app from "./app.js";
const PORT = process.env.PORT || 8000;
import {v2 as cloudinary} from 'cloudinary';

// Set default environment variables if not provided
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'placeholder';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'placeholder';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'placeholder';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'; 
process.env.BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'; 
         
// cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});



app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})