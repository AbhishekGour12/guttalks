"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "../lib/api";

const REVIEWS_PER_SLIDE = 3;

export default function Testimonial() {
  const [reviews, setReviews] = useState([]);
  const [index, setIndex] = useState(0);

  // Fetch reviews from your ratings API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = getApiBaseUrl();
        const res = await axios.get(`${apiUrl}/api/ratings/reviews`);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };
    fetchReviews();
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    if (reviews.length <= REVIEWS_PER_SLIDE) return;
    const interval = setInterval(() => {
      setIndex((prev) =>
        prev + REVIEWS_PER_SLIDE >= reviews.length ? 0 : prev + REVIEWS_PER_SLIDE
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [reviews]);

  const visibleReviews = reviews.slice(index, index + REVIEWS_PER_SLIDE);

  return (
    <div className="overflow-visible">
      <section className="relative py-16 sm:py-20 md:py-28 bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7] overflow-visible">
        
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          {/* Badge */}
          <p className="inline-block px-4 sm:px-5 py-2 bg-[#E8F4F7] rounded-full text-[#18606D] font-medium text-xs sm:text-sm mb-4">
            Testimonials
          </p>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug text-[#1A4D3E] mb-8 sm:mb-10 max-w-[95%] sm:max-w-[650px] md:w-[700px]">
            What Our Customers Say
          </h2>

          {/* Reviews Carousel - Horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 scrollbar-hide">
            {visibleReviews.map((review) => (
              <motion.div
                key={review._id}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white border border-[#D9EEF2] rounded-2xl shadow-md p-6 overflow-hidden min-w-[85vw] sm:min-w-[45vw] md:min-w-0 snap-center flex-shrink-0 hover:shadow-xl transition-all"
              >
                {/* Decorative background accent */}
                <div className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 -translate-x-6 -translate-y-6 bg-[#CFE8EC]/40 rounded-full flex items-center justify-center text-[#18606D]">
                  <Quote size={28} className="opacity-80 translate-x-2 translate-y-2" />
                </div>

                {/* Content */}
                <h3 className="text-[#18606D] font-semibold italic text-lg sm:text-xl mt-6 mb-3 ml-4">
                  {review.userId?.username || "Anonymous"}
                </h3>
                <p className="text-[#475569] text-sm sm:text-[15px] leading-relaxed mb-5">
                  {review.review && review.review.length > 150
                    ? review.review.slice(0, 150) + "..."
                    : review.review || "No review text provided."}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8F4F7] flex items-center justify-center text-[#18606D] font-bold text-sm">
                      {review.userId?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A4D3E] text-sm">{review.userId?.username || "User"}</p>
                      <p className="text-xs text-[#64748B]">{review.createdAt?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400 text-sm">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Optional: empty state */}
          {reviews.length === 0 && (
            <div className="text-center py-12 text-[#64748B]">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}