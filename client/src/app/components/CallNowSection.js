"use client";
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const CallNowSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Phone Icon SVG
  const PhoneIcon = () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  // WhatsApp Icon SVG
  const WhatsAppIcon = () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1z" />
      <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1z" />
      <path d="M9.5 13.5c.5 1 1.5 1.5 2.5 1.5s2-.5 2.5-1.5" />
    </svg>
  );

  // Arrow Icon SVG
  const ArrowIcon = () => (
    <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Softer Gradient Background - More Airy */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F3E4] via-[#F5F9F0] to-[#F0F7E8]">
        {/* Subtle Organic Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2E7D32_0.5px,_transparent_0.5px)] [background-size:24px_24px] opacity-5" />
        
        {/* Soft Blobs - More Subtle */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#A5D6A7]/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[#C8E6C9]/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E1ECD2]/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          {/* Heading - Smaller */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2"
          >
            Talk to a Health Expert Today
          </motion.h2>

          {/* Subtext - More Concise */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mb-6 leading-relaxed"
          >
            Get instant guidance and personalized advice for your gut and skin health.
          </motion.p>

          {/* Compact Benefits Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            {[
              "Free Consultation",
              "Expert Doctors",
              "Quick Response"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1 border border-[#E1ECD2]">
                <svg className="w-3 h-3 text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-gray-700 text-xs sm:text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons - More Compact */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* Primary Call Button */}
            <motion.a
              href="tel:+919888803053"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-[#2E7D32] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <PhoneIcon />
              Call Now
              <ArrowIcon />
            </motion.a>

            {/* Secondary WhatsApp Button */}
            <motion.a
              href="https://wa.me/919888803053"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border border-[#E1ECD2] text-gray-700 font-medium px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm hover:bg-[#F5F9F0] hover:border-[#2E7D32]/30 w-full sm:w-auto"
            >
              <WhatsAppIcon />
              WhatsApp
            </motion.a>

            {/* Optional Callback Link - More Subtle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-gray-500 hover:text-[#2E7D32] font-medium text-sm transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Request Callback
            </motion.button>
          </motion.div>

          {/* Compact Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 pt-4 border-t border-[#E1ECD2] flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#2E7D32]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-gray-500 text-xs">24/7 Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#2E7D32]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              <span className="text-gray-500 text-xs">Response in 2 mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-[#E1ECD2] border border-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ))}
              </div>
              <span className="text-gray-500 text-xs">10k+ patients</span>
            </div>
          </motion.div>

          {/* Subtle Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.45, duration: 0.3 }}
            className="text-gray-400 text-[11px] mt-4"
          >
            Free consultation • No obligation • Privacy guaranteed
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CallNowSection;