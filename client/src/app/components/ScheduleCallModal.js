"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiClock, FiX, FiChevronLeft, FiChevronRight, 
  FiUser, FiMail, FiPhone, FiCheckCircle, FiCreditCard, FiLogIn,
  FiArrowLeft, FiAlertCircle
} from 'react-icons/fi';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isBefore, startOfDay } from 'date-fns';
import { availabilityAPI } from '../lib/availablity';
import { bookingAPI } from '../lib/booking';
import { paymentAPI } from '../lib/payment';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useConsultationOffer } from '../context/ConsultationOfferContext';

const ScheduleCallModal = ({ isOpen, onClose, productName, productPrice }) => {
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

  const { effectivePrice, basePrice, offerPrice, isOfferValid } = useConsultationOffer();
  const CONSULTATION_PRICE = (productPrice && productPrice !== 99 && productPrice !== 399 && productPrice !== 499) ? productPrice : effectivePrice;
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

      socketRef.current.on('connect', () => {});
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
      await availabilityAPI.releaseSlot({
        date: dateStr,
        startTime: timeStr,
        userId: userIdValue
      });
    } catch (err) {
      console.error('❌ Release API error:', err);
    }
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
        key: rpOrder.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_S88Uv4GFz38GOf",
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
  localStorage.setItem('pendingProduct', productName || 'GutTalks Root Rx Session');
  localStorage.setItem('pendingPrice', (CONSULTATION_PRICE || 99).toString());
  localStorage.setItem('redirectAfterLogin', window.location.pathname);
  onClose();
  router.push('/login');
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-auto border border-[#D9EEF2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <FiCreditCard className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4D3E] mb-2">{isOfferValid ? "Special Offer!" : "Root Rx Consultation"}</h3>
              <p className="text-[#64748B] mb-4 text-sm sm:text-base">
                Get this consultation for {isOfferValid ? (
                  <>
                    <span className="line-through text-gray-400 text-sm mr-1">₹{basePrice}</span>
                    <span className="text-[#18606D] font-bold text-xl">₹{offerPrice}</span>
                  </>
                ) : (
                  <span className="text-[#18606D] font-bold text-xl">₹{basePrice}</span>
                )}
              </p>
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto border border-[#D9EEF2]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with back button */}
          <div className="p-4 sm:p-5 border-b border-[#D9EEF2] bg-gradient-to-r from-[#F4FAFB] to-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                {step !== 'calendar' && (
                  <button 
                    onClick={goBack} 
                    className="p-1.5 sm:p-2 rounded-full hover:bg-white transition-colors border border-[#D9EEF2] text-[#18606D]"
                    title="Go Back"
                  >
                    <FiArrowLeft size={18} />
                  </button>
                )}
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#1A4D3E]">Schedule Your Consultation</h2>
                  {productName && (
                    <p className="text-xs text-[#64748B] hidden sm:block">{productName}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="p-1.5 sm:p-2 rounded-full hover:bg-white transition-colors text-[#64748B]"
                title="Close Modal"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-1 sm:gap-3 mt-3 sm:mt-4">
              {[
                { key: 'calendar', label: 'Slot' },
                { key: 'payment', label: 'Payment' },
                { key: 'form', label: 'Details' },
                { key: 'mcq', label: 'Questions' }
              ].map((stepObj, idx) => {
                const stepOrder = ['calendar', 'payment', 'form', 'mcq'];
                const currentIdx = stepOrder.indexOf(step);
                const isActive = step === stepObj.key;
                const isCompleted = currentIdx > idx;

                return (
                  <div key={stepObj.key} className="flex items-center">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                          isActive 
                            ? 'bg-[#18606D] text-white ring-2 ring-[#18606D]/30 shadow-xs' 
                            : isCompleted 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-[#E8F4F7] text-[#64748B]'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-[#18606D] font-bold' : 'text-[#64748B]'}`}>
                        {stepObj.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-1.5 transition-all ${isCompleted ? 'bg-emerald-600' : 'bg-[#E8F4F7]'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Slot Summary Banner (Visible when step !== 'calendar' on mobile) */}
          {step !== 'calendar' && selectedSlot && selectedDate && (
            <div className="md:hidden bg-[#F4FAFB] border-b border-[#D9EEF2] px-4 py-2.5 flex items-center justify-between text-xs flex-shrink-0">
              <div className="flex items-center gap-2 text-[#1A4D3E] font-medium truncate">
                <FiCalendar className="text-[#18606D] flex-shrink-0" />
                <span className="truncate">{format(selectedDate, 'dd MMM yyyy')}</span>
                <span className="text-gray-300">|</span>
                <FiClock className="text-[#18606D] flex-shrink-0" />
                <span className="truncate">{formatTimeTo12Hour(selectedSlot.start)}</span>
              </div>
              <button 
                onClick={goBack} 
                className="text-xs text-[#18606D] font-bold underline hover:text-[#1A4D3E] flex-shrink-0 ml-2"
              >
                Change
              </button>
            </div>
          )}

          {/* Scrollable Body Wrapper (Unified touch-scroll container on mobile) */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto touch-pan-y">
            
            {/* Left Panel: Calendar or Booking Summary */}
            <div className={`md:w-1/2 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-[#D9EEF2] bg-[#F4FAFB] md:overflow-y-auto ${step !== 'calendar' ? 'hidden md:block' : 'block'}`}>
              {step === 'calendar' ? (
                <div className="bg-white rounded-xl p-3.5 sm:p-4 shadow-xs border border-[#D9EEF2]">
                  <div className="flex justify-between items-center mb-4">
                    <button 
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
                      className="p-1.5 hover:bg-[#F4FAFB] rounded-full text-[#18606D] transition"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-[#1A4D3E] text-sm sm:text-base">{format(currentMonth, 'MMMM yyyy')}</span>
                    <button 
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
                      className="p-1.5 hover:bg-[#F4FAFB] rounded-full text-[#18606D] transition"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-[#64748B] py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).map(day => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const hasSlots = hasAvailableSlots(day);
                      const isTodayDate = isToday(day);
                      const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => !isPast && setSelectedDate(day)}
                          disabled={isPast}
                          className={`relative p-2 sm:p-2.5 rounded-full text-xs font-medium transition-all ${
                            isPast 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : isSelected 
                                ? 'bg-[#18606D] text-white shadow-md font-bold' 
                                : hasSlots 
                                  ? 'bg-[#E8F4F7] text-[#18606D] font-semibold hover:bg-[#D9EEF2]' 
                                  : isTodayDate 
                                    ? 'border border-[#18606D] text-[#18606D]' 
                                    : 'text-[#64748B] hover:bg-[#F4FAFB]'
                          }`}
                        >
                          {format(day, 'd')}
                          {hasSlots && !isSelected && (
                            <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-[#64748B] mt-4 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> 
                      Available Slots
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#18606D] rounded-full inline-block"></span> 
                      Selected Date
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-5 shadow-xs border border-[#D9EEF2] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#D9EEF2] pb-3">
                    <h3 className="font-bold text-[#1A4D3E] text-base flex items-center gap-2">
                      <FiCalendar className="text-[#18606D]" /> Booking Summary
                    </h3>
                    <button 
                      onClick={goBack}
                      className="text-xs text-[#18606D] hover:underline font-semibold"
                    >
                      Change Slot
                    </button>
                  </div>

                  {selectedDate && selectedSlot && (
                    <div className="bg-[#F4FAFB] p-4 rounded-xl border border-[#D9EEF2] space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#1A4D3E] font-medium">
                        <FiCalendar className="text-[#18606D]" />
                        <span>{format(selectedDate, 'EEEE, d MMMM yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#1A4D3E] font-medium">
                        <FiClock className="text-[#18606D]" />
                        <span>{formatTimeTo12Hour(selectedSlot.start)} – {formatTimeTo12Hour(selectedSlot.end)}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Session Includes:</h4>
                    <ul className="text-xs text-[#1A4D3E] space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span> 1-on-1 Video Call with Certified Expert
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span> Customized Gut Restoration Plan
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span> Instant Meeting Link via Email
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Step Content */}
            <div className="md:w-1/2 p-4 sm:p-5 flex flex-col justify-between md:overflow-y-auto min-h-0">
              
              {/* Step 1: Available Slots */}
              {step === 'calendar' && (
                <div className="flex flex-col h-full justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm sm:text-base text-[#1A4D3E]">
                        Available Slots {selectedDate && `for ${format(selectedDate, 'MMM d')}`}
                      </h3>
                      <span className="text-xs text-[#64748B]">
                        {slots.filter(s => !s.isBooked && (!s.isHeld || s.heldByCurrentUser)).length} available
                      </span>
                    </div>

                    {loadingSlots ? (
                      <div className="flex flex-col items-center justify-center py-12 text-[#64748B]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18606D] mb-2"></div>
                        <p className="text-xs">Loading slots...</p>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center text-[#64748B] py-10 bg-[#F4FAFB] rounded-xl border border-dashed border-[#D9EEF2]">
                        <FiClock size={24} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium">No slots available for this date.</p>
                        <p className="text-xs mt-1">Please select another date on the calendar.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 md:max-h-[380px] md:overflow-y-auto pr-1">
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
                              className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                                !disabled 
                                  ? 'hover:bg-[#F4FAFB] border-[#D9EEF2] hover:border-[#18606D] cursor-pointer shadow-xs hover:shadow-sm' 
                                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-lg ${!disabled ? 'bg-[#E8F4F7] text-[#18606D]' : 'bg-gray-100 text-gray-400'}`}>
                                  <FiClock size={16} />
                                </div>
                                <div>
                                  <span className="font-semibold text-xs sm:text-sm text-[#1A4D3E]">
                                    {formatTimeTo12Hour(slot.start)} – {formatTimeTo12Hour(slot.end)}
                                  </span>
                                  <p className="text-[10px] sm:text-[11px] text-[#64748B]">IST (Indian Standard Time)</p>
                                </div>
                              </div>
                              {badgeText ? (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass}`}>
                                  {badgeText}
                                </span>
                              ) : (
                                <span className="text-xs text-[#18606D] font-bold bg-[#E8F4F7] px-3 py-1 rounded-full group-hover:bg-[#18606D] group-hover:text-white transition">
                                  Select
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 'payment' && (
                <div className="flex flex-col justify-between h-full space-y-4 py-1">
                  <div>
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#18606D] to-[#2A7F8F] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                        <FiCreditCard className="text-2xl text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1A4D3E]">Consultation Payment</h3>
                      <p className="text-xs text-[#64748B]">Complete payment to confirm your booking slot</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#F4FAFB] to-white rounded-xl p-4 border border-[#D9EEF2] shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-[#D9EEF2] pb-2.5 text-xs sm:text-sm">
                        <span className="text-[#64748B]">Service</span>
                        <span className="font-semibold text-[#1A4D3E] truncate max-w-[180px]">
                          {productName || "Root Rx Consultation"}
                        </span>
                      </div>
                      
                      {selectedSlot && selectedDate && (
                        <div className="flex justify-between items-center border-b border-[#D9EEF2] pb-2.5 text-xs sm:text-sm">
                          <span className="text-[#64748B]">Slot</span>
                          <span className="font-medium text-[#1A4D3E]">
                            {format(selectedDate, 'dd MMM')} @ {formatTimeTo12Hour(selectedSlot.start)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <span className="text-xs text-[#64748B] block">Total Amount</span>
                          {isOfferValid && basePrice > offerPrice && (
                            <span className="text-xs text-gray-400 line-through mr-1.5">₹{basePrice}</span>
                          )}
                          <span className="text-2xl font-bold text-[#18606D]">₹{CONSULTATION_PRICE}</span>
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                          100% Secure
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <button 
                      onClick={handleRazorpayPayment} 
                      disabled={paymentLoading} 
                      className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3.5 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.99]"
                    >
                      {paymentLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> 
                          Processing Payment...
                        </span>
                      ) : (
                        <>
                          <FiCreditCard size={18} />
                          <span>Pay ₹{CONSULTATION_PRICE} & Book Slot</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] sm:text-[11px] text-center text-[#64748B] mt-2">
                      🔒 Payments secured by Razorpay. Official confirmation sent via email.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Form */}
              {step === 'form' && (
                <form onSubmit={handleFormSubmit} className="flex flex-col justify-between h-full space-y-4 py-1">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[#1A4D3E] mb-1">Your Contact Details</h3>
                    <p className="text-xs text-[#64748B] mb-3">
                      Please verify details for consultation reminders & meeting link.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Full Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
                          <input 
                            name="name" 
                            defaultValue={address.name} 
                            placeholder="Enter your full name" 
                            required 
                            className="w-full pl-10 pr-4 py-2.5 border border-[#D9EEF2] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#18606D] focus:outline-none" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Email Address</label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
                          <input 
                            name="email" 
                            type="email" 
                            defaultValue={address.email} 
                            placeholder="Enter your email address" 
                            required 
                            className="w-full pl-10 pr-4 py-2.5 border border-[#D9EEF2] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#18606D] focus:outline-none" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Phone Number</label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
                          <input 
                            name="phone" 
                            defaultValue={address.phone} 
                            placeholder="Enter 10-digit mobile number" 
                            required 
                            className="w-full pl-10 pr-4 py-2.5 border border-[#D9EEF2] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#18606D] focus:outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      Continue to Health Assessment
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Health Assessment MCQs */}
              {step === 'mcq' && (
                <div className="flex flex-col justify-between h-full space-y-3 py-1">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[#1A4D3E] mb-1">Health Assessment</h3>
                    <p className="text-xs text-[#64748B] mb-3">
                      Help our experts understand your condition before the call.
                    </p>

                    <div className="space-y-3 md:max-h-[350px] md:overflow-y-auto pr-1">
                      {mcqs.map((q, idx) => (
                        <div key={q._id} className="bg-[#F4FAFB] p-3 sm:p-3.5 rounded-xl border border-[#D9EEF2]">
                          <p className="font-semibold text-xs sm:text-sm text-[#1A4D3E] mb-2">
                            {idx + 1}. {q.question}
                            {q.isRequired !== false && (
                              <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map(opt => {
                              const currentAnswers = answers[q._id] || [];
                              const isChecked = Array.isArray(currentAnswers) && currentAnswers.includes(opt);
                              
                              return (
                                <label key={opt} className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-white transition group">
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
                                  <span className="text-xs text-[#64748B] group-hover:text-[#1A4D3E] transition">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {mcqError && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <FiAlertCircle size={14} /> {mcqError}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <button 
                      onClick={handleMcqSubmit} 
                      disabled={Object.keys(answers).length < getRequiredMcqCount()}
                      className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle size={18} /> Submit & Confirm Booking
                    </button>
                  </div>
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