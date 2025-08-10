/**
 * Frontend utility functions for handling file URLs
 */

/**
 * Get the base API URL from environment variables
 */
const getBaseApiUrl = () => {
  return import.meta.env.VITE_REACT_APP_API_URL || 'https://api.lms.fikra.solutions/api/v1';
};

/**
 * Generate the correct file URL for the current environment
 * @param {string} filePath - The file path from the backend (e.g., '/uploads/image.jpg')
 * @param {string} subfolder - Optional subfolder (e.g., 'avatars', 'pdfs')
 * @returns {string} Complete URL to access the file
 */
export const generateFileUrl = (filePath, subfolder = '') => {
  if (!filePath) return null;
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it's a Cloudinary URL, return as is
  if (filePath.includes('cloudinary.com') || filePath.includes('res.cloudinary.com')) {
    return filePath;
  }
  
  const baseUrl = getBaseApiUrl();
  
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  // Build the full URL
  let fullUrl;
  if (subfolder) {
    fullUrl = `${baseUrl}/uploads/${subfolder}/${cleanPath}`;
  } else {
    fullUrl = `${baseUrl}/uploads/${cleanPath}`;
  }
  
  console.log('generateFileUrl:', {
    filePath,
    subfolder,
    baseUrl,
    cleanPath,
    fullUrl
  });
  
  return fullUrl;
};

/**
 * Generate image URL specifically for course/blog/subject images
 * @param {string} secureUrl - The secure_url from the backend
 * @returns {string} Complete URL to access the image
 */
export const generateImageUrl = (secureUrl) => {
  if (!secureUrl) return null;
  
  // If it's already a full URL, return as is
  if (secureUrl.startsWith('http://') || secureUrl.startsWith('https://')) {
    return secureUrl;
  }
  
  // If it's a Cloudinary URL, return as is
  if (secureUrl.includes('cloudinary.com') || secureUrl.includes('res.cloudinary.com')) {
    return secureUrl;
  }
  
  // For local files, generate the proper API URL
  return generateFileUrl(secureUrl);
};

/**
 * Check if a URL is a local file that needs URL generation
 * @param {string} url 
 * @returns {boolean}
 */
export const isLocalFile = (url) => {
  if (!url) return false;
  return url.startsWith('/uploads/') || url.startsWith('uploads/');
};
