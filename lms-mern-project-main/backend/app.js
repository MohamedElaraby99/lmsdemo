import { configDotenv } from 'dotenv';
configDotenv();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'; 
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscellaneousRoutes from './routes/miscellaneous.routes.js';
import blogRoutes from './routes/blog.routes.js';
import qaRoutes from './routes/qa.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import adminRechargeCodeRoutes from './routes/adminRechargeCode.routes.js';
import adminUserRoutes from './routes/adminUser.routes.js';
import whatsappServiceRoutes from './routes/whatsappService.routes.js';
import pdfConverterRoutes from './routes/pdfConverter.routes.js';
import examRoutes from './routes/exam.routes.js';
import videoProgressRoutes from './routes/videoProgress.routes.js';




import gradeRoutes from './routes/grade.routes.js';
import instructorRoutes from './routes/instructor.routes.js';
import stageRoutes from './routes/stage.routes.js';
import express from 'express';
import connectToDb from './config/db.config.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
    origin: [
        process.env.CLIENT_URL, 
        'http://localhost:5173', 
        'http://localhost:4000',
        'https://lms.fikra.solutions',
        'https://www.lms.fikra.solutions'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Serve uploaded files
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Test route to check uploads
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadsDir);
  res.json({ 
    message: 'Uploads directory accessible',
    files: files,
    uploadsPath: uploadsDir
  });
});

// Simple test route
app.get('/api/test', (req, res) => {
  console.log('=== API TEST ROUTE HIT ===');
  res.json({ message: 'API is working!' });
});

app.use('/api/v1/user', userRoutes); 
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
console.log('Payment routes registered at /api/v1/payments');
app.use('/api/v1/', miscellaneousRoutes);
app.use('/api/v1/', blogRoutes);
app.use('/api/v1/', qaRoutes);
app.use('/api/v1/', subjectRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/admin/recharge-codes', adminRechargeCodeRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/whatsapp-services', whatsappServiceRoutes);
app.use('/api/v1/pdf-converter', pdfConverterRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/video-progress', videoProgressRoutes);




app.use('/api/v1/grades', gradeRoutes);
app.use('/api/v1/instructors', instructorRoutes);
app.use('/api/v1/stages', stageRoutes);
 

app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 page not found');
})

app.use(errorMiddleware);

// db init
connectToDb();

export default app;