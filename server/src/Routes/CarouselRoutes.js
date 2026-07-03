// routes/carouselRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getCarouselSlides,
  getAllCarouselSlides,
  getCarouselSlideById,
  addCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  updateCarouselOrder
} from '../Controllers/CarouselController.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'src/uploads/carousel');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Routes
router.get('/', getCarouselSlides);
router.get('/admin', getAllCarouselSlides);
router.get('/:id', getCarouselSlideById);
router.post('/', upload.fields([
  { name: 'leftImage', maxCount: 1 },
  { name: 'rightImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), addCarouselSlide);
router.put('/:id', upload.fields([
  { name: 'leftImage', maxCount: 1 },
  { name: 'rightImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), updateCarouselSlide);
router.delete('/:id', deleteCarouselSlide);
router.put('/order/bulk', updateCarouselOrder);

export default router;