import mongoose from 'mongoose';
import slugify from 'slugify';

const whatToExpectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

// Duration Option (for programs with varying durations)
const durationOptionSchema = new mongoose.Schema({
  duration: { type: String, required: true }, // e.g., "1 Month", "3 Months"
  originalPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0 },
}, { _id: false });

// Pack Option (for programs with pack sizes)
const packOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Single Pack", "Pack of 2"
  originalPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0 },
}, { _id: false });

const productSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  productType: { type: String, enum: ['consultation', 'program'], required: true },
  
  // Program options (only for program type)
  durationOptions: [durationOptionSchema],
  packOptions: [packOptionSchema],
 
  // Pricing
  originalPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  taxNote: { type: String, default: 'Tax included. Shipping calculated at checkout.' },
  
  // Ratings & Reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // Content Sections
  benefits: {type: Array},
  whatToExpect: [whatToExpectSchema],
  faqs: [faqSchema],
  
  // Images
  imageUrls: [{ type: String }],
  
  // Consultation specific
  consultationDuration: { type: String, default: '30 mins' },
  expertName: { type: String, default: '' },
  
  // Program specific
  stock: { type: Number },
  weight: { type: Number, default: 0.5, min: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // SEO / Metadata
  metaTitle: { type: String },
  metaDescription: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate slug from name
productSchema.pre("save", async function () {
  if (this.isModified("name") || !this.slug) {
    const baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let count = 1;

    // Avoid duplicate slug
    while (await this.constructor.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    this.slug = slug;
  }
});

export const Product = mongoose.model('Product', productSchema);