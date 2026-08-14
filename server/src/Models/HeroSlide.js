import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  badge: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    required: true,
  },
  originalPrice: {
    type: Number,
    default: 399,
  },
  offerPrice: {
    type: Number,
    default: 99,
  },
  ctaText: {
    type: String,
    default: 'Book Consultation for',
  },
  ctaLink: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

export default HeroSlide;
