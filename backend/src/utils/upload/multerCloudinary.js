import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

/**
 * Uploader para avatares de usuario.
 * Carpeta: odontapp/avatars
 * Tamaño: 300x300 (limite)
 * Formatos: JPG, JPEG, PNG
 * Límite de archivo: 4MB
 */
const storageAvatar = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'odontapp/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

export const uploadAvatar = multer({
  storage: storageAvatar,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
  },
});
