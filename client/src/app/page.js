"use client";
import { useState } from "react";
import Image from "next/image";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import InsightsSection from "./components/InsightsSection";
import ProblemSolutionSection from "./components/ProblemSolutionSection";
import ServicesSection from "./components/ServicesSection";
import CallNowSection from "./components/CallNowSection";
import OfferModal from "./components/OfferModal";
import Product from "./components/Product";
import ProgramCardSlider from "./components/ProgramCardSlider";
import ScheduleCallModal from "./components/ScheduleCallModal";
import Testimonial from "./components/Testimonial";
import Banners from "./components/Banners";
import ElfsightGoogleReviews from "./components/ElfsightGoogleReviews";

export default function Home() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
    console.log('User accepted ₹99 offer from bottom popup');
  };

  const handleModalClose = () => {
    console.log('User dismissed bottom popup');
  };

  return (
    <>
      <HeroSection />
      <Banners/>
      <ProgramCardSlider />
      <div id="products">
        <Product />
      </div>
      <ElfsightGoogleReviews/>
      <Testimonial/>
      <InsightsSection />
      <ServicesSection />
      <ProblemSolutionSection/>
      
      {/* Bottom Right Corner Offer Modal */}
      <OfferModal 
        onBookNow={handleBookNow}
        onClose={handleModalClose}
        setShowScheduleModal={setShowScheduleModal}   // ✅ pass the state setter
      />
      
      <ScheduleCallModal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
        productName="GutTalks Root Rx Session" 
        productPrice={99}
      />
    </>
  );
}