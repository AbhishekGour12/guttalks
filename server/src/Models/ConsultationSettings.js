import mongoose from 'mongoose';

const consultationSettingsSchema = new mongoose.Schema({
  basePrice: { type: Number, default: 499 },
  offerPrice: { type: Number, default: 99 },
  timerDurationMinutes: { type: Number, default: 5 },
  isOfferActive: { type: Boolean, default: true },
  bannerText: { type: String, default: "⚡ Special Offer! Book Root Rx Session for ₹99 (Was ₹499)" },
}, { timestamps: true });

export default mongoose.model('ConsultationSettings', consultationSettingsSchema);
