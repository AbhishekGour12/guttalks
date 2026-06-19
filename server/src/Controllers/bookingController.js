import Booking from '../Models/Booking.js';
import Slot from '../Models/Slot.js';
import MCQ from '../Models/MCQ.js';
import User from '../Models/User.js';
import { createZoomMeetingLink } from '../services/zoomMeet.js';
import crypto from 'crypto';
import TempSlotHold from '../Models/TempSlotHold.js';
import { sendBookingConfirmationEmail, sendRescheduleEmail, sendBookingStatusEmail } from '../utils/EmailTemplate.js';

// Helper: format phone with +91
const formatPhone = (phone) => {
  let cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (cleaned.length === 13 && cleaned.startsWith('+')) return cleaned;
  return `+91${cleaned.slice(-10)}`;
};

// Initiate booking after payment (with user details)
export const initiateBooking = async (req, res) => {
  try {
    const { date, startTime, endTime, price, paymentDetails, userDetails } = req.body;
    
    const userId = req.user?._id;
    let finalUserId = userId;
    let guestInfo = null;
    let formattedPhone = null;
   
    // Parse date to UTC boundaries
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    
    // 1. Check if the specific slot exists and is not already booked
    const slot = await Slot.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: startTime,
      isBooked: false
    });
    
    if (!slot) {
      return res.status(404).json({ error: 'Slot not available for this date and time.' });
    }

    // 2. Handle user (logged-in or guest)
    if (!userId && userDetails && userDetails.phone) {
      formattedPhone = formatPhone(userDetails.phone);
      let user = await User.findOne({ phone: formattedPhone });
      
      if (!user) {
        user = new User({
          phone: formattedPhone,
          name: userDetails.name,
          email: userDetails.email,
          isProfileComplete: true,
          totalConsultations: 0,
          consultationHistory: []
        });
        await user.save();
      } else {
        if (userDetails.name && !user.name) user.name = userDetails.name;
        if (userDetails.email && !user.email) user.email = userDetails.email;
        await user.save();
      }
      finalUserId = user._id;
      guestInfo = {
        name: userDetails.name,
        email: userDetails.email,
        phone: formattedPhone
      };
    } else if (userId) {
      // Update logged-in user's info
      await User.findByIdAndUpdate(userId, {
        $inc: { totalConsultations: 1 },
        $set: { 
          name: userDetails?.name || req.user.name,
          email: userDetails?.email || req.user.email
        }
      });
    }

    // 3. Create booking
    const bookingId = `BOOK-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const booking = new Booking({
      bookingId,
      userId: finalUserId,
      guestName: guestInfo?.name,
      guestEmail: guestInfo?.email,
      guestPhone: guestInfo?.phone,
      date: startOfDay,
      startTime,
      endTime,
      price,
      paymentStatus: 'paid',
      paymentDetails,
      status: 'scheduled'
    });
    await booking.save();

    // 4. Generate meeting link
    const meetLink = await createZoomMeetingLink(booking);
    booking.meetLink = meetLink;
    await booking.save();
    
    // 5. Remove the temporary hold (if any)
    await TempSlotHold.deleteOne({ 
      date: { $gte: startOfDay, $lte: endOfDay }, 
      startTime 
    });

    // 6. Mark the slot as booked
    slot.isBooked = true;
    slot.bookingId = booking._id;
    await slot.save();

    // 7. Broadcast socket event
    if (global.io) {
      global.io.emit('slot-booked', {
        date: date,
        startTime: startTime,
        endTime: endTime,
        bookingId: bookingId
      });
    }

    // 8. Add to user's consultation history
    if (finalUserId) {
      await User.findByIdAndUpdate(finalUserId, {
        $push: {
          consultationHistory: {
            bookingId: booking.bookingId,
            date: startOfDay,
            startTime,
            expertName: 'Gut Health Expert',
            meetLink,
            status: 'scheduled'
          }
        }
      });
    }
    const userEmail = guestInfo?.email || userDetails?.email || req.user?.email;
if (userEmail) {
  await sendBookingConfirmationEmail(userEmail, {
    bookingId,
    date: startOfDay,
    startTime,
    endTime,
    meetLink,
    price,
    userName: guestInfo?.name || userDetails?.name || req.user?.name
  });
}


    res.json({ success: true, bookingId: booking.bookingId, meetLink });
  } catch (error) {
    console.log('❌ initiateBooking error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update booking with user details (after payment, before MCQs)
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { name, email, phone } = req.body;
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Update guest info
    booking.guestName = name;
    booking.guestEmail = email;
    booking.guestPhone = phone;
    await booking.save();

    // If user exists, update user info
    if (booking.userId) {
      await User.findByIdAndUpdate(booking.userId, {
        name, email,
        $inc: { totalConsultations: 1 }
      });
    } else {
      // Create/update user from guest info
      const formattedPhone = formatPhone(phone);
      let user = await User.findOne({ phone: formattedPhone });
      if (!user) {
        user = new User({
          phone: formattedPhone,
          name,
          email,
          isProfileComplete: true,
          totalConsultations: 1
        });
        await user.save();
        booking.userId = user._id;
        await booking.save();
      } else {
        user.name = name;
        user.email = email;
        user.totalConsultations += 1;
        await user.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit MCQ answers
export const submitMCQs = async (req, res) => {
  try {
    const { bookingId, answers } = req.body;
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.mcqAnswers = answers;
    await booking.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get MCQs
export const getMCQs = async (req, res) => {
  try {
    const mcqs = await MCQ.find({ isActive: true }).sort('order');
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings for logged-in user
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching bookings for user ID:", userId);
    const bookings = await Booking.find({ 
      userId, 
      status: { $ne: 'cancelled' } 
    }).sort({ date: -1, startTime: -1 });
    
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (status === 'cancelled') {
      const slot = await Slot.findOne({ date: booking.date, startTime: booking.startTime });
      if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;
        await slot.save();
      }
    }

    // Send status update notification email
    const userEmail = booking.guestEmail || booking.userId?.email;
    if (userEmail) {
      const userName = booking.guestName || booking.userId?.name || 'Valued Customer';
      await sendBookingStatusEmail(userEmail, {
        bookingId: booking.bookingId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        userName
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this function to bookingController.js
export const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newDate, newStartTime, newEndTime } = req.body;

    // Find the existing booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    

    // Parse new date
    const [year, month, day] = newDate.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month-1, day, 0,0,0));
    const endOfDay = new Date(Date.UTC(year, month-1, day, 23,59,59,999));

    // Check if new slot is available (not booked)
    const newSlot = await Slot.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: newStartTime,
      isBooked: false
    });
    if (!newSlot) {
      return res.status(409).json({ error: 'New slot not available' });
    }

    // Release old slot (mark as not booked)
    const oldSlot = await Slot.findOne({
      date: booking.date,
      startTime: booking.startTime
    });
    if (oldSlot) {
      oldSlot.isBooked = false;
      oldSlot.bookingId = null;
      await oldSlot.save();
    }

    // Book new slot
    newSlot.isBooked = true;
    newSlot.bookingId = booking._id;
    await newSlot.save();
// In rescheduleBooking controller

    // Update booking
    const oldDate = booking.date;
    const oldStartTime = booking.startTime;
    const oldEndTime = booking.endTime;

    booking.date = startOfDay;
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    booking.status = 'rescheduled';
    await booking.save();

    // Generate new meet link if needed (optional, but existing link remains valid; could regenerate)
    // We'll keep old meet link as it's still the same meeting; but for new time, maybe create a new one? 
    // For simplicity, we can keep the existing meet link or generate new. We'll keep existing.

    // Send email to user
    const userEmail = booking.guestEmail;
    if (userEmail) {
      await sendRescheduleEmail(userEmail, {
        bookingId: booking.bookingId,
        oldDate,
        oldStartTime,
        oldEndTime,
        newDate: startOfDay,
        newStartTime,
        newEndTime,
        meetLink: booking.meetLink,
        userName: booking.guestName || 'Valued Customer'
      });
    }

    // Emit socket event (optional)
    if (global.io) {
      global.io.emit('booking-rescheduled', { bookingId: booking._id, newDate: startOfDay, newStartTime });
    }

    res.json({ success: true, message: 'Booking rescheduled successfully', booking });
  } catch (error) {
    console.error('Reschedule error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get booking details for invoice (public/unauthenticated access via secure bookingId token)
export const getBookingDetailsForInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId }).populate('userId', 'name email phone');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Resolve details (prefer guest details if filled, fallback to user model)
    const userName = booking.guestName || booking.userId?.name || 'Valued Customer';
    const userEmail = booking.guestEmail || booking.userId?.email || '';
    const userPhone = booking.guestPhone || booking.userId?.phone || '';

    res.json({
      success: true,
      booking: {
        bookingId: booking.bookingId,
        userName,
        userEmail,
        userPhone,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        price: booking.price,
        paymentStatus: booking.paymentStatus,
        paymentDetails: booking.paymentDetails,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};