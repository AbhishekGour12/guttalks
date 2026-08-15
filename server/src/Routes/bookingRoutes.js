import express from 'express';
import { initiateBooking, submitMCQs, getMCQs, updateBooking, getMyBookings, getAllBookings, updateBookingStatus, rescheduleBooking, getBookingDetailsForInvoice } from '../Controllers/bookingController.js';
import { authMiddleware} from '../Middleware/authMiddleware.js';
import { adminAuth } from '../Middleware/adminAuth.js';

const router = express.Router();

import { getConsultationSettings } from '../Controllers/consultationSettingsController.js';

router.post('/initiate', authMiddleware, initiateBooking);
router.get('/consultation-settings', getConsultationSettings);
router.get('/my-bookings', authMiddleware, getMyBookings);
router.post('/submit-mcq', authMiddleware, submitMCQs);
router.get('/mcqs', getMCQs);
router.put('/update/:bookingId', authMiddleware, updateBooking);
router.get('/admin/all', adminAuth, getAllBookings);
router.put('/admin/:id/status', adminAuth, updateBookingStatus);
router.put('/admin/reschedule/:bookingId', adminAuth, rescheduleBooking);
router.get('/invoice-details/:bookingId', getBookingDetailsForInvoice);
export default router;