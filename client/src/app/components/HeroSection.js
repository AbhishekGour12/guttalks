"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaCalendarCheck, 
  FaPhoneAlt, 
  FaStar, 
  FaStarHalfAlt,
  FaStethoscope,
  FaSmile,
  FaChartLine,
  FaClock,
  FaArrowLeft,
  FaArrowRight,
  FaUserMd,
  FaLeaf,
  FaHeartbeat,
  FaTag
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { GiStomach, GiHealthNormal, GiFruitBowl } from 'react-icons/gi';
import Image from 'next/image';
import ScheduleCallModal from './ScheduleCallModal';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [bubbles, setBubbles] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
// In HeroSection component (add after existing state declarations)
useEffect(() => {
  const pending = localStorage.getItem('pendingBooking');
  if (pending === 'true') {
    // Clear the flag so it doesn't reopen again on next refresh
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingProduct');
    localStorage.removeItem('pendingPrice');
    setShowScheduleModal(true);
  }
}, []);
  useEffect(() => {
    const generated = Array.from({ length: 8 }).map((_, i) => ({
      size: 20 + i * 6,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setBubbles(generated);
  }, []);

  const slides = [
    {
      id: 1,
      image: "/herocraousel_1.png",
      title: "Expert Consultation",
      description: "One-on-one with gut health specialists",
      badge: "Doctor-led Session"
    },
    {
      id: 2,
      image: "/herocraousel_2.png",
      title: "Personalized Reports",
      description: "AI-powered gut health analysis",
      badge: "Digital Report"
    },
    {
      id: 3,
      image: "/herocraousel_3.png",
      title: "Transform Your Life",
      description: "Join 10,000+ happy clients",
      badge: "Results Guaranteed"
    }
  ];

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const floatingCards = [
    { icon: FaSmile, text: "Happy Clients", value: "10K+", color: "#18606D", delay: 0 },
    { icon: FaStethoscope, text: "Doctor Approved", value: "100%", color: "#2A7F8F", delay: 0.2 },
    { icon: FaChartLine, text: "Results in", value: "30 Days", color: "#18606D", delay: 0.4 }
  ];

  const bulletPoints = [
    { icon: FaUserMd, text: "Doctor-backed Recommendations", description: "Verified medical practitioners" },
    { icon: GiFruitBowl, text: "Personalized Gut Analysis", description: "Tailored to your unique profile" },
    { icon: FaChartLine, text: "Proven Results", description: "Visible improvements in 30 days" }
  ];

  return (
    <>
      <section className="relative  bg-[#F4FAFB] min-h-screen w-full overflow-x-hidden ">
        {/* Organic background decorations (clipped by parent) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#2A7F8F] opacity-10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#18606D] opacity-10 blur-3xl"
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#18606D] opacity-5 blur-3xl" />
          
          {bubbles.map((b, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -30, 0], x: [0, i % 2 === 0 ? 20 : -20, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute rounded-full bg-gradient-to-r from-[#CFE8EC] to-[#2A7F8F] opacity-20"
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                left: `${b.left}%`,
                top: `${b.top}%`,
              }}
            />
          ))}
        </div>

        {/* Main container – edge-to-edge on mobile, padding only on inner content */}
        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-12 md:py-16 lg:py-20 min-h-screen flex items-center ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full">
            
            {/* LEFT SIDE - CONTENT */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
              className="relative z-10 order-1 lg:order-1 px-4 sm:px-0"
            >
              {/* Urgency Badge */}
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#CFE8EC] to-[#D9EEF2] text-[#18606D] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 shadow-sm border border-[#D9EEF2] flex-wrap"
              >
                <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#18606D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#18606D]"></span>
                </div>
                <FaTag className="text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm font-semibold">Limited Time Offer</span>
                <span className="text-xs sm:text-sm line-through text-[#64748B]">₹399</span>
                <span className="text-xs sm:text-sm font-bold text-[#18606D]">₹99 Only</span>
                <FaClock className="text-xs sm:text-sm ml-1" />
              </motion.div>

              {/* Headline */}
              <motion.h1 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold leading-[1.2] tracking-tight mb-4 sm:mb-6"
              >
                <span className="text-[#0F172A]">Rebalance Your Gut.</span>
                <br />
                <span className="bg-gradient-to-r from-[#18606D] via-[#2A7F8F] to-[#18606D] bg-clip-text text-transparent">
                 Reclaim Your Vitality.
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p 
                variants={fadeInUp}
                className="text-sm sm:text-base lg:text-lg xl:text-lg text-[#64748B] leading-relaxed mb-6 sm:mb-8 max-w-xl"
              >
                Struggling with persistent bloating, acidity, chronic IBS, or inflammation-linked skin issues? Take your first step toward lasting relief with an expert gut health consultation for just <span className="line-through text-[#94A3B8]">₹399 </span>{' '}<span className="font-bold text-[#18606D]">₹99</span>
                 <p> Get a personalised roadmap tailored specifically to your unique digestive profile.</p>
             </motion.p>
              {/* Bullet Points */}
              <motion.div 
                variants={staggerChildren}
                className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
              >
                {bulletPoints.map((point, index) => (
                  <motion.div 
                    key={index}
                    variants={fadeInUp}
                    className="flex items-start gap-2 sm:gap-3 group cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-[#18606D] to-[#2A7F8F]' :
                        index === 1 ? 'from-[#2A7F8F] to-[#18606D]' :
                        'from-[#18606D] to-[#2A7F8F]'
                      } flex items-center justify-center shadow-sm`}>
                        <point.icon className="text-white text-[10px] sm:text-xs" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base text-[#0F172A] font-semibold">{point.text}</p>
                      <p className="text-xs sm:text-sm text-[#64748B]">{point.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(24, 96, 109, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white font-semibold px-5 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg overflow-hidden"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <FaCalendarCheck className="text-base sm:text-lg lg:text-xl" />
                  <span>Book Consultation for</span>
                  <span className="line-through text-white/70 text-xs sm:text-sm">₹399</span>
                  <span className="font-bold text-lg sm:text-xl">₹99</span>
                  <span className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-20 blur-sm" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#CFE8EC" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white border-2 border-[#18606D] text-[#18606D] hover:bg-[#CFE8EC] font-semibold px-5 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <FaPhoneAlt className="text-base sm:text-lg lg:text-xl" />
                  Call Now
                </motion.button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-[#D9EEF2]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 sm:gap-1">
                    {[...Array(4)].map((_, i) => (
                      <FaStar key={i} className="text-[#F59E0B] text-sm sm:text-base lg:text-lg" />
                    ))}
                    <FaStarHalfAlt className="text-[#F59E0B] text-sm sm:text-base lg:text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A] text-sm sm:text-base">4.8</p>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MdVerified className="text-[#18606D] text-base sm:text-lg lg:text-xl" />
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm sm:text-base">500+</p>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Google Reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaLeaf className="text-[#2A7F8F] text-base sm:text-lg lg:text-xl" />
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm sm:text-base">100% Natural</p>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Evidence Based</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#CFE8EC]/30 px-2 py-1 rounded-full">
                  <FaTag className="text-[#18606D] text-xs" />
                  <span className="text-[10px] font-medium text-[#18606D]">
                    <span className="line-through text-[#64748B]">₹399</span> → ₹99
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE - CAROUSEL SECTION */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative order-2 lg:order-2 mt-8 lg:mt-0 px-4 sm:px-0"
            >
              {/* Main Carousel Container */}
              <div className="relative group">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/40 backdrop-blur-sm border border-white/20">
                  <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[450px] xl:h-[500px] w-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={slides[currentSlide].image}
                          alt={slides[currentSlide].title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
                          className="object-fit"
                          priority={currentSlide === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        
                        {/* Slide Content Overlay */}
                        <div className="absolute bottom-10 left-0 right-0 p-4 sm:p-5 md:p-6 text-white">
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-1.5 sm:space-y-2"
                          >
                            <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#18606D]/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-semibold">
                              {slides[currentSlide].badge}
                            </span>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                              {slides[currentSlide].title}
                            </h3>
                            <p className="text-xs sm:text-sm opacity-90 max-w-[90%] sm:max-w-full">
                              {slides[currentSlide].description}
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Price Offer Badge */}
                    <div className="absolute top-4 right-4 sm:right-6 z-30">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg">
                        <div className="flex items-center gap-1">
                          <FaTag className="text-white text-[8px] sm:text-[10px]" />
                          <span className="text-white text-[8px] sm:text-[10px] line-through opacity-80">₹399</span>
                          <span className="text-white text-xs sm:text-sm font-bold">₹99</span>
                          <span className="text-white text-[7px] sm:text-[8px]">OFFER</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-1.5 sm:p-2 md:p-2.5 transition-all duration-300 shadow-lg z-20 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 hover:opacity-100"
                      aria-label="Previous slide"
                    >
                      <FaArrowLeft className="text-[#18606D] text-xs sm:text-sm md:text-base" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-1.5 sm:p-2 md:p-2.5 transition-all duration-300 shadow-lg z-20 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 hover:opacity-100"
                      aria-label="Next slide"
                    >
                      <FaArrowRight className="text-[#18606D] text-xs sm:text-sm md:text-base" />
                    </button>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setIsAutoPlaying(false);
                            setCurrentSlide(index);
                            setTimeout(() => setIsAutoPlaying(true), 5000);
                          }}
                          className="relative"
                        >
                          <div className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                            index === currentSlide 
                              ? 'w-4 sm:w-6 bg-gradient-to-r from-[#18606D] to-[#2A7F8F]' 
                              : 'w-1.5 sm:w-2 bg-white/50'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Glass Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#18606D]/5 to-[#2A7F8F]/5 rounded-2xl -z-10" />
              </div>

              {/* Desktop Floating Cards */}
              <div className="hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, x: 20, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-3 z-20 border border-[#D9EEF2]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#18606D] to-[#2A7F8F] flex items-center justify-center shadow-lg">
                      <FaSmile className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#0F172A]">10K+</p>
                      <p className="text-xs font-medium text-[#64748B]">Happy Clients</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-3 z-20 border border-[#D9EEF2]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2A7F8F] to-[#18606D] flex items-center justify-center shadow-lg">
                      <FaStethoscope className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#0F172A]">100%</p>
                      <p className="text-xs font-medium text-[#64748B]">Doctor Approved</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="absolute -bottom-2 -right-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-2.5 z-20 border border-[#D9EEF2]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#18606D] to-[#2A7F8F] flex items-center justify-center">
                      <FaHeartbeat className="text-white text-base" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Results in</p>
                      <p className="text-sm font-bold text-[#18606D]">30 Days</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Mobile Floating Cards */}
              <div className="lg:hidden mt-4 sm:mt-6">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 px-1 scrollbar-hide">
                  {floatingCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + card.delay }}
                      className="bg-white rounded-xl shadow-lg p-2.5 sm:p-3 min-w-[120px] sm:min-w-[140px] flex-shrink-0 border border-[#D9EEF2]"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${
                          index === 0 ? 'from-[#18606D] to-[#2A7F8F]' :
                          index === 1 ? 'from-[#2A7F8F] to-[#18606D]' :
                          'from-[#18606D] to-[#2A7F8F]'
                        } flex items-center justify-center`}>
                          <card.icon className="text-white text-sm sm:text-base" />
                        </div>
                        <div>
                          <p className="text-base sm:text-lg font-bold text-[#0F172A]">{card.value}</p>
                          <p className="text-[10px] sm:text-xs text-[#64748B] leading-tight">{card.text}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#D9EEF2] p-3 shadow-lg z-50">
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm"
              onClick={() => setShowScheduleModal(true)}
            >
              <FaCalendarCheck />
              <span>Book</span>
              <span className="line-through text-white/70 text-xs">₹399</span>
              <span className="font-bold">₹99</span>
              <span className="max-sm:hidden">Consultation</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="flex-1 border-2 border-[#18606D] text-[#18606D] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm bg-white"
              onClick={() => setShowScheduleModal(true)}
            >
              <FaPhoneAlt />
              Call Now
            </motion.button>
          </div>
        </div>

        {/* No extra spacer – the sticky CTA overlays the content */}
      </section>
      <ScheduleCallModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} productName="Special Consultation" productPrice={399} />
    </>
  );
};

export default HeroSection;