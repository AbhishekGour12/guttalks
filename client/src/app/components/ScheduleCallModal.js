"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiClock, FiX, FiChevronLeft, FiChevronRight, 
  FiUser, FiMail, FiPhone, FiCheckCircle, FiCreditCard, FiLogIn,
  FiArrowLeft
} from 'react-icons/fi';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { availabilityAPI } from '../lib/availablity';
import { bookingAPI } from '../lib/booking';
import { paymentAPI } from '../lib/payment';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const ScheduleCallModal = ({ isOpen, onClose, productName, productPrice = 249 }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState('calendar');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [address, setAddress] = useState({ name: '', email: '', phone: '' });
  const [availableDates, setAvailableDates] = useState([]);
  const [mcqError, setMcqError] = useState('');
  const router = useRouter();
  const user = useSelector(state => state.auth.user);
  const socketRef = useRef(null);
  const sessionId = useRef(Math.random().toString(36).substring(7));

  const CONSULTATION_PRICE = 99;
  const isLoggedIn = !!user;

  // Pre-fill address from logged-in user
  useEffect(() => {
    if (user && step === 'form') {
      setAddress({
        name: user.name || user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, step]);
  

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && !socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        transports: ['websocket'],
        autoConnect: true
      });

      socketRef.current.on('connect', () => console.log('Socket connected'));
      socketRef.current.on('slot-held', (data) => {
        if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === data.date) {
          loadSlotsForDate(selectedDate);
        }
      });
      socketRef.current.on('slot-released', (data) => {
        if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === data.date) {
          loadSlotsForDate(selectedDate);
        }
        
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, selectedDate]);
useEffect(() => {
  const handleBeforeUnload = () => {
    if (selectedSlot && selectedDate) {
      const dateStr = formatDate(selectedDate);
      const timeStr = selectedSlot.start;
      const userIdValue = user?._id || sessionId.current;
      // Use sendBeacon for reliable delivery during page unload
      const payload = JSON.stringify({ date: dateStr, startTime: timeStr, userId: userIdValue });
      navigator.sendBeacon('/api/availability/release-slot', new Blob([payload], { type: 'application/json' }));
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [selectedSlot, selectedDate, user]);
  // Load Razorpay script once
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch MCQs on mount
  useEffect(() => {
    if (isOpen) bookingAPI.getMCQs().then(setMcqs).catch(console.error);
  }, [isOpen]);

  // Fetch slots when date changes
  useEffect(() => {
    if (selectedDate) loadSlotsForDate(selectedDate);
  }, [selectedDate]);

  // On modal open, set today as selected date and load its slots
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setSelectedDate(today);
      setSelectedSlot(null);
      setStep('calendar');
      setAnswers({});
      loadSlotsForDate(today);
      loadAvailableDates();
    }
  }, [isOpen]);

  const loadSlotsForDate = async (date) => {
  setLoadingSlots(true);
  try {
    const userIdValue = user?._id || sessionId.current;
    const res = await availabilityAPI.getSlots(format(date, 'yyyy-MM-dd'), userIdValue);
    setSlots(res.slots || []);
  } catch (err) {
    toast.error('Failed to load slots');
    setSlots([]);
  } finally {
    setLoadingSlots(false);
  }
};

  const loadAvailableDates = async () => {
    try {
      const res = await availabilityAPI.getAvailableDates();
      setAvailableDates(res.dates || []);
    } catch (err) {
      console.error('Failed to load available dates');
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeTo12Hour = (time24) => {
    const [h, m] = time24.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  // --- Slot Hold / Release Logic ---
 const releaseCurrentSlot = async () => {
  if (selectedSlot && selectedDate) {
    const dateStr = formatDate(selectedDate);
    const timeStr = selectedSlot.start;
    const userIdValue = user?._id || sessionId.current;
   
    try {
      const result = await availabilityAPI.releaseSlot({
        date: dateStr,
        startTime: timeStr,
        userId: userIdValue
      });
     
    } catch (err) {
      console.error('❌ Release API error:', err);
    }
  } else {
    console.log('⚠️ No slot to release');
  }
};

  const handleSlotSelect = async (slot) => {
    try {
      const holdRes = await availabilityAPI.holdSlot({
        date: formatDate(selectedDate),
        startTime: slot.start,
        userId: user?._id || sessionId.current
      });
      if (!holdRes.success) {
        toast.error(holdRes.error || 'Slot no longer available');
        return;
      }
      setSelectedSlot(slot);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to hold slot');
    }
  };

  // --- Navigation with release ---
  const goBack = async () => {
    if (step === 'payment') {
      await releaseCurrentSlot();
      setSelectedSlot(null);
      setStep('calendar');
    } else if (step === 'form') {
      setStep('payment');
    } else if (step === 'mcq') {
      setStep('form');
    }
  };

  const handleCloseModal = async () => {
    await releaseCurrentSlot();
    console.log('Modal closed, slot released if it was held.');
    onClose();
  };

  // --- Payment (same as before, but ensure release on failure) ---
  const handleRazorpayPayment = async () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment gateway is still loading. Please wait.");
      return;
    }

    const amountToPay = CONSULTATION_PRICE * 100;
    setPaymentLoading(true);

    try {
      const rpOrder = await paymentAPI.createOrder({
        amount: amountToPay,
        phone: address.phone || user?.phone || '9999999999'
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: rpOrder.amount,
        currency: "INR",
        order_id: rpOrder.id,
        name: "GutTalks",
        description: `Consultation: ${productName}`,
        remember_customer: true,
        modal: {
          ondismiss: async () => {
            setPaymentLoading(false);
            await releaseCurrentSlot();
            setStep('calendar');
          },
          handleback: true,
          backdropclose: false,
          zIndex: 999999,
          confirm_close: true,
          animation: true,
          escape: false
        },
        config: {
          display: {
            blocks: {
              utp: { name: "UPI Apps", instruments: [{ method: 'upi' }] },
              bank: { name: "Cards & NetBanking", instruments: [{ method: 'card' }, { method: 'netbanking' }] }
            },
            sequence: ['block.utp', 'block.bank'],
            preferences: { show_default_blocks: true }
          }
        },
        retry: { enabled: true, max_count: 3 },
        prefill: {
          name: address.name || user?.name || '',
          email: address.email || user?.email || '',
          contact: address.phone || user?.phone || '',
          method: 'upi'
        },
        theme: { color: "#18606D" },
        handler: async (response) => {
          try {
            const verify = await paymentAPI.verifyPayment(response);
            if (verify.success) {
              const booking = await bookingAPI.initiateBooking({
                date: formatDate(selectedDate),
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                price: CONSULTATION_PRICE,
                paymentDetails: response,
                userDetails: {
                  name: address.name || user?.name,
                  email: address.email || user?.email,
                  phone: address.phone || user?.phone
                }
              });
              setBookingId(booking.bookingId);
              setStep('form');
              toast.success('Payment successful! Please complete your details.');
            } else {
              toast.error("Payment Verification Failed");
              await releaseCurrentSlot();
              setStep('calendar');
            }
          } catch (err) {
            toast.error("Verification Error");
            await releaseCurrentSlot();
            setStep('calendar');
          } finally {
            setPaymentLoading(false);
          }
        }
      };
      const rz = new window.Razorpay(options);
      rz.on('payment.failed', async (response) => {
        toast.error("Payment Failed: " + response.error.description);
        setPaymentLoading(false);
        await releaseCurrentSlot();
        setStep('calendar');
      });
      rz.open();
    } catch (err) {
      toast.error(err.message);
      setPaymentLoading(false);
      await releaseCurrentSlot();
      setStep('calendar');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };
    setAddress(userData);
    await bookingAPI.updateBooking(bookingId, userData);
    setStep('mcq');
  };

 const handleMcqSubmit = async () => {
  // Validate required MCQs
  if (!validateMcqs()) {
    toast.error('Please answer the mandatory questions');
    return;
  }
  
  // Format answers for API
  const answerArray = Object.entries(answers).map(([qId, ans]) => ({
    questionId: qId,
    answer: Array.isArray(ans) ? ans.join(', ') : ans  // Join multiple answers with comma
  }));
  
  await bookingAPI.submitMCQs(bookingId, answerArray);
  toast.success('Thank you! Your consultation is confirmed. You will receive a meeting link via email.');
  handleCloseModal();
  router.push('/dashboard');
};

 // Inside ScheduleCallModal.jsx, in the `handleLoginRedirect` function
const handleLoginRedirect = () => {
  // Store pending booking info before redirect
  localStorage.setItem('pendingBooking', 'true');
  localStorage.setItem('pendingProduct', productName);
  localStorage.setItem('pendingPrice', productPrice.toString());
  localStorage.setItem('redirectAfterLogin', window.location.pathname);
  router.push('/login');
  onClose(); // close the modal while redirecting
};

  const hasAvailableSlots = (date) => availableDates.some(d => isSameDay(new Date(d), date));

  if (!isOpen) return null;
// Helper: Get number of required MCQs (you can set first 2 or 3 as required)
const getRequiredMcqCount = () => {
  // Make first 2 questions mandatory
  const requiredQuestions = mcqs.slice(0, 2);
  const answeredRequired = requiredQuestions.filter(q => {
    const answer = answers[q._id];
    return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim().length > 0);
  });
  return answeredRequired.length;
};
// Validate MCQs before submit
const validateMcqs = () => {
  const requiredCount = getRequiredMcqCount();
  const totalRequired = Math.min(2, mcqs.length); // First 2 questions are mandatory
  
  if (requiredCount < totalRequired) {
    setMcqError(`Please answer the first ${totalRequired} questions`);
    return false;
  }
  
  setMcqError('');
  return true;
};
  // Offer banner for non-logged-in users
  if (!isLoggedIn) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4D3E] mb-2">Special Offer!</h3>
              <p className="text-[#64748B] mb-3">
                Get this consultation for only <span className="text-[#18606D] font-bold text-xl">₹99</span>
              </p>
              <p className="text-sm text-[#64748B] mb-6">(Regular price: ₹{productPrice})</p>
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <FiLogIn /> Login / Sign up to Claim
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Main modal for logged-in users
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with back button */}
          <div className="p-5 border-b border-[#D9EEF2] bg-gradient-to-r from-[#F4FAFB] to-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {step !== 'calendar' && (
                  <button onClick={goBack} className="p-2 rounded-full hover:bg-white transition-colors">
                    <FiArrowLeft size={20} className="text-[#18606D]" />
                  </button>
                )}
                <h2 className="text-xl font-bold text-[#1A4D3E]">Schedule Your Consultation</h2>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-white transition-colors">
                <FiX size={20} className="text-[#64748B]" />
              </button>
            </div>
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {['calendar', 'payment', 'form', 'mcq'].map((s, idx) => {
                const isActive = step === s;
                const isCompleted = ['payment', 'form', 'mcq'].includes(step) && idx < ['calendar', 'payment', 'form', 'mcq'].indexOf(step);
                return (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isActive ? 'bg-[#18606D] text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-[#E8F4F7] text-[#64748B]'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < 3 && <div className={`w-12 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-[#E8F4F7]'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-full">
            {/* Calendar Section (same as before) */}
            <div className="md:w-1/2 p-5 border-r border-[#D9EEF2] bg-[#F4FAFB]">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-[#F4FAFB] rounded-full"><FiChevronLeft className="text-[#18606D]" /></button>
                  <span className="font-semibold text-[#1A4D3E]">{format(currentMonth, 'MMMM yyyy')}</span>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-[#F4FAFB] rounded-full"><FiChevronRight className="text-[#18606D]" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-3">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-[#64748B] font-medium py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).map(day => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const hasSlots = hasAvailableSlots(day);
                    const isTodayDate = isToday(day);
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        className={`relative p-2 rounded-full text-sm transition-all ${
                          isSelected ? 'bg-[#18606D] text-white shadow-md' : !isSelected && hasSlots ? 'bg-[#E8F4F7] text-[#18606D] font-medium' : !isSelected && !hasSlots && !isTodayDate ? 'text-[#64748B] hover:bg-[#F4FAFB]' : isTodayDate && !isSelected && !hasSlots ? 'border border-[#18606D] text-[#18606D]' : ''
                        }`}
                      >
                        {format(day, 'd')}
                        {hasSlots && !isSelected && <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-center text-[#64748B] mt-4">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span> Available slots
                </p>
              </div>
            </div>

            {/* Right Panel (step content) */}
            <div className="md:w-1/2 p-4">
              {step === 'calendar' && (
                <>
                  <h3 className="font-semibold mb-3">Available Slots</h3>
                  {loadingSlots ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18606D]"></div></div>
                  ) : slots.length === 0 ? (
                    <p className="text-center text-[#64748B] py-8">No slots available for this date.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                     {slots.map((slot, idx) => {
  let disabled = slot.isBooked || (slot.isHeld && !slot.heldByCurrentUser);
  let badgeText = '';
  let badgeClass = '';

  if (slot.isBooked) {
    badgeText = 'Booked';
    badgeClass = 'bg-red-100 text-red-600';
  } else if (slot.isHeld && !slot.heldByCurrentUser) {
    badgeText = 'Processing';
    badgeClass = 'bg-orange-100 text-orange-600';
  }

  return (
    <button
      key={idx}
      onClick={() => !disabled && handleSlotSelect(slot)}
      disabled={disabled}
      className={`w-full p-3 rounded-xl border text-left transition ${
        !disabled ? 'hover:bg-[#F4FAFB] border-[#D9EEF2] cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <FiClock className="inline mr-2" /> 
          {formatTimeTo12Hour(slot.start)} – {formatTimeTo12Hour(slot.end)}
        </div>
        {badgeText && <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>{badgeText}</span>}
      </div>
    </button>
  );
})}
                    </div>
                  )}
                </>
              )}

              {step === 'payment' && (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-[#F4FAFB] to-white rounded-xl p-6 mb-6">
                    <FiCreditCard className="text-5xl text-[#18606D] mx-auto mb-3" />
                    <p className="text-lg font-semibold text-[#1A4D3E]">Consultation Fee</p>
                    <p className="text-3xl font-bold text-[#18606D] mt-2">₹{CONSULTATION_PRICE}</p>
                    <p className="text-sm text-green-600 mt-1">Special offer price for you!</p>
                  </div>
                  <button onClick={handleRazorpayPayment} disabled={paymentLoading} className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                    {paymentLoading ? (<span className="flex items-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Processing...</span>) : `Pay ₹${CONSULTATION_PRICE}`}
                  </button>
                </div>
              )}

              {step === 'form' && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <h3 className="font-semibold text-lg text-[#1A4D3E] mb-4">Your Details</h3>
                  <div className="relative"><FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" /><input name="name" defaultValue={address.name} placeholder="Full Name" required className="w-full pl-10 pr-4 py-3 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D]" /></div>
                  <div className="relative"><FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" /><input name="email" type="email" defaultValue={address.email} placeholder="Email Address" required className="w-full pl-10 pr-4 py-3 border border-[#D9EEF2] rounded-xl" /></div>
                  <div className="relative"><FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" /><input name="phone" defaultValue={address.phone} placeholder="Phone Number" required className="w-full pl-10 pr-4 py-3 border border-[#D9EEF2] rounded-xl" /></div>
                  <button type="submit" className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3 rounded-xl font-semibold mt-4">Continue to Questions</button>
                </form>
              )}

              {step === 'mcq' && (
  <div>
    <h3 className="font-semibold text-lg text-[#1A4D3E] mb-2">Health Assessment</h3>
    <p className="text-sm text-[#64748B] mb-4">Please answer the following questions (you can select multiple options where applicable)</p>
    <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
      {mcqs.map((q, idx) => (
        <div key={q._id} className="bg-[#F4FAFB] p-4 rounded-xl border border-[#D9EEF2]">
          <p className="font-medium text-[#1A4D3E] mb-3">
            {idx+1}. {q.question}
            {q.isRequired !== false && (
              <span className="text-red-500 text-xs ml-1">*</span>
            )}
          </p>
          <div className="space-y-2">
            {q.options.map(opt => {
              const currentAnswers = answers[q._id] || [];
              const isChecked = Array.isArray(currentAnswers) && currentAnswers.includes(opt);
              
              return (
                <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition group">
                  <input 
                    type="checkbox"
                    value={opt}
                    checked={isChecked}
                    onChange={(e) => {
                      const current = answers[q._id] || [];
                      let newValue;
                      if (e.target.checked) {
                        newValue = [...current, opt];
                      } else {
                        newValue = current.filter(item => item !== opt);
                      }
                      setAnswers({...answers, [q._id]: newValue});
                    }}
                    className="w-4 h-4 text-[#18606D] rounded focus:ring-2 focus:ring-[#18606D] cursor-pointer"
                  />
                  <span className="text-[#64748B] group-hover:text-[#1A4D3E] transition">{opt}</span>
                </label>
              );
            })}
          </div>
          {answers[q._id]?.length > 0 && (
            <p className="text-xs text-[#18606D] mt-2">
              Selected: {answers[q._id].length} option(s)
            </p>
          )}
        </div>
      ))}
    </div>
    
    {/* Validation message */}
    {mcqError && (
      <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
        <FiAlertCircle size={14} /> {mcqError}
      </p>
    )}
    
    <button 
      onClick={handleMcqSubmit} 
      disabled={Object.keys(answers).length < getRequiredMcqCount()}
      className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3 rounded-xl font-semibold mt-5 disabled:opacity-50 transition"
    >
      <FiCheckCircle className="inline mr-2" /> Submit & Confirm
    </button>
  </div>
)}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScheduleCallModal;