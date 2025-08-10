# Production File Serving Configuration

This guide explains how to configure file serving for production deployment at `api.lms.fikra.solutions`.

## 🔧 Environment Configuration

### Required Environment Variables

Add these to your production `.env` file:

```bash
# Production Environment
NODE_ENV=production

# Backend URL - This determines how file URLs are generated
BACKEND_URL=https://api.lms.fikra.solutions

# Port (usually handled by deployment platform)
PORT=4000

# Other existing variables...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 📁 File Serving Endpoints

The backend now serves uploaded files through these endpoints:

### Primary API Route (Production)
```
https://api.lms.fikra.solutions/api/v1/uploads/
```

### Backward Compatibility Route
```
https://api.lms.fikra.solutions/uploads/
```

## 🗂️ File Organization

Files are organized in the following structure:

```
uploads/
├── avatars/           # User profile pictures
├── images/           # General images
├── pdfs/            # PDF documents
├── lessons/         # Lesson content files
└── converted-pdfs/  # Converted PDF files
```

## 🌐 URL Generation

### Production URLs Examples:

- **User Avatar**: `https://api.lms.fikra.solutions/api/v1/uploads/avatars/user_12345.jpg`
- **Instructor Image**: `https://api.lms.fikra.solutions/api/v1/uploads/instructor_67890.jpg`
- **Course PDF**: `https://api.lms.fikra.solutions/api/v1/uploads/pdfs/lesson_content.pdf`

### Local Development URLs:
- **User Avatar**: `http://localhost:4000/api/v1/uploads/avatars/user_12345.jpg`

## 🔄 How It Works

1. **File Upload**: Files are uploaded to the server's `uploads/` directory
2. **URL Generation**: The `generateProductionFileUrl()` utility function creates the appropriate URL
3. **Environment Detection**: 
   - Production: Uses `https://api.lms.fikra.solutions`
   - Development: Uses `http://localhost:4000`
4. **Database Storage**: The generated URL is stored in the database
5. **Frontend Access**: The frontend receives the complete URL and displays the files

## 🚀 Deployment Steps

1. **Set Environment Variables**:
   ```bash
   NODE_ENV=production
   BACKEND_URL=https://api.lms.fikra.solutions
   ```

2. **Deploy Backend**: Ensure your backend is running at `api.lms.fikra.solutions`

3. **Test File Access**: Use the test endpoint:
   ```
   GET https://api.lms.fikra.solutions/api/v1/test-uploads
   ```

4. **Verify URLs**: Check that generated URLs in responses use the production domain

## 🧪 Testing

### Test Upload Endpoint
```bash
curl https://api.lms.fikra.solutions/api/v1/test-uploads
```

Expected response:
```json
{
  "message": "Uploads directory accessible",
  "files": ["file1.jpg", "file2.pdf"],
  "apiUploadUrl": "https://api.lms.fikra.solutions/api/v1/uploads/",
  "legacyUploadUrl": "https://api.lms.fikra.solutions/uploads/",
  "sampleUrls": [
    {
      "filename": "file1.jpg",
      "apiUrl": "https://api.lms.fikra.solutions/api/v1/uploads/file1.jpg",
      "legacyUrl": "https://api.lms.fikra.solutions/uploads/file1.jpg"
    }
  ]
}
```

### Test File Access
```bash
curl https://api.lms.fikra.solutions/api/v1/uploads/avatars/some_avatar.jpg
```

## 🔒 Security Features

- **CORS Headers**: Properly configured for cross-origin requests
- **Cache Control**: Files cached for 1 year for optimal performance
- **Access Control**: Only GET requests allowed for file access

## 🐛 Troubleshooting

### Issue: Files not accessible
- ✅ Check `BACKEND_URL` environment variable
- ✅ Verify `NODE_ENV=production`
- ✅ Ensure uploads directory exists
- ✅ Check file permissions

### Issue: Wrong URLs in database
- ✅ Restart backend after setting environment variables
- ✅ Re-upload files to generate new URLs
- ✅ Check database entries for correct URLs

### Issue: CORS errors
- ✅ Verify CORS configuration in `app.js`
- ✅ Check if frontend domain is in allowed origins

## 📋 File Types Supported

### Image Files
- User avatars (JPG, PNG)
- Instructor profile images
- Course thumbnails

### Document Files
- PDF lessons and materials
- Converted PDF content

### File Size Limits
- Images: Configured in multer middleware
- Documents: Configured in multer middleware

## 🔄 Migration from Old URLs

If you have existing files with old URL patterns, they will be automatically updated when:
1. Users update their profiles
2. Instructors update their information
3. Course content is modified

The system maintains backward compatibility during the transition period.
