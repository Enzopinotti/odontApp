// backend/src/utils/upload/multerCloudinary.js

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

/**
 * Uploader para avatares de usuario.
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
    fileSize: 4 * 1024 * 1024,
  },
});

/**
 * Uploader para imágenes clínicas.
 * Carpeta: odontapp/historias
 * No transforma tamaño.
 * Permite JPG/JPEG/PNG, hasta 8MB.
 */
const storageImagenClinica = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'odontapp/historias',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

export const uploadImagenesClinicas = multer({
  storage: storageImagenClinica,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB por archivo
  },
});
