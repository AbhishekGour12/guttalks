import HeroSlide from '../Models/HeroSlide.js';
import fs from 'fs';
import path from 'path';

// Seed default slides if collection is completely empty
const defaultSlides = [
  {
    title: "Understand Your Inner World",
    description: "GutMap Complete™ — advanced at-home microbiome testing with expert insights.",
    badge: "GutMap Complete",
    image: "/herocraousel_1.png",
    originalPrice: 399,
    offerPrice: 99,
    ctaText: "Book Consultation for",
    order: 1,
    isActive: true,
  },
  {
    title: "Personalized Gut Care Starts Here",
    description: "Root Rx Session — science, insights, and a roadmap built around you.",
    badge: "Root Rx · ₹99",
    image: "/herocraousel_2.png",
    originalPrice: 399,
    offerPrice: 99,
    ctaText: "Book Consultation for",
    order: 2,
    isActive: true,
  },
  {
    title: "Every Gut is Unique",
    description: "Test, personalize, and thrive with science-backed solutions designed for you.",
    badge: "Your Gut Journey",
    image: "/herocraousel_3.png",
    originalPrice: 399,
    offerPrice: 99,
    ctaText: "Book Consultation for",
    order: 3,
    isActive: true,
  }
];

// GET /api/hero-slides (Public)
export const getPublicSlides = async (req, res) => {
  try {
    let slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    
    // Auto-seed default slides if empty
    if (!slides || slides.length === 0) {
      const count = await HeroSlide.countDocuments();
      if (count === 0) {
        slides = await HeroSlide.insertMany(defaultSlides);
      }
    }

    res.status(200).json({ success: true, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch hero slides" });
  }
};

// GET /api/hero-slides/admin/all (Admin)
export const getAllAdminSlides = async (req, res) => {
  try {
    let slides = await HeroSlide.find({}).sort({ order: 1, createdAt: -1 });

    // Seed defaults if empty
    if (!slides || slides.length === 0) {
      slides = await HeroSlide.insertMany(defaultSlides);
    }

    res.status(200).json({ success: true, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admin slides" });
  }
};

// POST /api/hero-slides (Admin)
export const createSlide = async (req, res) => {
  try {
    const { title, description, badge, originalPrice, offerPrice, ctaText, ctaLink, order, image: imageUrl } = req.body;

    let imagePath = imageUrl || '';
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    if (!title || !imagePath) {
      return res.status(400).json({ success: false, message: "Title and Image are required" });
    }

    const newSlide = new HeroSlide({
      title,
      description: description || '',
      badge: badge || '',
      image: imagePath,
      originalPrice: Number(originalPrice) || 399,
      offerPrice: Number(offerPrice) || 99,
      ctaText: ctaText || 'Book Consultation for',
      ctaLink: ctaLink || '',
      order: Number(order) || 0,
      isActive: true,
    });

    await newSlide.save();
    res.status(201).json({ success: true, message: "Hero slide created successfully", slide: newSlide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to create slide" });
  }
};

// PUT /api/hero-slides/:id (Admin)
export const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, badge, originalPrice, offerPrice, ctaText, ctaLink, order, isActive, image: imageUrl } = req.body;

    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    let imagePath = slide.image;
    if (req.file) {
      // If old image was an uploaded file, remove it
      if (slide.image && slide.image.startsWith('/uploads/products/')) {
        const oldFileName = slide.image.replace('/uploads/products/', '');
        const oldFullPath = path.join(process.cwd(), 'src', 'uploads', 'products', oldFileName);
        if (fs.existsSync(oldFullPath)) {
          try { fs.unlinkSync(oldFullPath); } catch (_) {}
        }
      }
      imagePath = `/uploads/products/${req.file.filename}`;
    } else if (imageUrl) {
      imagePath = imageUrl;
    }

    slide.title = title !== undefined ? title : slide.title;
    slide.description = description !== undefined ? description : slide.description;
    slide.badge = badge !== undefined ? badge : slide.badge;
    slide.image = imagePath;
    slide.originalPrice = originalPrice !== undefined ? Number(originalPrice) : slide.originalPrice;
    slide.offerPrice = offerPrice !== undefined ? Number(offerPrice) : slide.offerPrice;
    slide.ctaText = ctaText !== undefined ? ctaText : slide.ctaText;
    slide.ctaLink = ctaLink !== undefined ? ctaLink : slide.ctaLink;
    slide.order = order !== undefined ? Number(order) : slide.order;
    if (isActive !== undefined) slide.isActive = Boolean(isActive);

    await slide.save();
    res.status(200).json({ success: true, message: "Hero slide updated successfully", slide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update slide" });
  }
};

// PATCH /api/hero-slides/:id/toggle (Admin)
export const toggleSlideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    slide.isActive = !slide.isActive;
    await slide.save();

    res.status(200).json({ success: true, message: `Slide ${slide.isActive ? 'activated' : 'deactivated'}`, slide });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle slide status" });
  }
};

// DELETE /api/hero-slides/:id (Admin)
export const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    // Attempt file cleanup if uploaded file
    if (slide.image && slide.image.startsWith('/uploads/products/')) {
      const fileName = slide.image.replace('/uploads/products/', '');
      const fullPath = path.join(process.cwd(), 'src', 'uploads', 'products', fileName);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (_) {}
      }
    }

    await HeroSlide.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Hero slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete hero slide" });
  }
};
