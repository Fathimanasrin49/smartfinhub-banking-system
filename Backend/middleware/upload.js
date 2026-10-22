import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads', file.fieldname === 'photo' ? 'photos' : 'kyc');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png|gif|webp/i;
  const allowedKyc = /jpeg|jpg|png|gif|webp|pdf/i;
  const ext = path.extname(file.originalname).slice(1) || '';
  const mime = file.mimetype;

  if (file.fieldname === 'photo') {
    if (allowedImage.test(ext) || mime.startsWith('image/')) return cb(null, true);
    return cb(new Error('Photo must be an image (jpeg, png, gif, webp)'), false);
  }
  if (file.fieldname === 'kycProof') {
    if (allowedKyc.test(ext) || mime.startsWith('image/') || mime === 'application/pdf') return cb(null, true);
    return cb(new Error('KYC must be image or PDF'), false);
  }
  cb(null, true);
};

export const signupUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).any();
