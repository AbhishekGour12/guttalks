import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../Models/Payment.js";

import "../config/env.js";
import User from "../Models/User.js";

const keyId = process.env.RAZORPAY_KEY || "rzp_test_S88Uv4GFz38GOf";
const keySecret = process.env.RAZORPAY_SECRET || "4v5L6va16GgvDwVL5j8PusG3";

console.log(`[Razorpay] Initializing with key: ${keyId.substring(0, 8)}... (Mode: ${keyId.startsWith("rzp_live") ? "LIVE" : "TEST"})`);

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

export const createOrder = async (req, res) => {
  try {
    const { amount, phone } = req.body;
    
    
    const user = await User.findOne({phone: phone})
   
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    });
    // -----------------------------------
// SAVE PAYMENT INFO (COMMON FOR ALL)
// -----------------------------------

 await Payment.create({
      user: user?._id || null,
      razorpayOrderId: order.id,
      amount: amount / 100,
      method: "Razorpay",
      status: "initiated",
    });
  


    const orderData = typeof order.toJSON === "function" ? order.toJSON() : order;
    res.json({
      ...orderData,
      key: keyId
    });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    console.log(razorpay_order_id)

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const sign = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (sign !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      return res.status(400).json({ message: "Invalid signature" });
    }
    
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.log("Verify error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
