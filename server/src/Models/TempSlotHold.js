// Models/TempSlotHold.js
import mongoose from 'mongoose';

const tempSlotHoldSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, expires: 300 } // auto-delete after 5 minutes
});

// Compound index to ensure uniqueness per slot
tempSlotHoldSchema.index({ date: 1, startTime: 1, userId: 1 }, { unique: true });

export default mongoose.model('TempSlotHold', tempSlotHoldSchema);