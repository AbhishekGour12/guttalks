import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  addressline1: { type: String },
  addressline2: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
});

// Consultation info for non-logged-in users
const consultationInfoSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  lastBookingDate: { type: Date },
  totalConsultations: { type: Number, default: 0 },
  bookingId: { type: String },
  date: { type: Date },
  startTime: { type: String },
  expertName: { type: String },
  meetLink: { type: String },
  status: { type: String }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  shippingAddress: shippingAddressSchema,
  
  // New fields for consultation tracking
  name: { type: String },
  email: { type: String },
  consultationHistory: [consultationInfoSchema], // Track each consultation
  totalConsultations: { type: Number, default: 0 }

}, {
  timestamps: true,
});

const User = mongoose.model("User", UserSchema);
export default User;