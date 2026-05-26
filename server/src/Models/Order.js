import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  quantity: Number,
  priceAtPurchase: Number,
  weight: { type: Number, default: 0.5 }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: {   // for non‑logged‑in users
    name: String,
    email: String,
    phone: String
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String
  },
  subtotal: Number,
  discount: { type: Number, default: 0 },
  couponCode: String,
  shippingCharge: { type: Number, default: 0 },
  totalAmount: Number,
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'online' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentDetails: Object,
  // Shiprocket fields
  shiprocketOrderId: String,
  shipmentId: String,
  awbCode: String,
  shiprocketStatus: { type: String, default: 'Pending' },
  shiprocketStatusDate: Date,
  trackingHistory: { type: Array, default: [] },
  // COD specific
  codFee: { type: Number, default: 0 },
  customStatus: { 
    type: String, 
    enum: [
      'order_placed',
      'kit_dispatched',
      'kit_delivered',
      'pickup_requested',
      'pickup_initiated',
      'sample_picked_up',
      'sample_received',
      'qc_passed',
      'completed',
      'cancelled'
    ],
    default: 'order_placed'
  },
  customStatusUpdatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);