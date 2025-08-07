import express from 'express';
import upload from '../middleware/multer.middleware.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

import {contactUs, stats} from '../controllers/miscellaneous.controller.js';
import {isLoggedIn, authorisedRoles} from '../middleware/auth.middleware.js'

router.post("/contact", contactUs);
router.get("/admin/stats/users", isLoggedIn, authorisedRoles("ADMIN"), stats);

// PDF upload endpoint
router.post('/upload/pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Move file to uploads/pdfs if not already there
  const uploadsDir = path.join('uploads', 'pdfs');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const ext = path.extname(req.file.originalname);
  const destPath = path.join(uploadsDir, req.file.filename);
  fs.renameSync(req.file.path, destPath);
  const fileUrl = `/uploads/pdfs/${req.file.filename}`;
  return res.status(200).json({ success: true, url: fileUrl, fileName: req.file.filename });
});

// Image upload endpoint
router.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Move file to uploads/images if not already there
  const uploadsDir = path.join('uploads', 'images');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const destPath = path.join(uploadsDir, req.file.filename);
  fs.renameSync(req.file.path, destPath);
  const fileUrl = `/uploads/images/${req.file.filename}`;
  return res.status(200).json({ success: true, url: fileUrl, fileName: req.file.filename });
});

export default router;