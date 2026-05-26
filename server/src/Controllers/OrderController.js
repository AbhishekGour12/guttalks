// controllers/orderController.js (partial – reuse your existing functions)
import Order from '../Models/Order.js';
import Cart from '../Models/Carts.js';
import {Product} from '../Models/Product.js';
import User from '../Models/User.js';
import { createShiprocketOrder, assignAWB, trackShipment, getAWBFromOrder } from '../services/shipRocketServices.js';
import mongoose from 'mongoose';
import console from 'console';

export const createOrder = async (req, res) => {
  
  
  const session = await mongoose.startSession();
  

  try {
    session.startTransaction();
    const {
      shippingAddress,
      paymentMethod,
      discount = 0,
      paymentDetails = null,
      isCODEnabled = false,
      totalWeight = 0.5,
      phone,
      items,
      userId,
      finalAmount
    } = req.body;
    let user = null;
if (phone) {
  user = await User.findOne({ phone });
}

let cartItems = [];
    if (!shippingAddress) throw new Error("Shipping address required");
    if (!paymentMethod) throw new Error("Payment method required");
     
    // Fetch cart
   
   if (userId) {
  const cart = await Cart.findOne({ userId: user._id }).populate("items.product");

  if (!cart || cart.items.length === 0)
    throw new Error("Your cart is empty");

  cartItems = cart.items;
}else {
  if (!items || items.length === 0)
    throw new Error("No items provided");

  cartItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) throw new Error("Product not found");

      return {
        product,
        quantity: item.quantity
      };
    })
  );
}
  

    for (const item of cartItems) {
  if (item.quantity > item.product.stock) {
    throw new Error(
      `${item.product.name} is out of stock`
    );
  }
}

    
    if (!cartItems || cartItems.length === 0) throw new Error("Your cart is empty");

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    const totalAmount = finalAmount;
    const paymentStatus = paymentMethod === "online" ? "Paid" : "Pending";
 
    // Weight
    let calculatedWeight = cartItems.reduce(
      (sum, item) => sum + (item.product.weight ?? 0.2) * item.quantity,
      0
    );

    if (totalWeight > 0) calculatedWeight = totalWeight;
   
    // Format items
    const orderItems = cartItems.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      image: item.product.imageUrls?.[0] || "",
      priceAtPurchase: item.product.salePrice,
      quantity: item.quantity,
      weight: item.product.weight || 0.2
    }));

    // Prepare order object for Shiprocket
    let plainOrder = {
      _id: new mongoose.Types.ObjectId().toString(),
      items: orderItems.map((i) => ({ ...i, product: i.productId.toString() })),
      shippingAddress,
      subtotal,
      paymentMethod,
      discount,
      totalAmount,
      weight: calculatedWeight
    };
    
    // -----------------------------------
    // CREATE ORDER IN SHIPROCKET FIRST
    // -----------------------------------
    try{
    /**   
    const shipOrder = await createShiprocketOrder(plainOrder, {
      weight: calculatedWeight,
      isCOD: isCODEnabled
    });
    
  
    if (!shipOrder || !shipOrder.order_id) {
  await session.abortTransaction();
  session.endSession();
  return res.status(400).json({
    success:false,
    message:"Shiprocket order failed",
    errors: shipOrder?.errors
  });
}

    if (!shipOrder || !shipOrder.order_id) throw new Error("Shiprocket order failed");

    const awbRes = await assignAWB(shipOrder.shipment_id);
     
    // -----------------------------------
    // NOW SAVE ORDER IN DB
    // -----------------------------------
    const newOrder = new Order({
      _id: plainOrder._id,
      userId: user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount,
      totalAmount,
      weight: calculatedWeight,
      paymentMethod,
      paymentStatus,
      razorpay: paymentDetails || {},
      deliveryStatus: "Packed",

      shiprocketStatus: "Order Created",
      shiprocketOrderId: shipOrder.order_id,
      shiprocketShipmentId: shipOrder.shipment_id,
      shiprocketAWB: awbRes?.awb_code || null
    });

    await newOrder.save({ session });
    */
// -----------------------------------
// SAVE PAYMENT INFO (CASH / COD / OFFLINE)
// -----------------------------------
/** 
if (paymentMethod === "online") {
  // Example: seller fixed payout
  const payoutAmount = Math.round(totalAmount * 0.7); // 70%

  await payoutToFundAccount({
    fundAccountId: "fa_RweeY0Tr8ugGMp", // 🔒 stored fund account id
    amount: payoutAmount,
    referenceId: newOrder._id.toString(),
    narration: "Seller payout for order",
  });

  newOrder.payoutstatus = "SUCCESS";
  
}
  */



    // Reduce stock
  for (const item of cartItems) {
    const productId = item.product?._id?.toString() || item.product?.toString();
   
  const freshProduct = await Product.findById(productId);

  if (!freshProduct) {
    throw new Error("Product not found");
  }

  if (item.quantity > freshProduct.stock) {
    throw new Error(`${freshProduct.name} is out of stock`);
  }

  const updated = await Product.updateOne(
    {
      _id: item.product._id,
      stock: { $gte: item.quantity }
    },
    { $inc: { stock: -item.quantity } },
    { session }
  );

  if (updated.modifiedCount === 0) {
    throw new Error(`Stock mismatch for ${freshProduct.name}`);
  }
}

    // Clear cart
    if(userId){
    const cart = await Cart.findOne({ userId: user._id });
  if (cart) {
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });
  }
    
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Order placed & synced with Shiprocket",
      order: newOrder,
      shiprocket: shipOrder
    });
  }catch(err){
    console.log("order", err.message)
    throw err;
  }

  } catch (error) {
    console.log("❌ ORDER CREATE ERROR:", error.message);

    await session.abortTransaction();
    session.endSession();
    
    return res.status(500).json({
      success: false,
      message: error.message || "Order creation failed"
    });
  }
};
export const getOrders = async (req, res) => {
  try {
    
    const id = new mongoose.Types.ObjectId(req.user.id);
    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });
   

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
    
    
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

/**
 * ---------------------------------------------------------
 * GET ORDER DETAILS BY ID
 * ---------------------------------------------------------
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("userId", "name email phone");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Permission check
    if (
      order.userId._id.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this order",
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching order",
      error: error.message,
    });
  }
};

const mapShiprocketStatus = (code) => {
  const map = {
    17: "Pickup Scheduled",
    18: "Picked Up",
    19: "Out for Pickup",
    20: "In Transit",
    21: "Out for Delivery",
    22: "Delivered",
    23: "RTO Initiated",
    24: "RTO Delivered"
  };

  return map[code] || "Processing";
};


export const trackUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipmentId: shiprocketOrderId } = req.params;

    // 1️⃣ Find order
    const order = await Order.findOne({
      shiprocketOrderId,
      userId
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // 2️⃣ Get AWB (DB → Shiprocket)
    

   
      const shipments = await getAWBFromOrder(shiprocketOrderId);
    

      const awb = shipments.awb;

      order.awbCode = awb; // ✅ correct field
    

    // 3️⃣ Track shipment
    const trackingRes = await trackShipment(awb);
    
    const tracking = trackingRes?.tracking_data;
   
  
   
    if (!tracking)
      return res.status(500).json({ message: "Tracking data unavailable" });

    // 4️⃣ Update order status
    //const readableStatus = mapShiprocketStatus(tracking.shipment_status);

    order.shiprocketStatus = shipments.status; // ✅ string
    order.shiprocketStatusDate = new Date();
    order.trackingHistory = tracking.shipment_track_activities || [];

    await order.save();
    const data = {
       success: true,
      orderId: order._id,
      shiprocketOrderId,
      awb,
      courier: shipments.courier,
      current_status: shipments.status,
      shipment_status_code: tracking.shipment_status,
      tracking_data: tracking,
      track_url: tracking.track_url,
      etd: tracking.track_status == 0?trackingRes.etd:shipments.etd

    }
   

    // 5️⃣ Send clean response
    res.json(data)

  } catch (err) {
    console.error("❌ Track Order Error:", err.message);
    res.status(500).json({ message: err.message || "Tracking failed" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders for admin...");
   const orders = await Order.find().sort({ createdAt: -1 }).populate("items.productId")   // product details
  .populate("userId", "username email phone") // user details;
 
res.json({
  success: true,
  count: orders.length,
  orders
});

  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message)
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { customStatus } = req.body;
    
    if (!customStatus) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.customStatus = customStatus;
    order.customStatusUpdatedAt = new Date();
    
    
    await order.save();
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};