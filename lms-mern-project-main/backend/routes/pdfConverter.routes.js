import express from 'express';
import { convertPdfToImages, getConvertedImage, testPdfExists } from '../controllers/pdfConverter.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// Test if PDF exists
router.get('/test/:filename', testPdfExists);

// Convert PDF to images
router.post('/convert', isLoggedIn, convertPdfToImages);

// Get converted image
router.get('/image/:filename', getConvertedImage);

export default router;
