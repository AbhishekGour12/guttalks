import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: { type: String },
  guestName: { type: String },
  guestPhone: { type: String },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
  price: { type: Number, default: 249 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentDetails: Object,
  meetLink: { type: String },
  mcqAnswers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MCQ' },
      answer: String
    }
  ],
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);