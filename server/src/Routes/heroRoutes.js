import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getPublicSlides, 
  getAllAdminSlides, 
  createSlide, 
  updateSlide, 
  toggleSlideStatus, 
  deleteSlide 
} from '../Controllers/heroController.js';

const router = express.Router();

// Multer storage for hero slide images
const uploadDir = path.join(process.cwd(), "src", "uploads", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `hero-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Public route
router.get('/', getPublicSlides);

// Admin routes
router.get('/admin/all', getAllAdminSlides);
router.post('/', upload.single('image'), createSlide);
router.put('/:id', upload.single('image'), updateSlide);
router.patch('/:id/toggle', toggleSlideStatus);
router.delete('/:id', deleteSlide);

export default router;
