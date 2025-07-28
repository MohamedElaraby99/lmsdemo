import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Test uploads route
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      message: 'Uploads directory accessible',
      files: files,
      uploadsPath: uploadsDir
    });
  } catch (error) {
    res.json({ 
      message: 'Error reading uploads directory',
      error: error.message,
      uploadsPath: uploadsDir
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Test server started at http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: http://localhost:${PORT}/uploads`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
}); 