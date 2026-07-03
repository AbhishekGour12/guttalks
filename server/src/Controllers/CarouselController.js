// controllers/carouselController.js
import Carousel from '../Models/Carousel.js';
import fs from 'fs';
import path from 'path';

// Get all active carousel slides
export const getCarouselSlides = async (req, res) => {
  try {
    const slides = await Carousel.find({ isActive: true }).sort('order');
    res.status(200).json(slides);
  } catch (error) {
    console.error("❌ getCarouselSlides error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all carousel slides (admin)
export const getAllCarouselSlides = async (req, res) => {
  try {
    const slides = await Carousel.find().sort('order');
    res.status(200).json(slides);
  } catch (error) {
    console.error("❌ getAllCarouselSlides error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single carousel slide
export const getCarouselSlideById = async (req, res) => {
  try {
    const slide = await Carousel.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    res.status(200).json(slide);
  } catch (error) {
    console.error("❌ getCarouselSlideById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add new carousel slide with images
export const addCarouselSlide = async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, order, backgroundColor } = req.body;
    const leftImageFile = req.files?.leftImage?.[0];
    const rightImageFile = req.files?.rightImage?.[0];
    const mobileImageFile = req.files?.mobileImage?.[0];

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!leftImageFile || !rightImageFile) {
      return res.status(400).json({ error: 'Left and right images are required' });
    }

    const leftImageUrl = `/uploads/carousel/${leftImageFile.filename}`;
    const rightImageUrl = `/uploads/carousel/${rightImageFile.filename}`;
    const mobileImageUrl = mobileImageFile ? `/uploads/carousel/${mobileImageFile.filename}` : leftImageUrl;

    const slide = new Carousel({
      title: title.trim(),
      subtitle: subtitle || '',
      buttonText: buttonText,
      buttonLink: buttonLink,
      leftImage: leftImageUrl,
      rightImage: rightImageUrl,
      mobileImage: mobileImageUrl,
      order: order || 0,
      backgroundColor: backgroundColor || '#F0F7E6'
    });

    await slide.save();

    res.status(201).json({
      message: '✅ Carousel slide added successfully',
      slide
    });
  } catch (error) {
    console.error("❌ addCarouselSlide error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update carousel slide
export const updateCarouselSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, buttonText, buttonLink, order, isActive, backgroundColor } = req.body;
    const leftImageFile = req.files?.leftImage?.[0];
    const rightImageFile = req.files?.rightImage?.[0];
    const mobileImageFile = req.files?.mobileImage?.[0];

    const slide = await Carousel.findById(id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    // Update fields
    if (title) slide.title = title.trim();
    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (buttonText) slide.buttonText = buttonText;
    if (buttonLink) slide.buttonLink = buttonLink;
    if (order !== undefined) slide.order = order;
    if (isActive !== undefined) slide.isActive = isActive;
    if (backgroundColor) slide.backgroundColor = backgroundColor;

    // Update left image if new one is uploaded
    if (leftImageFile) {
      if (slide.leftImage) {
        const oldImagePath = path.join(process.cwd(), 'src', slide.leftImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      slide.leftImage = `/uploads/carousel/${leftImageFile.filename}`;
    }

    // Update right image if new one is uploaded
    if (rightImageFile) {
      if (slide.rightImage) {
        const oldImagePath = path.join(process.cwd(), 'src', slide.rightImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      slide.rightImage = `/uploads/carousel/${rightImageFile.filename}`;
    }

    // Update mobile image if new one is uploaded
    if (mobileImageFile) {
      if (slide.mobileImage) {
        const oldImagePath = path.join(process.cwd(), 'src', slide.mobileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      slide.mobileImage = `/uploads/carousel/${mobileImageFile.filename}`;
    }

    await slide.save();

    res.status(200).json({
      message: '✅ Carousel slide updated successfully',
      slide
    });
  } catch (error) {
    console.error("❌ updateCarouselSlide error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete carousel slide
export const deleteCarouselSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await Carousel.findById(id);

    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    // Delete images
    const images = [slide.leftImage, slide.rightImage, slide.mobileImage];
    images.forEach(image => {
      if (image) {
        const imagePath = path.join(process.cwd(), 'src', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    await slide.deleteOne();

    res.status(200).json({ message: '✅ Carousel slide deleted successfully' });
  } catch (error) {
    console.error("❌ deleteCarouselSlide error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update carousel slides order (bulk)
export const updateCarouselOrder = async (req, res) => {
  try {
    const { slides } = req.body; // Array of { id, order }

    for (const slide of slides) {
      await Carousel.findByIdAndUpdate(slide.id, { order: slide.order });
    }

    res.status(200).json({ message: '✅ Carousel order updated successfully' });
  } catch (error) {
    console.error("❌ updateCarouselOrder error:", error);
    res.status(500).json({ error: error.message });
  }
};