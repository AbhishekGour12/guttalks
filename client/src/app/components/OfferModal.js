"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaStar, 
  FaCalendarCheck,
  FaGift,
  FaArrowRight,
  FaBolt
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { useConsultationOffer } from '../context/ConsultationOfferContext';
import { useModal } from '../context/ModalContext';

const OfferModal = ({ onBookNow, onClose, setShowScheduleModal }) => {
  const {
    settings,
    effectivePrice,
    basePrice,
    offerPrice,
    timeLeft,
    isOfferValid,
    bannerDismissed,
    dismissBanner,
  } = useConsultationOffer();

  const { openScheduleModal } = useModal();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Show pop-up modal 3 seconds after first load if offer valid & banner not dismissed
    if (isOfferValid && !bannerDismissed) {
      const timer = setTimeout(() => {
        setModalVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setModalVisible(false);
    }
  }, [isOfferValid, bannerDismissed]);

  const handleClose = () => {
    setModalVisible(false);
    dismissBanner();
    if (onClose) onClose();
  };

  const handleBookNowClick = () => {
    setModalVisible(false);
    dismissBanner();
    if (setShowScheduleModal) {
      setShowScheduleModal(true);
    } else {
      openScheduleModal("GutTalks Root Rx Session", effectivePrice);
    }
    if (onBookNow) onBookNow();
  };

  if (!isOfferValid || !modalVisible) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const discountPercent = basePrice > offerPrice ? Math.round(((basePrice - offerPrice) / basePrice) * 100) : 0;

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-[320px] sm:w-[380px] mx-auto"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#18606D] via-[#2A7F8F] to-[#CFE8EC]" />
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>

            {/* Main Content */}
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#18606D] to-[#2A7F8F] flex items-center justify-center shadow-md">
                    <FaGift className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full">
                    <FaBolt className="text-amber-500 w-3 h-3 animate-pulse" />
                    <span className="text-[10px] font-semibold text-amber-700">Limited Time Offer</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mt-0.5">
                    ₹{offerPrice} Consultation Offer
                  </h3>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#18606D]">₹{offerPrice}</span>
                  <span className="text-sm text-gray-400 line-through font-medium">₹{basePrice}</span>
                  {discountPercent > 0 && (
                    <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">-{discountPercent}%</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">First-time visitors only</p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] bg-[#CFE8EC]/50 text-[#18606D] px-2 py-1 rounded-full font-semibold">✓ Personalized Plan</span>
                <span className="text-[10px] bg-[#CFE8EC]/50 text-[#18606D] px-2 py-1 rounded-full font-semibold">✓ Certified Experts</span>
                <span className="text-[10px] bg-[#CFE8EC]/50 text-[#18606D] px-2 py-1 rounded-full font-semibold">✓ 30-min Session</span>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-between mb-3 bg-[#F4FAFB] p-2 rounded-xl border border-[#D9EEF2]">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-700">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <MdVerified className="w-3 h-3 text-[#18606D]" />
                  <span className="text-[10px] text-gray-600 font-medium">Trusted by 10k+</span>
                </div>
              </div>

              {/* Live Countdown Timer */}
              <div className="mb-4 text-center bg-amber-50/80 border border-amber-200/60 p-2 rounded-xl">
                <span className="text-xs text-amber-800 font-medium">⏱️ Offer expires in </span>
                <span className="text-sm font-extrabold text-amber-900">
                  {minutes}:{seconds} min
                </span>
              </div>

              {/* CTA Button */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={pulseAnimation.animate}
                  onClick={handleBookNowClick}
                  className="flex-1 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white font-bold py-2.5 px-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                >
                  <FaCalendarCheck className="w-3.5 h-3.5" />
                  Book ₹{offerPrice} Session
                  <FaArrowRight className="w-3 h-3" />
                </motion.button>
                <button
                  onClick={handleClose}
                  className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OfferModal;