// controllers/orderController.js (partial – reuse your existing functions)
import Order from '../Models/Order.js';
import Cart from '../Models/Carts.js';
import { Product } from '../Models/Product.js';
import User from '../Models/User.js';
import mongoose from 'mongoose';
import console from 'console';
import { sendOrderStatusEmail } from '../utils/EmailTemplate.js';
import { formatPhone } from '../utils/phoneUtils.js';

export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      discount = 0,
      offerDiscount = 0,
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
      const formattedPhone = formatPhone(phone);
      user = await User.findOne({ phone: formattedPhone });
    }

    let cartItems = [];
    if (!shippingAddress) throw new Error("Shipping address required");
    if (!paymentMethod) throw new Error("Payment method required");

    // For guest orders (no userId)
    if (!userId) {
      if (!items || items.length === 0) throw new Error("No items provided");
      cartItems = items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        variant: item.variant || null
      }));
    } else {
      // For logged-in users, fetch from cart
      const cart = await Cart.findOne({ userId: user?._id }).populate("items.product");
      if (!cart || cart.items.length === 0) throw new Error("Your cart is empty");
      cartItems = cart.items;
    }

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        throw new Error(`${item.product.name} is out of stock`);
      }
    }

    if (!cartItems || cartItems.length === 0) throw new Error("Your cart is empty");

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.salePrice;
      return sum + (price * item.quantity);
    }, 0);

    const totalDiscount = Number(discount || 0) + Number(offerDiscount || 0);
    const totalAmount = (finalAmount !== undefined && finalAmount !== null)
      ? Number(finalAmount)
      : Math.max(0, subtotal - totalDiscount);
    const paymentStatus = paymentMethod === "online" ? "Paid" : "Pending";

    // Weight calculation
    let calculatedWeight = cartItems.reduce(
      (sum, item) => sum + (item.product.weight ?? 0.2) * item.quantity,
      0
    );
    if (totalWeight > 0) calculatedWeight = totalWeight;

    // Format order items
    const orderItems = cartItems.map((item) => {
      const price = item.variant?.price ?? item.product.salePrice;
      return {
        productId: item.product._id,
        name: item.product.name,
        image: item.product.imageUrls?.[0] || "",
        priceAtPurchase: price,
        quantity: item.quantity,
        weight: item.product.weight || 0.2,
        variant: item.variant || null
      };
    });

    // Prepare order object
    const newOrder = new Order({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: user?._id || null,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount: totalDiscount,
      totalAmount,
      weight: calculatedWeight,
      paymentMethod,
      paymentStatus,
      razorpay: paymentDetails || {},
      customStatus: "order_placed",
      shiprocketStatus: "Order Created"
    });

    await newOrder.save();

    // Reduce stock atomically
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
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (updated.modifiedCount === 0) {
        throw new Error(`Stock mismatch for ${freshProduct.name}`);
      }
    }

    // Clear cart
    if (userId && user) {
      const cart = await Cart.findOne({ userId: user._id });
      if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
      }
    }

    // Send customer order confirmation email
    try {
      let userEmail = shippingAddress?.email || user?.email;
      if (userEmail) {
        await sendOrderStatusEmail(userEmail, {
          orderId: newOrder._id.toString(),
          status: "Order Placed",
          customStatus: newOrder.customStatus,
          items: orderItems.map(item => ({
            product: { name: item.name },
            quantity: item.quantity,
            price: item.priceAtPurchase
          })),
          totalAmount: newOrder.totalAmount,
          shippingAddress: newOrder.shippingAddress,
          updatedAt: newOrder.createdAt
        });
      }
    } catch (emailErr) {
      console.error("Failed to send order confirmation email:", emailErr.message);
    }

    // Send admin notification email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "help@guttalks.in";
      await sendOrderStatusEmail(adminEmail, {
        orderId: newOrder._id.toString(),
        status: "Order Placed",
        customStatus: `[ADMIN NOTIFICATION] Order Placed by ${shippingAddress?.fullName} (${shippingAddress?.email})`,
        items: orderItems.map(item => ({
          product: { name: item.name },
          quantity: item.quantity,
          price: item.priceAtPurchase
        })),
        totalAmount: newOrder.totalAmount,
        shippingAddress: newOrder.shippingAddress,
        updatedAt: newOrder.createdAt
      });
    } catch (adminEmailErr) {
      console.error("Failed to send admin order notification email:", adminEmailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log("❌ ORDER CREATE ERROR:", error.message);
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

const mapCustomStatusToTracking = (customStatus) => {
  const map = {
    order_placed: "Order Placed",
    kit_dispatched: "Kit Dispatched",
    kit_delivered: "Kit Delivered",
    pickup_requested: "Pickup Requested",
    pickup_initiated: "Pickup Initiated",
    sample_picked_up: "Sample Picked Up",
    sample_received: "Sample Received",
    qc_passed: "QC Passed",
    completed: "Delivered",
    cancelled: "Canceled"
  };
  return map[customStatus] || "Processing";
};

export const trackUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipmentId } = req.params; // shipmentId in route acts as orderId/trackId

    // Find order by ID or custom ID field
    const order = await Order.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(shipmentId) ? new mongoose.Types.ObjectId(shipmentId) : null },
        { shiprocketOrderId: shipmentId }
      ],
      userId
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = mapCustomStatusToTracking(order.customStatus);

    // Build timeline activities based on current customStatus
    const activities = [];
    const date = order.customStatusUpdatedAt || order.updatedAt || order.createdAt;

    activities.push({
      activity: currentStatus,
      location: order.shippingAddress?.city || "Hub",
      date: date.toISOString()
    });

    // If beyond placed, add placed event
    if (order.customStatus !== 'order_placed') {
      activities.push({
        activity: "Order Placed",
        location: order.shippingAddress?.city || "System",
        date: order.createdAt.toISOString()
      });
    }

    const data = {
      success: true,
      orderId: order._id,
      awb: order.trackingId || order.awbCode || "N/A",
      courier: "Local Partner / Self-Shipped",
      current_status: currentStatus,
      tracking_data: {
        shipment_track_activities: activities
      },
      track_url: null,
      etd: order.customStatus === 'completed' ? date.toISOString() : null
    };

    res.json(data);
  } catch (err) {
    console.error("❌ Track Order Error:", err.message);
    res.status(500).json({ message: err.message || "Tracking failed" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders for admin...");
    const orders = await Order.find().sort({ createdAt: -1 }).populate("items.productId")   // product details
      .populate("userId", "username email phone"); // user details;

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
    const { customStatus, trackingId } = req.body;

    if (!customStatus) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.customStatus = customStatus;
    order.customStatusUpdatedAt = new Date();

    if (trackingId !== undefined && trackingId !== null) {
      order.trackingId = trackingId;
      order.awbCode = trackingId;
    }

    await order.save();
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "help@guttalks.in";
      // Get recipient email: Prioritize shippingAddress.email entered during order placement
      let userEmail = order.shippingAddress?.email;
      if (!userEmail && order.userId) {
        const user = await User.findById(order.userId).select('email');
        if (user) userEmail = user.email;
      }

      // Prepare items for email template
      const emailItems = order.items.map(item => ({
        product: { name: item.name },
        quantity: item.quantity,
        price: item.priceAtPurchase
      }));

      const emailPayload = {
        orderId: order._id.toString(),
        trackingId: order.trackingId || order.awbCode || "",
        status: customStatus,          // main status
        customStatus: customStatus,
        items: emailItems,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        updatedAt: order.customStatusUpdatedAt
      };

      if (userEmail) {
        await sendOrderStatusEmail(userEmail, emailPayload);
      }

      // Send admin status update email to admin as well
      await sendOrderStatusEmail(adminEmail, {
        ...emailPayload,
        customStatus: `[ADMIN NOTIFICATION] Order #${order._id.toString()} Status Updated to '${customStatus}'`
      });
    } catch (emailErr) {
      console.error("Failed to send order status update email:", emailErr.message);
      // Do not break the API response
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};