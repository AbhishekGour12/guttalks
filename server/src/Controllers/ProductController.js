// ============== PRODUCT CRUD (Updated) ==============
import { Product } from "../Models/Product.js";
import fs from "fs";
import path from "path";
// Add single product (consultation or program)
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.product || "{}");
    const uploadedFiles = req.files || [];
   

    const imageUrls = uploadedFiles.map(
      (file) => `/uploads/products/${file.filename}`
    );

    // Validate required fields
    if (!productData.name || !productData.productType) {
      return res.status(400).json({ error: 'Name and product type are required' });
    }
    if (productData.productType === 'consultation' && !productData.consultationDuration) {
      return res.status(400).json({ error: 'Consultation duration is required' });
    }
    if (productData.productType === 'program' && productData.stock === undefined) {
      return res.status(400).json({ error: 'Stock is required for program products' });
    }
const durationOptions = productData.durationOptions?.map(opt => ({
  duration: opt.duration,
  originalPrice: Number(opt.originalPrice),
  salePrice: Number(opt.salePrice),
  discountPercent: opt.discountPercent || Math.round(((opt.originalPrice - opt.salePrice) / opt.originalPrice) * 100)
})) || [];

const packOptions = productData.packOptions?.map(opt => ({
  name: opt.name,
  originalPrice: Number(opt.originalPrice),
  salePrice: Number(opt.salePrice),
  discountPercent: opt.discountPercent || Math.round(((opt.originalPrice - opt.salePrice) / opt.originalPrice) * 100)
})) || [];
    // Prepare product object
    const product = new Product({
      name: productData.name,
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      productType: productData.productType,
      originalPrice: Number(productData.originalPrice).toFixed(2),
      salePrice: Number(productData.salePrice).toFixed(2),
      taxNote: productData.taxNote || 'Tax included. Shipping calculated at checkout.',
      rating: Number(productData.rating) || 0,
      reviewCount: Number(productData.reviewCount) || 0,
      benefits: productData.benefits || [],
      whatToExpect: productData.whatToExpect || [],
      faqs: productData.faqs || [],
      imageUrls: imageUrls,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      isFeatured: productData.isFeatured || false,
      // Consultation specific
      consultationDuration: productData.consultationDuration || '30 mins',
      expertName: productData.expertName || '',
      // Program specific
      stock: productData.productType === 'program' ? Number(productData.stock) : 0,
      weight: productData.productType === 'program' ? (Number(productData.weight) || 0.5) : 0,
      durationOptions,
      packOptions
    });

    await product.save();

    res.status(201).json({
      message: "✅ Product added successfully",
      product
    });
  } catch (error) {
    console.error("❌ addProduct error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all products with filters (supports new fields)
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      productType,
      minPrice,
      maxPrice,
      isFeatured,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (productType) filter.productType = productType;
    if (isFeatured !== undefined && isFeatured !== '') filter.isFeatured = isFeatured === 'true';
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';

    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);
   
    res.status(200).json({
      products,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      limit: Number(limit)
    });
  } catch (error) {
    console.error("❌ getAllProducts error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("❌ getProductById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.product || "{}");
    const uploadedFiles = req.files || [];

    // Get existing product to preserve old images if needed
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newImageUrls = uploadedFiles.map(
      (file) => `/uploads/products/${file.filename}`
    );

    // Combine existing images (from productData.existingImages) with new ones
    const existingImages = productData.existingImages ? JSON.parse(productData.existingImages) : existingProduct.imageUrls;
    const allImageUrls = [...existingImages, ...newImageUrls];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: productData.name,
        shortDescription: productData.shortDescription,
        description: productData.description,
        productType: productData.productType,
        originalPrice: Number(productData.originalPrice).toFixed(0) || '0.00',
        salePrice: Number(productData.salePrice).toFixed(0) || '0.00',
        taxNote: productData.taxNote,
        rating: Number(productData.rating) || 0,
        reviewCount: Number(productData.reviewCount) || 0,
        benefits: productData.benefits || [],
        whatToExpect: productData.whatToExpect || [],
        faqs: productData.faqs || [],
        imageUrls: allImageUrls,
        isActive: productData.isActive,
        isFeatured: productData.isFeatured,
        consultationDuration: productData.consultationDuration,
        expertName: productData.expertName,
        stock: productData.productType === 'program' ? Number(productData.stock) : 0,
        weight: productData.productType === 'program' ? Number(productData.weight) : 0,
        updatedAt: Date.now(),
        // Inside addProduct, after parsing productData
  durationOptions: productData.durationOptions?.map(opt => ({
      duration: opt.duration,
      originalPrice: Number(opt.originalPrice),
      salePrice: Number(opt.salePrice),
      discountPercent: opt.discountPercent || Math.round(((opt.originalPrice - opt.salePrice) / opt.originalPrice) * 100)
    })) || [],
    packOptions: productData.packOptions?.map(opt => ({
      name: opt.name,
      originalPrice: Number(opt.originalPrice),
      salePrice: Number(opt.salePrice),
      discountPercent: opt.discountPercent || Math.round(((opt.originalPrice - opt.salePrice) / opt.originalPrice) * 100)
    })) || [],
      },
      { new: true }
    );

    res.status(200).json({
      message: "✅ Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error("❌ updateProduct error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete product (and its images)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated images from filesystem
    if (product.imageUrls && product.imageUrls.length > 0) {
      product.imageUrls.forEach((imgPath) => {
        const fullPath = path.join(process.cwd(), imgPath.replace("/", ""));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product and all images deleted successfully" });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message });
  }
};

// Delete multiple products
export const deleteMultipleProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    let deletedCount = 0;

    for (const product of products) {
      if (product.imageUrls && product.imageUrls.length > 0) {
        product.imageUrls.forEach((imgPath) => {
          const fullPath = path.join(process.cwd(), imgPath.replace("/", ""));
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
      }
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } });
    deletedCount = result.deletedCount;

    res.status(200).json({ message: `${deletedCount} products deleted successfully`, deletedCount });
  } catch (error) {
    console.error("❌ deleteMultipleProducts error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get product by slug (for frontend product pages)
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isActive: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ product });
  } catch (error) {
    console.error("❌ getProductBySlug error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Bulk add multiple products (manual entry, no Excel)
export const bulkAddProducts = async (req, res) => {
  try {
    const productsData = JSON.parse(req.body.products || "[]");
    const uploadedFiles = req.files || [];

    let fileIndex = 0;
    const productsToInsert = [];

    for (const productData of productsData) {
      // Number of images for this product (sent from frontend)
      const imageCount = productData.imageFilesCount || 0;
      const productImages = uploadedFiles.slice(fileIndex, fileIndex + imageCount);
      const imageUrls = productImages.map(file => `/uploads/products/${file.filename}`);
      fileIndex += imageCount;

      // Validate required fields
      if (!productData.name || !productData.productType) {
        throw new Error(`Product "${productData.name || 'unknown'}" missing name or productType`);
      }
      if (productData.productType === 'consultation' && !productData.consultationDuration) {
        throw new Error(`Consultation product "${productData.name}" missing duration`);
      }
      if (productData.productType === 'program' && productData.stock === undefined) {
        throw new Error(`Program product "${productData.name}" missing stock`);
      }

      productsToInsert.push({
        name: productData.name,
        shortDescription: productData.shortDescription || '',
        description: productData.description || '',
        productType: productData.productType,
        originalPrice: Number(productData.originalPrice).toFixed(0) || '0.00',
        salePrice: Number(productData.salePrice).toFixed(0) || '0.00',
        taxNote: productData.taxNote || 'Tax included. Shipping calculated at checkout.',
        rating: Number(productData.rating) || 0,
        reviewCount: Number(productData.reviewCount) || 0,
        benefits: productData.benefits || [],
        whatToExpect: productData.whatToExpect || [],
        faqs: productData.faqs || [],
        imageUrls,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        isFeatured: productData.isFeatured || false,
        consultationDuration: productData.consultationDuration || '30 mins',
        expertName: productData.expertName || '',
        stock: productData.productType === 'program' ? Number(productData.stock) : 0,
        weight: productData.productType === 'program' ? (Number(productData.weight) || 0.5) : 0,
        // Inside addProduct, after parsing productData
durationOptions: productData.durationOptions || [],
packOptions: productData.packOptions || [],
      });
    }

    const savedProducts = await Product.insertMany(productsToInsert);
    res.status(201).json({
      message: `✅ ${savedProducts.length} products added successfully`,
      created: savedProducts.length,
      products: savedProducts
    });
  } catch (error) {
    console.error("❌ bulkAddProducts error:", error);
    res.status(500).json({ error: error.message });
  }
};