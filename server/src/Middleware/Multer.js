// middleware/ecommerceMulterConfig.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories with absolute path
const uploadDir = path.join(process.cwd(), "src", "uploads", "products");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with better filename handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original extension
    const ext = path.extname(file.originalname);
    // Create unique filename with timestamp
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Image-only filter
const imageFileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg", 
    "image/png", 
    "image/webp", 
    "image/jpg", 
    "image/avif", 
    "image/svg+xml", 
    "image/gif", 
    "image/tiff",
    "image/bmp", 
    "image/heic"
  ];
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), false);
  }
};

// Excel + images filter
const excelAndImageFileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/vnd.oasis.opendocument.spreadsheet"
  ];
  
  const allowedExtensions = ['.xlsx', '.xls', '.csv', '.ods'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowed.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images and Excel files are allowed.`), false);
  }
};

// Fields upload (for mixed file types) - INCREASE limits
export const uploadMixedFiles = multer({
  storage,
  fileFilter: excelAndImageFileFilter,
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200MB
    files: 100 // Allow up to 100 files
  },
}).fields([
  { name: 'excelFile', maxCount: 1 },
  { name: 'productImages', maxCount: 100 },
  { name: 'images', maxCount: 100 }
]);

// Product images upload
export const uploadProductImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Multiple images upload
export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
}).array('images', 20);

// Excel + images upload for bulk operations
export const uploadExcelAndImages = multer({
  storage,
  fileFilter: excelAndImageFileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});

// Error handler middleware for multer
export const handleMulterError = (err, req, res, next) => {
  console.error('Multer error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: `Unexpected field: ${err.field}. Expected fields: excelFile, productImages, images` });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};