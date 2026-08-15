import { sendOrderStatusEmail } from "./utils/EmailTemplate.js";
import "./config/env.js";

async function test() {
  console.log("Testing sendOrderStatusEmail to help@guttalks.in...");
  try {
    await sendOrderStatusEmail("help@guttalks.in", {
      orderId: "TEST-ORDER-1001",
      status: "Order Placed",
      customStatus: "order_placed",
      items: [
        { product: { name: "RychBiome Probiotics" }, quantity: 1, price: 8999 },
      ],
      totalAmount: 8999,
      shippingAddress: {
        fullName: "Test Customer",
        addressLine1: "274-275, Bombay Nagar",
        city: "Jalandhar",
        state: "Punjab",
        pincode: "144001",
        phone: "9876543210",
        email: "help@guttalks.in",
      },
      updatedAt: new Date(),
    });
    console.log("✅ Order confirmation test email sent successfully!");
  } catch (err) {
    console.error("❌ Order confirmation email test failed:", err);
  }
}

test();
