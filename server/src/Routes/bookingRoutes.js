import express from 'express';
import { initiateBooking, submitMCQs, getMCQs, updateBooking, getMyBookings, getAllBookings, updateBookingStatus, rescheduleBooking, getBookingDetailsForInvoice } from '../Controllers/bookingController.js';
import { authMiddleware} from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', authMiddleware, initiateBooking);
router.get('/my-bookings', authMiddleware, getMyBookings);
router.post('/submit-mcq', authMiddleware, submitMCQs);
router.get('/mcqs', getMCQs);
router.put('/update/:bookingId', authMiddleware, updateBooking);
router.get('/admin/all', getAllBookings);
router.put('/admin/:id/status', updateBookingStatus);
router.put('/admin/reschedule/:bookingId',  rescheduleBooking);
router.get('/invoice-details/:bookingId', getBookingDetailsForInvoice);
export default router;