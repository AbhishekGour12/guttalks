# GutTalks Application Corrections Report

This report documents the security vulnerability patches, code fixes, and structural alignment updates applied to the **GutTalks** application codebase. These changes resolve critical (P0/P1) flaws identified in the initial security and logical audit.

---

## 1. Security Vulnerability Patches

### 1.1 Unprotected Administrative & Metric Endpoints (P0)
**Issue:** Several administrative routes lacked authentication or role checks, allowing unauthorized public access to patient PII, slots generation, order lists, and revenue analytics.
**Correction:** Integrated the `adminAuth` middleware across all admin-only routes to ensure only authenticated administrators can access or modify administrative data.
*   **Affected Files:**
    *   [adminRoutes.js](file:///d:/workspace/gutstalks/server/src/Routes/adminRoutes.js) — Protected `/orders` and `/:orderId/status` endpoints.
    *   [availablityRoutes.js](file:///d:/workspace/gutstalks/server/src/Routes/availablityRoutes.js) — Protected `/generate`, `/admin/all`, `/admin/slot/:id`, and `/admin/range` endpoints.
    *   [bookingRoutes.js](file:///d:/workspace/gutstalks/server/src/Routes/bookingRoutes.js) — Protected `/admin/all`, `/admin/:id/status`, and `/admin/reschedule/:bookingId` endpoints.
    *   [dashboardRoutes.js](file:///d:/workspace/gutstalks/server/src/Routes/dashboardRoutes.js) — Protected `/stats` endpoint.

### 1.2 Insecure Cryptography & Profile IDOR Vulnerability (P0)
**Issue:** The `/profile/:token` endpoint decoded the JWT session token using `jwt.decode()` rather than validating it via cryptographic signature verification. An attacker could forge a token containing any user ID to access private profiles.
**Correction:** Replaced `jwt.decode()` with `jwt.verify()` utilizing `process.env.JWT_SECRET` to cryptographically validate the token before retrieving profile details.
*   **Affected Files:**
    *   [UserController.js](file:///d:/workspace/gutstalks/server/src/Controllers/UserController.js) — Replaced insecure decoding with cryptographic verification.

### 1.3 Unprotected Coupon Control Panel (P0)
**Issue:** Coupon creation, editing, status toggling, and deletion routes were publicly accessible, allowing anyone to modify store discounts or create custom "100% OFF" codes.
**Correction:** Applied `adminAuth` middleware to all administrative coupon control routes.
*   **Affected Files:**
    *   [couponRoutes.js](file:///d:/workspace/gutstalks/server/src/Routes/couponRoutes.js) — Secured coupon creation, patch modification, toggle, and deletion.

### 1.4 Hardcoded Secrets in Source Code (P0)
**Issue:** API keys, SMS gateways, and logistics provider passwords were plain text in the codebase, leading to credentials leakage risks.
**Correction:** Transitioned the SocialTeaser CPaaS SMS Auth Key to load from `process.env.CPAAS_API_KEY`. (Note: The hardcoded Shiprocket credentials have been fully removed alongside the Shiprocket module cleanup).
*   **Affected Files:**
    *   [UserController.js](file:///d:/workspace/gutstalks/server/src/Controllers/UserController.js) — Loaded SocialTeaser CPaaS SMS Auth Key from `process.env.CPAAS_API_KEY`.

### 1.5 SMS Wallet Abuse / No OTP Rate Limiting (P1)
**Issue:** The `/api/auth/requestotp/:phone` route lacked rate limiting, allowing automated scripts to trigger thousands of SMS verification requests, exhausting the CPaaS SMS wallet balance.
**Correction:** Implemented an in-memory `otpRateLimitStore` tracking the last request timestamp per phone number. Verification calls are now throttled to a maximum of 1 request per minute per phone number.
*   **Affected Files:**
    *   [UserController.js](file:///d:/workspace/gutstalks/server/src/Controllers/UserController.js) — Added a 60-second OTP rate limiting restriction.

---

## 2. Logical & Code Architecture Fixes

### 2.1 Mongoose Schema Consultation History Pruning (P0)
**Issue:** The consultation history fields (Zoom meeting link, time, date, expert name, and status) were stripped out by Mongoose during updates because they were missing in the user schema definition.
**Correction:** Expanded the `consultationInfoSchema` subschema definition inside the User model to explicitly define `bookingId`, `date`, `startTime`, `expertName`, `meetLink`, and `status`.
*   **Affected Files:**
    *   [User.js](file:///d:/workspace/gutstalks/server/src/Models/User.js) — Added missing consultation subschema fields.

### 2.2 Broken Token Expiry Redirection (P0)
**Issue:** The command `window.location.href = "/Login"` was accidentally written right after a single-line comment, causing JS engines to treat it as part of the comment and fail to redirect expired user sessions.
**Correction:** Inserted a newline between the comment and the redirect assignment so it compiles and executes.
*   **Affected Files:**
    *   [api.js](file:///d:/workspace/gutstalks/client/src/app/lib/api.js) — Corrected redirection formatting.

### 2.3 MCQ Validation React Component Crash (P0)
**Issue:** The frontend call booking page crashed when rendering MCQ validation error indicators because `FiAlertCircle` was used without being imported.
**Correction:** Added `FiAlertCircle` to the imported items from `'react-icons/fi'`.
*   **Affected Files:**
    *   [ScheduleCallModal.js](file:///d:/workspace/gutstalks/client/src/app/components/ScheduleCallModal.js) — Added missing icon import.

### 2.4 Booking Slot ID Population (P1)
**Issue:** The `slotId` reference schema point referred to a non-existent `'Availability'` model, and the `slotId` field wasn't populated when initiating a new booking.
**Correction:** Updated the `slotId` schema type reference to target the `'Slot'` model and set `slotId` to `slot._id` when initiating a booking.
*   **Affected Files:**
    *   [Booking.js](file:///d:/workspace/gutstalks/server/src/Models/Booking.js) — Changed slot reference model type.
    *   [bookingController.js](file:///d:/workspace/gutstalks/server/src/Controllers/bookingController.js) — Injected `slotId` into the initiating booking data structure.

### 2.5 TempSlotHold Index Inconsistency (P1)
**Issue:** The unique compound index on `TempSlotHold` referenced `guestId`, which did not exist on the schema (`userId` was the correct field name).
**Correction:** Replaced `guestId` with `userId` in the compound index.
*   **Affected Files:**
    *   [TempSlotHold.js](file:///d:/workspace/gutstalks/server/src/Models/TempSlotHold.js) — Corrected compound index field names.

### 2.6 Shiprocket Operations Removal (P1)
**Issue:** Shiprocket shipping and tracking was partially integrated, had commented-out code, caused cron compile crashes, and loaded hardcoded credentials. The decision was made to drop Shiprocket integration completely.
**Correction:** Completely removed Shiprocket integration, credentials, utility services, and cron files. Replaced the order tracking mechanism with a local tracker mapping the order's custom status values.
*   **Deleted Files:**
    *   [shipRocketToken.js](file:///d:/workspace/gutstalks/server/src/utils/shipRocketToken.js) — Deleted.
    *   [shipRocketServices.js](file:///d:/workspace/gutstalks/server/src/services/shipRocketServices.js) — Deleted.
    *   [shiprocketCron.js](file:///d:/workspace/gutstalks/server/src/cron/shiprocketCron.js) — Deleted.
*   **Affected Files:**
    *   [OrderController.js](file:///d:/workspace/gutstalks/server/src/Controllers/OrderController.js) — Removed Shiprocket order sync blocks, removed Shiprocket imports, updated success response message, and modified tracking endpoint to track locally via Order ID mapping.
    *   [dashboardController.js](file:///d:/workspace/gutstalks/server/src/Controllers/dashboardController.js) — Updated pending/status count logic to use custom statuses instead of Shiprocket's.
    *   [page.js](file:///d:/workspace/gutstalks/client/src/app/orders/page.js) — Migrated client-side tracking UI and timeline progress bar to rely on `customStatus` fields.

---

## 3. UI/UX Refinement & Razorpay Optimization

### 3.1 Razorpay Payment Sequence Preferences Removal
**Issue:** Razorpay payment sheets were configured with specific method sequences, which occasionally limited user choices or caused display issues.
**Correction:** Removed the redundant `config.display.blocks` overrides to let the Razorpay SDK serve default sequences and all available payment options smoothly.
*   **Affected Files:**
    *   [CartSlideOut.js](file:///d:/workspace/gutstalks/client/src/app/components/CartSlideOut.js) — Streamlined Razorpay options.
    *   [ScheduleCallModal.js](file:///d:/workspace/gutstalks/client/src/app/components/ScheduleCallModal.js) — Streamlined Razorpay options.
