"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaStar, 
  FaClock,
  FaCalendarCheck,
  FaGift,
  FaArrowRight,
  FaBolt,
  FaShieldAlt
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

const OfferModal = ({ onBookNow, onClose, setShowScheduleModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // starts at 120 seconds (2 mins)
  const [isMounted, setIsMounted] = useState(false);
  const [initialDelayPassed, setInitialDelayPassed] = useState(false);
  const intervalRef = useRef(null);

  // Storage keys
  const STORAGE_KEY = 'gutHealthOfferPopup';
  const CLOSED_UNTIL_KEY = 'gutHealthOfferPopupClosedUntil';
  const CONVERTED_KEY = `${STORAGE_KEY}_converted`;

  const shouldShowPopup = useCallback(() => {
    try {
      const hasConverted = localStorage.getItem(CONVERTED_KEY);
      if (hasConverted === 'true') return false;

      const closedUntil = localStorage.getItem(CLOSED_UNTIL_KEY);
      if (closedUntil) {
        const closedTime = parseInt(closedUntil, 10);
        if (Date.now() < closedTime) return false;
      }
      return true;
    } catch (error) {
      return true;
    }
  }, []);

  const saveClosedUntil = useCallback(() => {
    try {
      const blockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes cooldown
      localStorage.setItem(CLOSED_UNTIL_KEY, blockUntil.toString());
    } catch (error) {}
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    saveClosedUntil();
    if (onClose) onClose();
  }, [saveClosedUntil, onClose]);

  const handleBookNowClick = useCallback(() => {
    try {
      localStorage.setItem(CONVERTED_KEY, 'true');
      // Store pending booking info
      localStorage.setItem('pendingBooking', 'true');
      localStorage.setItem('pendingProduct', 'Consultation');
      localStorage.setItem('pendingPrice', '99');
    } catch (error) {}
    setIsOpen(false);
    if (setShowScheduleModal) {
      setShowScheduleModal(true);
    }
    if (onBookNow) onBookNow();
  }, [onBookNow, setShowScheduleModal]);

  // Set initial delay passed after 2 seconds on mount
  useEffect(() => {
    setIsMounted(true);
    const delayTimer = setTimeout(() => {
      setInitialDelayPassed(true);
    }, 2000);
    return () => clearTimeout(delayTimer);
  }, []);

  // Unified interval running every 1 second
  useEffect(() => {
    if (!isMounted) return;

    intervalRef.current = setInterval(() => {
      // Check conversion state
      let hasConverted = false;
      try {
        hasConverted = localStorage.getItem(CONVERTED_KEY) === 'true';
      } catch (e) {}
      
      if (hasConverted) {
        setIsOpen(false);
        clearInterval(intervalRef.current);
        return;
      }

      if (isOpen) {
        // Decrement timer
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleClose();
            return 120; // reset
          }
          return prev - 1;
        });
      } else {
        // If initial delay passed, check if we should show the modal
        if (initialDelayPassed && shouldShowPopup()) {
          setIsOpen(true);
          setTimeLeft(120);
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMounted, isOpen, initialDelayPassed, shouldShowPopup, handleClose]);

  const formatTime = (seconds) => `${seconds % 60}s`;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 350, duration: 0.3 }
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.03, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-[320px] sm:w-[380px] mx-auto"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Top Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#18606D] via-[#2A7F8F] to-[#CFE8EC]" />
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>

              {/* Main Content */}
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#18606D] to-[#2A7F8F] flex items-center justify-center shadow-md">
                      <FaGift className="text-white text-xl" />
                    </div>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full">
                      <FaBolt className="text-amber-500 w-3 h-3" />
                      <span className="text-[10px] font-semibold text-amber-700">Limited Time</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mt-0.5">
                      ₹99 Consultation Offer
                    </h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#18606D]">₹99</span>
                    <span className="text-sm text-gray-400 line-through">₹399</span>
                    <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">-75%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">For first‑time users only</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[10px] bg-[#CFE8EC]/50 text-[#18606D] px-2 py-1 rounded-full font-medium">✓ Personalized Plan</span>
                  <span className="text-[10px] bg-[#CFE8EC]/50 text-[#18606D] px-2 py-1 rounded-full font-medium">✓ Certified Experts</span>
                  <span className="text-[10px] bg-[#CFE8EC]/50 text-[#18606D] px-2 py-1 rounded-full font-medium">✓ 30-min Session</span>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600">4.8 (10k+ users)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdVerified className="w-3 h-3 text-[#18606D]" />
                    <span className="text-[10px] text-gray-500">Trusted by experts</span>
                  </div>
                </div>

                {/* Timer */}
                <div className="mb-3 text-center">
                  <span className="text-xs text-gray-500">⏱️ Offer expires in </span>
                  <span className="text-sm font-bold text-[#18606D]">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} min
                  </span>
                </div>

                {/* CTA Button */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={pulseAnimation.animate}
                    onClick={handleBookNowClick}
                    className="flex-1 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white font-semibold py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <FaCalendarCheck className="w-3.5 h-3.5" />
                    Book ₹99 Consultation
                    <FaArrowRight className="w-3 h-3" />
                  </motion.button>
                  <button
                    onClick={handleClose}
                    className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OfferModal;