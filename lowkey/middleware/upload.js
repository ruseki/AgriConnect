import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // Folder where files will be stored in Cloudinary
    allowed_formats: ['jpeg', 'jpg', 'png'], // Allowed file formats
  },
});

const upload = multer({ storage });

export default upload;