# GutTalks Application Security Audit, Bug Analysis & Premium Roadmap

This report provides a comprehensive, end-to-end audit and enhancement roadmap for the **GutTalks** application (`guttalks.in`). It covers core architecture, critical security vulnerabilities, code-level logic errors, database schemas, UI/UX issues, search engine optimization (SEO), and a premium feature development plan. 

This document is structured to be client-ready and suitable for direct presentation to stakeholders to prioritize development phases.

---

## 1. Executive Summary

**GutTalks** is a specialized health-tech platform providing personalized gut health diagnostics (Blood/SMT & Stool/GMT test kits), doctor consultations, dietary recommendations, and wellness supplements.

### Technology Stack
*   **Frontend**: Next.js 16 (App Router), React 19, Redux Toolkit, Framer Motion, Tailwind CSS v4, Lucide React, React Icons.
*   **Backend**: Node.js, Express 5, MongoDB (Mongoose), Socket.io (real-time slot locks).
*   **Integrations**: Razorpay (Payments), Shiprocket (Logistics), Zoom API (Teleconsultations), CPaaS SocialTeaser (OTP SMS).

---

## 2. Critical Security Vulnerabilities (Flaws)

These P0/P1 security flaws present immediate risks of data exposure, unauthorized administrative actions, or financial exploits. They require immediate patch deployment.

### 2.1 Unprotected Administrative & Metric Endpoints
Several API routes intended solely for internal admin or system operations completely lack authentication or role-based check middleware.
*   `GET /api/booking/admin/all` in [bookingRoutes.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Routes/bookingRoutes.js) exposes every patient booking. Any internet user can retrieve full patient PII (Names, Emails, Phone Numbers).
*   `PUT /api/booking/admin/:id/status` allows public modification or cancellation of any medical consultation slot.
*   `PUT /api/booking/admin/reschedule/:bookingId` allows unauthenticated rescheduling of slot timings.
*   `GET /api/admin/orders` and `PUT /api/admin/:orderId/status` in [adminRoutes.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Routes/adminRoutes.js) allow anyone to download customer orders, customer shipping addresses, or arbitrarily toggle order shipping status.
*   `GET /api/admin/dashboard/stats` in [dashboardRoutes.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Routes/dashboardRoutes.js) is publicly open, exposing monthly recurring revenues, sales, and total customer signups.
*   `POST /api/availability/generate`, `GET /api/availability/admin/all`, and `DELETE /api/availability/admin/slot/:id` are completely unprotected. Anyone can generate millions of empty slots and bloat/exhaust the database storage.

> [!WARNING]
> **Remediation**: Apply the `adminAuth` middleware from [adminAuth.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Middleware/adminAuth.js) to all routes under `/api/admin`, `/api/booking/admin`, and `/api/availability/admin`.

### 2.2 Insecure Cryptography & URL Token Leaks (Profile IDOR)
In [UserController.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Controllers/UserController.js#L113), the `/profile/:token` endpoint decodes the session token parameter using `jwt.decode()` instead of verifying the cryptographic signature:
```javascript
const token = req.params.token;
let user = jwt.decode(token);
const result = await User.findById(user.id);
```
*   **Exploit**: Since `jwt.decode` merely parses the JSON body of a JWT without validating its cryptographic signature (secret key verification), an attacker can easily forge a token containing any target `user.id` to read other users' private profiles (Insecure Direct Object Reference).
*   **Leak Risk**: Transporting JWT session tokens as a URL parameter causes the token to get logged in browser history, proxy servers, and API gateway log files.

> [!IMPORTANT]
> **Remediation**: Transition the profile endpoint to use the header-based `authMiddleware` which uses `jwt.verify()`, and fetch user details directly from `req.user.id` rather than path parameters.

### 2.3 Unprotected Coupon Control Panel
The coupon system endpoints in [couponRoutes.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Routes/couponRoutes.js) do not restrict modification routes:
*   `POST /api/coupon/` (Create), `PATCH /api/coupon/:id` (Edit/Toggle), and `DELETE /api/coupon/:id` (Delete) are publicly accessible.
*   **Exploit**: Any malicious user can query the API to create custom "100% OFF" coupon codes or delete active promotional campaigns.

### 2.4 Hardcoded Secrets in Repository
API keys and authentication passwords are hardcoded in server source code:
*   **SocialTeaser CPaaS SMS Auth Key**: In [UserController.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Controllers/UserController.js#L87), `authkey=6aa45940ce7d45f2` is hardcoded.
*   **Razorpay Key**: In [paymentController.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Controllers/paymentController.js#L9), a default key `rzp_test_1DP5mmOlF5G5ag` is hardcoded as a fallback.
*   **Shiprocket Logistics Credentials**: In [shipRocketToken.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/utils/shipRocketToken.js#L14-L15), the email `agour4000@gmail.com` and password `hBd&yu9ceczX64Rh` are committed in plain text.

> [!CAUTION]
> Hardcoded secrets can be exposed via git history or server access. All credentials must be loaded from `.env` configuration.

### 2.5 SMS Wallet Abuse (No OTP Rate Limiting)
The phone OTP request route `/api/auth/requestotp/:phone` does not implement rate limiting or request throttling:
*   An attacker could automate calls to this API to generate thousands of SMS OTPs, quickly draining the client's SocialTeaser CPaaS wallet balance and resulting in financial loss.

---

## 3. Logical & Code Architecture Bugs

These bugs cause application feature failures, data truncation, or frontend/backend system crashes.

### 3.1 Commented-Out Shiprocket Shipping Integration
In [OrderController.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Controllers/OrderController.js#L115-L136), the actual implementation that communicates order details to Shiprocket and receives shipping AWB codes is fully commented out:
```javascript
// -----------------------------------
// CREATE ORDER IN SHIPROCKET FIRST
// -----------------------------------
try {
  /**   
  const shipOrder = await createShiprocketOrder(plainOrder, { ... });
  const awbRes = await assignAWB(shipOrder.shipment_id);
  **/
```
*   Despite being commented out, the API continues to return a success status: `"Order placed & synced with Shiprocket"`.
*   This causes a logical failure: orders are never synchronized with the courier, and tracking codes are never populated in the database.

### 3.2 Mongoose Schema Mismatch: Consultation History Stripped Out
In [User.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Models/User.js#L14-L20), the `consultationInfoSchema` is defined with only five fields:
```javascript
const consultationInfoSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  lastBookingDate: { type: Date },
  totalConsultations: { type: Number, default: 0 }
}, { _id: false });
```
However, in [bookingController.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Controllers/bookingController.js#L128-L138), the backend pushes booking metadata to the user's `consultationHistory` array:
```javascript
consultationHistory: {
  bookingId: booking.bookingId,
  date: startOfDay,
  startTime,
  expertName: 'Gut Health Expert',
  meetLink,
  status: 'scheduled'
}
```
*   Because Mongoose strict schema enforcement casts out any fields not present in the model, **every piece of actual consultation metadata (Zoom meeting link, timings, expert name, and status) is silently stripped out before saving**, leaving user profile history blank or corrupted.

### 3.3 Broken Token Expiry Redirection
In [api.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/client/src/app/lib/api.js#L42) on the frontend:
```javascript
// Redirect to login pagewindow.location.href = "/Login";
```
*   Due to a missing line break, the redirect command is placed directly behind a single-line comment `//`. The JavaScript compiler ignores the redirect command as part of the comment, failing to redirect users when their session tokens expire.

### 3.4 Missing Cron Job Dependency & Crash
The Shiprocket sync job in [shiprocketCron.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/cron/shiprocketCron.js):
1.  Is never imported or initialized in `server.js`.
2.  Imports `../Models/Products.js` on line 3, but the file is named `Product.js`, which would crash the compiler on start.
3.  References `process.env.MONGODB_URI` instead of `.env`'s `MONGO_URI`.
4.  Relies on `node-cron`, which is not listed in `package.json`'s dependencies, causing a run-time failure on import.

### 3.5 Schema Relationship & Index Inconsistencies
*   **Booking Slot Ref**: In [Booking.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Models/Booking.js#L12), the `slotId` references `'Availability'`, but the actual model is named `'Slot'`. Furthermore, the `slotId` field is never populated during slot bookings.
*   **Compound Index on Undefined**: In [TempSlotHold.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/server/src/Models/TempSlotHold.js#L12), the unique compound index references `guestId`, which is not defined in the schema (the actual field is `userId`). 
*   **In-Memory OTP Cache**: PII OTP tokens are cached inside a standard JavaScript `Map` memory object. A server restart deletes all active sessions, and this approach cannot scale across multiple load-balanced server instances.

### 3.6 MCQ Validation UI Crash
In [ScheduleCallModal.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/client/src/app/components/ScheduleCallModal.js#L650), the modal attempts to render `<FiAlertCircle size={14} />` upon validation errors:
*   However, `FiAlertCircle` is not imported from `'react-icons/fi'`, which crashes the React application state immediately when a user attempts to submit incomplete forms.

---

## 4. UI/UX & Design Flaws

### 4.1 Safe-Navigation Errors (Drawer & Navbar Crashing)
In both [CartSlideOut.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/client/src/app/components/CartSlideOut.js#L531) and [Navbar.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/client/src/app/components/Navbar.js#L136), image elements read array attributes directly:
```javascript
src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`}
```
*   If a product is added without an image, or if a database object contains empty arrays, this will throw an unhandled `TypeError` and crash the entire UI page shell.
*   **Fix**: Apply optional chaining: `product?.imageUrls?.[0] || "/placeholder.png"`.

### 4.2 Missing Invoice Generation & Download utilities
While the backend compiles PDF metadata to mail invoices, the user [Dashboard.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/client/src/app/dashboard/page.js) lacks an option for users to access or download invoices directly.

### 4.3 Missing Self-Service Rescheduling UI
Backend endpoints exist for rescheduling appointments, but the frontend dashboard lacks a user-facing rescheduling or cancellation interface. Users must contact customer support to change their appointment times.

---

## 5. SEO & Performance Flaws

### 5.1 Next.js Boilerplate Metadata
In [layout.js](file:///c:/Users/ashis/OneDrive/Desktop/Project/guttalks/client/src/app/layout.js#L22), the page metadata description remains as the default Next.js template: `"Generated by create next app"`. This negatively impacts search engine indexing.

### 5.2 Heavy Media Assets & Slow Initial Load
The website home page requires downloading heavy assets, causing delays on mobile connections:
*   `guts_p1.png` is **8.6MB** and `guts_p2.png` is **7.8MB**, resulting in a ~16MB payload for the homepage.
*   `favicon.ico` is **192KB** (typically favicon files should be under 10KB).
*   **Fix**: Convert all assets to compressed `.webp` or `.avif` formats (<150KB each) and replace standard HTML `<img>` elements with Next.js `<Image />` components to improve page load times.

---

## 6. Proposed Product Roadmap (New Features & Utilities)

To create a premium user experience and drive sales, the following features are recommended:

### 6.1 Interactive MCQ Gut Score & Free Wellness Report
To improve user conversion rates, replace the immediate booking wall with a 5-step interactive **Gut Health Quiz**:
*   An interactive visual questionnaire scoring digestive issues (bloating, acidity, sleep quality).
*   Provides an instant "Gut Health Index" out of 100 with a free 1-page health report.
*   Prompts the user to book a detailed review call with a physician to address their results.

### 6.2 Gemini AI Symptom Assistant
Integrate a wellness chatbot powered by Google's Gemini API:
*   Allows users to ask questions about digestive health, symptom management, and diagnostic kit procedures.
*   Configured with clinical context guardrails and disclaimer prompts.

### 6.3 Real-Time Lab Sample Tracker
Implement a status tracking interface on the user dashboard:
1.  **Kit Dispatched** (linked with Shiprocket tracking API).
2.  **Sample Collected** (phlebotomist pickup confirmation).
3.  **Received at NABL Lab** (quality inspection check).
4.  **Under Diagnostics** (lab analysis stage).
5.  **Report Published** (available for download).

### 6.4 Tailored Nutritionist Diet Planner & Bowel Habit Tracker
*   Allows consulting dietitians to upload personalized meal plans directly to the user dashboard.
*   Enables users to log daily meals, water intake, and bowel movements, showing health trend graphs over time.

### 6.5 Microbiome Biomarker Visualization Portal
Instead of static PDF reports, construct an interactive dashboard portal:
*   Interactive charts displaying specific probiotic bacteria counts vs. inflammatory markers.
*   Allows users to compare reports across different months to track recovery.

### 6.6 Probiotic & Gut Care Subscriptions
Introduce recurring subscription plans for probiotic supplements, gut-friendly kits, and continuous nutritionist calls, creating recurring revenue.

---

## 7. Actionable Remediation & Feature Matrix

The table below outlines the suggested priorities and estimated effort for the recommended fixes and features:

| Code / Feature Area | Flaw / Enhancements | Impact | Effort | Priority | Est. Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Routes** | Protect Admin/Stats endpoints with `adminAuth` | Critical | Low | **P0** | 2 Hours |
| **User Profile API** | Replace `jwt.decode` with signature validation | Critical | Low | **P0** | 1 Hour |
| **Booking Controller** | Fix User schema `consultationHistory` structure | High | Low | **P0** | 2 Hours |
| **Coupon / Slots API**| Add `adminAuth` to creation / slot generation | High | Low | **P0** | 1 Hour |
| **Frontend Modal** | Fix `FiAlertCircle` import syntax crash | High | Low | **P0** | 0.5 Hour |
| **Frontend Base** | Fix comment redirect syntax in `api.js` | High | Low | **P0** | 0.5 Hour |
| **Shiprocket Sync** | Restore Shiprocket Order logic & fix cron file | High | Med | **P1** | 6 Hours |
| **Media Assets** | Compress home page PNGs to WebP | High | Low | **P1** | 1 Hour |
| **Schema Indexing** | Fix index/ref values in TempSlotHold & Booking | Medium | Low | **P1** | 2 Hours |
| **SEO Base** | Replace Next.js default metadata headers | Medium | Low | **P2** | 1 Hour |
| **User Dashboard** | Add Invoice Download + Safe Array Chaining | Medium | Med | **P2** | 4 Hours |
| **Gut Score Quiz** | 5-step MCQ Gut Health Score & Free Report | High | High | **Roadmap**| 18 Hours |
| **Gemini AI Bot** | GutHealth AI assistant integration | Medium | Med | **Roadmap**| 12 Hours |
| **Sample Tracker** | Interactive lab progress visual stepper | High | Med | **Roadmap**| 10 Hours |
| **Biomarker Vault** | Interactive microbiome counts graph visuals | High | High | **Roadmap**| 16 Hours |
| **Subscriptions** | Probiotic/Health Kit subscription module | High | High | **Roadmap**| 24 Hours |
