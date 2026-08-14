"use client";
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

const ProblemSolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // SVG Icons for Problem Section - Enhanced
  const ProblemIcons = {
    bloating: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
      </svg>
    ),
    energy: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
      </svg>
    ),
    skin: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 4 8 12 8 12s8-8 8-12a8 8 0 0 0-8-8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    nutrients: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
      </svg>
    )
  };

  // SVG Icons for Solution Section - Enhanced with Teal theme
  const SolutionIcons = {
    report: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    ai: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <circle cx="15" cy="15" r="2" />
        <path d="M9 15L15 9" />
      </svg>
    ),
    doctor: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12H4M12 4v16" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    natural: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  };

  const problems = [
    { icon: ProblemIcons.bloating, title: "Bloating & Digestive Issues", description: "Persistent discomfort after meals" },
    { icon: ProblemIcons.energy, title: "Low Energy & Fatigue", description: "Constant tiredness affecting daily life" },
    { icon: ProblemIcons.skin, title: "Skin Problems Linked to Gut", description: "Acne, eczema, and inflammation" },
    { icon: ProblemIcons.nutrients, title: "Poor Nutrient Absorption", description: "Body struggling to get essential nutrients" }
  ];

  const solutions = [
    { icon: SolutionIcons.report, title: "Personalized Gut Health Reports", description: "Comprehensive analysis of your microbiome" },
    { icon: SolutionIcons.ai, title: "AI-Based Microbiome Analysis", description: "Advanced algorithms for accurate insights" },
    { icon: SolutionIcons.doctor, title: "Doctor-Recommended Plans", description: "Verified by leading gastroenterologists" },
    { icon: SolutionIcons.natural, title: "Natural & Safe Supplements", description: "Evidence-based nutritional support" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Background images array with gut-related visuals - vibrant and visible
  const backgroundImages = [
    {
      src: "https://plus.unsplash.com/premium_photo-1722658473477-0c8ab1b79acf?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Stomach anatomy",
      position: "top-0 left-0",
      size: "w-64 h-64 sm:w-80 sm:h-80",
      opacity: "opacity-60",
      zIndex: "z-10",
      animation: { y: [0, 15, 0], x: [0, 10, 0], duration: 20 }
    },
    {
      src: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=400&fit=crop",
      alt: "Intestines illustration",
      position: "bottom-0 right-0",
      size: "w-72 h-72 sm:w-96 sm:h-96",
      opacity: "opacity-50",
      zIndex: "z-10",
      animation: { y: [0, -12, 0], x: [0, -8, 0], duration: 22 }
    },
    {
      src: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=400&fit=crop",
      alt: "Fresh vegetables",
      position: "top-1/3 right-10",
      size: "w-48 h-48 sm:w-56 sm:h-56",
      opacity: "opacity-60",
      zIndex: "z-10",
      animation: { y: [0, -10, 0], x: [0, 5, 0], duration: 18 }
    },
    {
      src: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop",
      alt: "Fermented foods",
      position: "bottom-1/3 left-5",
      size: "w-52 h-52 sm:w-64 sm:h-64",
      opacity: "opacity-25",
      zIndex: "z-0",
      animation: { y: [0, 12, 0], x: [0, -6, 0], duration: 24 }
    },
    {
      src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
      alt: "Gut microbiome",
      position: "top-2/3 left-1/4",
      size: "w-56 h-56 sm:w-68 sm:h-68",
      opacity: "opacity-20",
      zIndex: "z-0",
      animation: { y: [0, -15, 0], x: [0, 8, 0], duration: 26 }
    },
    {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      alt: "Healthy eating bowl",
      position: "top-1/4 left-1/3",
      size: "w-44 h-44 sm:w-52 sm:h-52",
      opacity: "opacity-35",
      zIndex: "z-0",
      animation: { y: [0, 8, 0], x: [0, -5, 0], duration: 16 }
    },
    {
      src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
      alt: "Healthy salad",
      position: "bottom-20 right-1/3",
      size: "w-48 h-48 sm:w-60 sm:h-60",
      opacity: "opacity-50",
      zIndex: "z-10",
      animation: { y: [0, 10, 0], x: [0, -10, 0], duration: 20 }
    }
  ];

  // Floating animation helper
  const floatAnimation = (yOffset, xOffset, duration) => ({
    animate: {
      y: [0, yOffset, 0],
      x: [0, xOffset, 0],
    },
    transition: {
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut",
      repeatType: "reverse",
    },
  });

  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-[#F4FAFB] via-white to-[#F4FAFB]">
      {/* ========== VISIBLE BACKGROUND IMAGES - VIBRANT AND COLORFUL ========== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Decorative organic shapes for depth */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Large vibrant background images - clearly visible */}
          {backgroundImages.map((img, idx) => (
            <motion.div
              key={`bg-img-${idx}`}
              className={`absolute ${img.position} ${img.size} ${img.opacity} ${img.zIndex} rounded-2xl overflow-hidden`}
              animate={floatAnimation(img.animation.y[1], img.animation.x[1], img.animation.duration)}
              style={{ filter: "brightness(0.95) contrast(1.05)" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 150px, 250px"
                priority={idx < 3}
              />
            </motion.div>
          ))}

          {/* Additional colorful vegetable icons for extra vibrancy */}
          <div className="absolute top-5 left-[15%] w-16 h-16 opacity-40 z-0 animate-pulse">
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="35" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="1.5"/>
              <path d="M50 20 L50 80 M20 50 L80 50" stroke="#F59E0B" strokeWidth="1.5"/>
              <circle cx="50" cy="50" r="8" fill="#F59E0B" fillOpacity="0.3"/>
            </svg>
          </div>
          
          <div className="absolute bottom-10 right-[12%] w-20 h-20 opacity-35 z-0 animate-pulse delay-700">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M50 25 L35 45 L25 55 L35 65 L50 85 L65 65 L75 55 L65 45 Z" fill="#2A7F8F" fillOpacity="0.2" stroke="#2A7F8F" strokeWidth="1.2"/>
            </svg>
          </div>

          <div className="absolute top-1/2 left-[5%] w-12 h-12 opacity-30 z-0 animate-bounce">
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="30" fill="#18606D" fillOpacity="0.15" stroke="#18606D" strokeWidth="1"/>
              <path d="M50 30 L50 70 M30 50 L70 50" stroke="#18606D" strokeWidth="1"/>
            </svg>
          </div>
        </div>

        {/* Soft gradient overlays to ensure text readability - not covering images completely */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4FAFB]/40 via-transparent to-[#F4FAFB]/40 pointer-events-none" />
      </div>

      {/* Subtle floating particles - minimal to not compete with images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#18606D]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[#2A7F8F]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
          
          {/* LEFT SIDE - PROBLEM */}
          <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="relative z-20"
          >
            {/* Problem Container with Semi-transparent background to show background images */}
            <div className="relative bg-gradient-to-br from-[#FEF7F0]/95 via-white/95 to-[#FEF0E8]/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-[#FEE6D8] hover:shadow-2xl transition-shadow duration-500">
              {/* Warning Glow Effect */}
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#E67E22]/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-[#F39C12]/5 rounded-full blur-2xl" />
              
              {/* Section Badge - Warm Tone */}
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEF0E8] rounded-full border border-[#FEE6D8]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E67E22] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E67E22]"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#E67E22]">Common Challenges</span>
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h2 
                variants={itemVariants}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] mb-3"
              >
                Struggling with Gut Health?
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-sm sm:text-base text-[#64748B] mb-8 leading-relaxed"
              >
                These symptoms might be signs of an underlying gut imbalance affecting your overall wellbeing.
              </motion.p>

              {/* Problem Image */}
              <motion.div 
                variants={itemVariants}
                className="relative mb-8 rounded-2xl overflow-hidden shadow-md bg-[#FEF0E8]/50"
              >
                <div className="relative w-full aspect-[16/9] sm:aspect-[2/1]">
                  <Image
                    src="/guts_p1.png"
                    alt="Person experiencing gut discomfort"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FEF7F0]/40 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 inline-block shadow-sm border border-[#FEE6D8]">
                    <p className="text-xs text-[#E67E22] font-medium">⚠️ Common gut-related discomfort</p>
                  </div>
                </div>
              </motion.div>

              {/* Problem Points */}
              <motion.div variants={containerVariants} className="space-y-3">
                {problems.map((problem, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 6, backgroundColor: "#FEF7F0" }}
                    className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FEF0E8] to-[#FEE6D8] group-hover:from-[#FEE6D8] group-hover:to-[#FEDDC8] transition-all duration-300 flex items-center justify-center text-[#E67E22] shadow-sm">
                        {problem.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A] text-sm sm:text-base">{problem.title}</p>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{problem.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Problem Stats */}
              <motion.div 
                variants={itemVariants}
                className="mt-6 pt-4 border-t border-[#FEE6D8]"
              >
                <p className="text-xs text-[#64748B] text-center">
                  <span className="font-bold text-[#E67E22]">78%</span> of people experience at least one gut-related issue monthly
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - SOLUTION - Teal Theme */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="relative z-20"
          >
            {/* Solution Container with Semi-transparent background to show background images */}
            <div className="relative bg-gradient-to-br from-[#F4FAFB]/95 via-white/95 to-[#E8F4F7]/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-[#D9EEF2] hover:shadow-2xl transition-shadow duration-500">
              {/* Success Glow Effect - Teal */}
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#18606D]/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-[#2A7F8F]/5 rounded-full blur-2xl" />
              
              {/* Section Badge - Teal Theme */}
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F4F7] rounded-full border border-[#D9EEF2]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#18606D] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#18606D]"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#18606D]">Science-Backed Solution</span>
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h2 
                variants={itemVariants}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] mb-3"
              >
                Fix the Root Cause,
                <br />
                <span className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] bg-clip-text text-transparent">
                  Not Just Symptoms
                </span>
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-sm sm:text-base text-[#64748B] mb-8 leading-relaxed"
              >
                Our comprehensive approach addresses the underlying gut imbalances for lasting wellness.
              </motion.p>

              {/* Solution Image */}
              <motion.div 
                variants={itemVariants}
                className="relative mb-8 rounded-2xl overflow-hidden shadow-md bg-[#E8F4F7]/50"
              >
                <div className="relative w-full aspect-[16/9] sm:aspect-[2/1]">
                  <Image
                    src="/guts_p2.png"
                    alt="Person with healthy gut analysis dashboard"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F4FAFB]/40 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 inline-block shadow-sm border border-[#D9EEF2]">
                    <p className="text-xs text-[#18606D] font-medium">✨ Personalized health dashboard</p>
                  </div>
                </div>
              </motion.div>

              {/* Solution Points - Teal Theme */}
              <motion.div variants={containerVariants} className="space-y-3">
                {solutions.map((solution, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 6, backgroundColor: "#F4FAFB" }}
                    className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E8F4F7] to-[#D9EEF2] group-hover:from-[#D9EEF2] group-hover:to-[#CFE8EC] transition-all duration-300 flex items-center justify-center text-[#18606D] shadow-sm">
                        {solution.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A] text-sm sm:text-base">{solution.title}</p>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{solution.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Solution CTA - Teal Theme */}
              <motion.div 
                variants={itemVariants}
                className="mt-8 pt-4 flex items-center justify-between border-t border-[#D9EEF2]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] border-2 border-white flex items-center justify-center shadow-sm">
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">10,000+ happy clients</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(24, 96, 109, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
                >
                  Start Your Journey
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>

              {/* Trust Badge */}
              <motion.div 
                variants={itemVariants}
                className="mt-4 flex items-center justify-center gap-3"
              >
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#18606D]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[10px] text-[#64748B]">4.8 ★ (500+ reviews)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[#CFE8EC]" />
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#18606D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] text-[#64748B]">Doctor Verified</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Divider Gradient - Teal */}
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-[#CFE8EC] to-transparent z-20" />
      </div>

      {/* Decorative Bottom Element */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F4FAFB] to-transparent pointer-events-none z-20" />
    </section>
  );
};

export default ProblemSolutionSection;