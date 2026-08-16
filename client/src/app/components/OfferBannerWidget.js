"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaClock, FaBolt, FaCalendarCheck, FaTag } from "react-icons/fa";
import { useConsultationOffer } from "../context/ConsultationOfferContext";
import { useModal } from "../context/ModalContext";

export default function OfferBannerWidget() {
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

  if (!isOfferValid) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const formattedTimer = `${minutes}:${seconds}`;

  const handleBookNow = () => {
    openScheduleModal("GutTalks Root Rx Session", effectivePrice);
  };

  return (
    <>
      {/* 1. Top Offer Announcement Banner (shown until user clicks X) */}
      <AnimatePresence>
        {!bannerDismissed && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[9990] bg-gradient-to-r from-[#18606D] via-[#2A7F8F] to-[#18606D] text-white py-2.5 px-4 shadow-lg border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-medium truncate">
                <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 shrink-0">
                  <FaBolt className="w-3 h-3" /> LIMITED OFFER
                </span>
                <span className="truncate">{settings.bannerText || `Book Root Rx Session for ₹${offerPrice} (Was ₹${basePrice})`}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full font-bold text-xs">
                  <FaClock className="text-amber-300 w-3 h-3 animate-pulse" />
                  <span>Ends in {formattedTimer}</span>
                </div>

                <button
                  onClick={handleBookNow}
                  className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-3 py-1 rounded-full text-xs transition shadow-md hidden xs:flex items-center gap-1.5"
                >
                  <FaCalendarCheck />
                  <span>Book</span>
                  <span className="line-through text-amber-900/70 text-[11px] font-normal">₹{basePrice}</span>
                  <span>₹{offerPrice}</span>
                </button>

                <button
                  onClick={dismissBanner}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                  title="Dismiss banner"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Corner Timer Badge (Shown on Bottom Right when Top Banner is dismissed) */}
      <AnimatePresence>
        {bannerDismissed && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-24 right-6 z-[9990]"
          >
            <div className="bg-white border-2 border-[#18606D] rounded-full p-2.5 shadow-2xl flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 pl-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[#18606D] leading-none">Offer Ends In</span>
                  <span className="font-extrabold text-red-600 text-xs mt-0.5">{formattedTimer} min</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white font-bold px-3.5 py-1.5 rounded-full text-xs shadow-md hover:shadow-lg hover:scale-105 transition flex items-center gap-1.5"
              >
                <FaTag />
                <span className="line-through text-white/70 text-[11px] font-normal">₹{basePrice}</span>
                <span className="text-amber-300">₹{offerPrice}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
