// controllers/heroCategoryController.js
import HeroCategory from '../Models/Category.js';
import fs from 'fs';
import path from 'path';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await HeroCategory.find({ isActive: true }).sort('order');
    res.status(200).json(categories);
  } catch (error) {
    console.error("❌ getCategories error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single category
export const getCategoryById = async (req, res) => {
  try {
    const category = await HeroCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("❌ getCategoryById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add new category with image upload
export const addCategory = async (req, res) => {
  try {
    const { name, order } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (!imageFile) {
      return res.status(400).json({ error: 'Category image is required' });
    }

    // Check if category already exists
    const existingCategory = await HeroCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const imageUrl = `/uploads/products/${imageFile.filename}`;

    const category = new HeroCategory({
      name: name.trim(),
      image: imageUrl,
      order: order || 0
    });

    await category.save();

    res.status(201).json({
      message: '✅ Category added successfully',
      category
    });
  } catch (error) {
    console.error("❌ addCategory error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order, isActive } = req.body;
    const imageFile = req.file;

    const category = await HeroCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update fields
    if (name) category.name = name.trim();
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    // Update image if new one is uploaded
    if (imageFile) {
      // Delete old image if exists
      if (category.image) {
        const oldImagePath = path.join(process.cwd(), 'src', category.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      category.image = `/uploads/products/${imageFile.filename}`;
    }

    await category.save();

    res.status(200).json({
      message: '✅ Category updated successfully',
      category
    });
  } catch (error) {
    console.error("❌ updateCategory error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await HeroCategory.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete image file
    if (category.image) {
      const imagePath = path.join(process.cwd(), 'src', category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await category.deleteOne();

    res.status(200).json({ message: '✅ Category deleted successfully' });
  } catch (error) {
    console.error("❌ deleteCategory error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update categories order (bulk)
export const updateCategoriesOrder = async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, order }

    for (const cat of categories) {
      await HeroCategory.findByIdAndUpdate(cat.id, { order: cat.order });
    }

    res.status(200).json({ message: '✅ Categories order updated successfully' });
  } catch (error) {
    console.error("❌ updateCategoriesOrder error:", error);
    res.status(500).json({ error: error.message });
  }
};