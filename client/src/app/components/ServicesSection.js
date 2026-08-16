"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#products');
    }
  };

  // Fix hydration by setting mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom SVG Icons for each service
  const icons = {
    gutTest: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    skinTest: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 4 8 12 8 12s8-8 8-12a8 8 0 0 0-8-8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    personalized: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    supplements: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  };

  const services = [
    {
      icon: icons.gutTest,
      title: "Gut Health Test",
      description: "Comprehensive analysis of your gut microbiome with 50+ bacterial markers.",
      cta: "Start Test →",
      gradient: "from-[#CFE8EC] to-[#E8F4F7]"
    },
    {
      icon: icons.skinTest,
      title: "Skin Health Test",
      description: "Identify root causes of acne, eczema, and inflammation linked to gut health.",
      cta: "Analyze Skin →",
      gradient: "from-[#D9EEF2] to-[#F4FAFB]"
    },
    {
      icon: icons.personalized,
      title: "Personalized Plans",
      description: "Custom diet and lifestyle recommendations based on your unique health data.",
      cta: "Get Plan →",
      gradient: "from-[#CFE8EC] to-[#E8F4F7]"
    },
    {
      icon: icons.supplements,
      title: "Natural Supplements",
      description: "Doctor-formulated, science-backed supplements for optimal gut health.",
      cta: "Explore →",
      gradient: "from-[#D9EEF2] to-[#F4FAFB]"
    }
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-[#F4FAFB] via-white to-[#F4FAFB]">
      {/* Background Pattern - Subtle Dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#CFE8EC_1px,_transparent_1px)] [background-size:24px_24px] opacity-20" />
        
        {/* Soft Gradient Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#CFE8EC]/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#D9EEF2]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#18606D]/5 rounded-full blur-3xl" />
        
        {/* Decorative Lines */}
        <svg className="absolute top-20 left-0 w-64 h-64 opacity-10" viewBox="0 0 200 200" fill="none">
          <path d="M50,100 L150,100 M100,50 L100,150" stroke="#18606D" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="30" stroke="#18606D" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>
        <svg className="absolute bottom-20 right-0 w-64 h-64 opacity-10" viewBox="0 0 200 200" fill="none">
          <path d="M50,100 L150,100 M100,50 L100,150" stroke="#2A7F8F" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="30" stroke="#2A7F8F" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>

        {/* Floating Particles */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#18606D]/30 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-[#2A7F8F]/20 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-[#CFE8EC] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#CFE8EC] rounded-full border border-[#D9EEF2] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#18606D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#18606D]"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#18606D]">Comprehensive Care</span>
          </div>
          
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
            Our Core Services
          </h2>
          
          {/* Subtext */}
          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto">
            Everything you need to understand and improve your health, from root cause analysis to personalized solutions.
          </p>
        </motion.div>

        {/* Services Grid - Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={handleCardClick}
              className="group relative cursor-pointer"
            >
              <div className="relative h-full bg-white rounded-2xl p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#D9EEF2] hover:border-[#18606D]/30">
                
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  
                  {/* Icon */}
                  <div className="mb-5">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#18606D]/10 to-[#2A7F8F]/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#CFE8EC] to-[#E8F4F7] flex items-center justify-center text-[#18606D] group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-2 group-hover:text-[#18606D] transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center">
                    <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#18606D] group-hover:text-[#2A7F8F] transition-colors">
                      {service.cta}
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Corner Decoration */}
                <div className="absolute bottom-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-full border-b-2 border-r-2 border-[#18606D]/30 rounded-br-lg" />
                </div>

                {/* Top Right Glow Effect */}
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#18606D]/5 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Services Grid - Mobile Horizontal Scroll */}
        <div className="lg:hidden flex overflow-x-auto gap-5 pb-6 px-1 scrollbar-hide snap-x snap-mandatory">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={mounted && isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={handleCardClick}
              className="group relative min-w-[85%] sm:min-w-[60%] snap-start cursor-pointer"
            >
              <div className="relative h-full bg-white rounded-2xl p-5 shadow-lg border border-[#D9EEF2]">
                
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#CFE8EC] to-[#E8F4F7] flex items-center justify-center text-[#18606D]">
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                    {service.title}
                  </h3>

                  <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#18606D]">
                    {service.cta}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={mounted && isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 sm:mt-12 pt-6 border-t border-[#D9EEF2]"
        >
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#CFE8EC] flex items-center justify-center group-hover:bg-[#18606D]/10 transition-colors">
              <svg className="w-4 h-4 text-[#18606D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-[#64748B] group-hover:text-[#18606D] transition-colors">10,000+ Tests Completed</span>
          </div>
          
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#CFE8EC] flex items-center justify-center group-hover:bg-[#18606D]/10 transition-colors">
              <svg className="w-4 h-4 text-[#18606D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-[#64748B] group-hover:text-[#18606D] transition-colors">95% Satisfaction Rate</span>
          </div>
          
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#CFE8EC] flex items-center justify-center group-hover:bg-[#18606D]/10 transition-colors">
              <svg className="w-4 h-4 text-[#18606D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-[#64748B] group-hover:text-[#18606D] transition-colors">Results in 5-7 Days</span>
          </div>

          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#CFE8EC] flex items-center justify-center group-hover:bg-[#18606D]/10 transition-colors">
              <svg className="w-4 h-4 text-[#18606D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-[#64748B] group-hover:text-[#18606D] transition-colors">Doctor Approved</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Element */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F4FAFB] to-transparent pointer-events-none" />
    </section>
  );
};

export default ServicesSection;