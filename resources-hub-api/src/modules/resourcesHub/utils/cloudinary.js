import { v2 as cloudinary } from 'cloudinary';

// Use CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name) or separate vars
const url = process.env.CLOUDINARY_URL;
if (url) {
  const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (match) {
    cloudinary.config({
      cloud_name: match[3],
      api_key: match[1],
      api_secret: match[2],
    });
  } else {
    cloudinary.config({ cloudinary_url: url });
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateImageUpload = (file) => {
  if (!file || !file.mimetype) {
    return { valid: false, error: 'No file provided' };
  }
  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    return { valid: false, error: 'Only image uploads allowed (JPEG, PNG, WebP, GIF). Video uploads are disabled.' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image size must be under 5MB' };
  }
  return { valid: true };
};

export const uploadImage = async (filePath, folder = 'resources_hub') => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'image',
    folder,
  });
  return result.secure_url;
};

export default cloudinary;
