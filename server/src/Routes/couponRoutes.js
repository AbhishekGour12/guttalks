import express from "express";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
  applyCoupon,
} from "../Controllers/couponController.js";

import { adminAuth } from "../Middleware/adminAuth.js";

const router = express.Router();
router.post("/apply", applyCoupon)
router.post("/", adminAuth, createCoupon);
router.get("/", getCoupons);
router.get("/:id", getCouponById);
router.patch("/:id", adminAuth, updateCoupon);
router.delete("/:id", adminAuth, deleteCoupon);
router.patch("/toggle/:id", adminAuth, toggleCouponStatus);

// apply coupon in checkout
router.post("/validate", validateCoupon);

export default router;
