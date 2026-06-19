import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import MongoDBConnect from "./config/MongoDBConnect.js";
import path from "path";
import UserRoutes from "./Routes/UserRoutes.js";

import IntrestedRoutes from "./Routes/IntrestedRoutes.js";
import ProductRoutes from "./Routes/ProductRoutes.js"
import orderRoutes from "./Routes/OrderRoutes.js";
import couponRoutes from "./Routes/couponRoutes.js";
import shippingRoutes from "./Routes/shippingRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import CartRoutes from "./Routes/CartRoutes.js";
import availablityRoutes from "./Routes/availablityRoutes.js";
import bookingRoutes from "./Routes/bookingRoutes.js";
import contactRoutes from "./Routes/contactRoutes.js";
import { createZoomMeetingLink } from "./services/zoomMeet.js";
import ratingRoutes from "./Routes/ratingRoutes.js"
import adminRoutes from "./Routes/adminRoutes.js";
import dashboardRoutes from "./Routes/dashboardRoutes.js";
import {Server} from "socket.io";
import http from "http";
import { createAdmin } from "./services/createAdmin.js";

const app = express();
dotenv.config();

const allowedOrigins = [
  "https://www.guttalks.in",
  "https://guttalks.in",
  "http://localhost:3000" // Local testing ke liye
];



app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

MongoDBConnect();


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://guttalks.in",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store io instance globally (or export)
global.io = io;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});


createAdmin()
app.use(
  "/uploads/products",
  express.static(path.join(process.cwd(), "uploads", "products"))
);
app.use(
  "/uploads/carousel",
  express.static(path.join(process.cwd(), "uploads", "carousel"))
);

app.use("/api/auth", UserRoutes);


app.use("/api/user-interests", IntrestedRoutes);
app.use("/api/product", ProductRoutes);
app.use("/api/order", orderRoutes);

app.use("/api/coupon", couponRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", CartRoutes)
app.use("/api/availability", availablityRoutes)
app.use("/api/booking", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes)
app.use("/api/ratings", ratingRoutes)
app.use("/api/admin/dashboard", dashboardRoutes)
app.get("/", (req, res) =>{
    res.send("Hello World");
})
server.listen(process.env.PORT || 5000, () =>{
    console.log(`Server is running on port ${process.env.PORT }`);
})