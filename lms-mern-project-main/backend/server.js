import app from "./app.js";
const PORT = process.env.PORT || 4000;
// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'; 
process.env.BACKEND_URL = process.env.BACKEND_URL || 'https://api.lms.fikra.solutions';



app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})