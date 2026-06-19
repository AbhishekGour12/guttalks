// app/product/[slug]/page.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  User,
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle,
  MessageCircle,
  Calendar,
  Phone,
  FileText,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
  Utensils,
  ClipboardList,
  Users,
  Shield,
  Award,
  Zap,
  MapPin,
  ThumbsUp,
  Droplets,
  Beaker,
  Microscope,
  Truck,
  FileCheck,
} from "lucide-react";
// For rating & like buttons
import { FaHeart, FaStar } from "react-icons/fa";

import { ProductApi } from "../../lib/ProductApi";
import { useCart } from "../../context/CartContext";
import ScheduleCallModal from "../../components/ScheduleCallModal";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import useCheckLogin from "../../useCheckLogin"; // adjust path if needed
import axios from "axios";
// -------------------- Helper Components --------------------

const SkeletonLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-2xl aspect-square"></div>
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const StarRating = ({ rating, reviewCount, size = 16 }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : star <= rating
              ? "fill-amber-400/50 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
    <span className="text-sm text-[#64748B]">({reviewCount} reviews)</span>
  </div>
);

const QuantitySelector = ({ quantity, setQuantity, stock }) => (
  <div className="flex items-center gap-3 border border-[#D9EEF2] rounded-xl px-4 py-2 bg-white shadow-sm">
    <button
      onClick={() => setQuantity(Math.max(1, quantity - 1))}
      className="p-1 hover:bg-[#F4FAFB] rounded-lg transition"
    >
      <Minus size={16} className="text-[#18606D]" />
    </button>
    <span className="w-8 text-center font-medium text-[#1A4D3E]">{quantity}</span>
    <button
      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
      className="p-1 hover:bg-[#F4FAFB] rounded-lg transition"
    >
      <Plus size={16} className="text-[#18606D]" />
    </button>
  </div>
);

const extractHighlights = (description) => {
  if (!description) return [];
  const parts = description.split("|").map((p) => p.trim());
  return parts.filter((p) => p.length > 0 && p.length < 100);
};

// Icon mapping for benefits
const getBenefitIcon = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes("diagnosis") || lower.includes("severity")) return <Search size={20} />;
  if (lower.includes("nutrition") || lower.includes("supplement")) return <Utensils size={20} />;
  if (lower.includes("plan") || lower.includes("personalised")) return <ClipboardList size={20} />;
  if (lower.includes("expert") || lower.includes("certified")) return <Users size={20} />;
  if (lower.includes("solution") || lower.includes("clear")) return <CheckCircle size={20} />;
  if (lower.includes("eliminate") || lower.includes("dysbiosis")) return <Shield size={20} />;
  return <Zap size={20} />;
};

const getWhatToExpectIcon = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes("consult")) return <Users size={20} />;
  if (lower.includes("solution")) return <CheckCircle size={20} />;
  if (lower.includes("eliminate")) return <Shield size={20} />;
  return <ThumbsUp size={20} />;
};

// -------------------- Main Component --------------------
export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  // NEW: state for selected variant
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedVariantPrice, setSelectedVariantPrice] = useState(null);
  const [selectedVariantOriginalPrice, setSelectedVariantOriginalPrice] = useState(null);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState('');
  const [selectedVariantType, setSelectedVariantType] = useState(''); // 'duration' or 'pack'
  const { addToCart } = useCart();
  const user = useSelector((state) => state.auth.user);
  const checkLogin = useCheckLogin();

  // When product loads, set default selections (first option)
  useEffect(() => {
    if (product && product.productType === 'program') {
      let defaultDuration = null;
      let defaultPack = null;

      if (product.durationOptions && product.durationOptions.length > 0) {
        defaultDuration = product.durationOptions[0];
        setSelectedDuration(defaultDuration);
      }
      if (product.packOptions && product.packOptions.length > 0) {
        defaultPack = product.packOptions[0];
        setSelectedPack(defaultPack);
      }

      // Compute initial variant values
      if (defaultDuration && defaultPack) {
        setSelectedVariantPrice(defaultDuration.salePrice + defaultPack.salePrice);
        setSelectedVariantOriginalPrice(defaultDuration.originalPrice + defaultPack.originalPrice);
        setSelectedVariantLabel(`${defaultDuration.duration} + ${defaultPack.name}`);
        setSelectedVariantType('both');
      } else if (defaultDuration) {
        setSelectedVariantPrice(defaultDuration.salePrice);
        setSelectedVariantOriginalPrice(defaultDuration.originalPrice);
        setSelectedVariantLabel(defaultDuration.duration);
        setSelectedVariantType('duration');
      } else if (defaultPack) {
        setSelectedVariantPrice(defaultPack.salePrice);
        setSelectedVariantOriginalPrice(defaultPack.originalPrice);
        setSelectedVariantLabel(defaultPack.name);
        setSelectedVariantType('pack');
      }
    }
  }, [product]);

  useEffect(() => {
    if (user && localStorage.getItem('pendingBooking') === 'true') {
      localStorage.removeItem('pendingBooking');
      const storedSlug = localStorage.getItem('pendingProductSlug');
      if (storedSlug === slug) {
        setShowScheduleModal(true);
      }
      localStorage.removeItem('pendingProductSlug');
    }
  }, [user, slug]);
  // ----- rating & review state -----
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({
    avg: 0,
    count: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Detect if product is a test (SMT/GMT)
  const isTestProduct = product?.name && /smt|gmt/i.test(product.name);
  const isConsultation = product?.productType === "consultation";
  const highlights = product ? extractHighlights(product.description) : [];
  const hasBenefits = product?.benefits && product.benefits.length > 0;

  // ------------------------------------------------------------------
  // fetch product + ratings + likes
  // ------------------------------------------------------------------
  const fetchProductData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const productRes = await ProductApi.getProductBySlug(slug);
      const prod = productRes.product;
      setProduct(prod);
      if (prod.imageUrls?.length) setMainImage(prod.imageUrls[0]);

      const productId = prod._id;
      const ratingsData = await ProductApi.getProductRatings(productId);
      let reviewsList = Array.isArray(ratingsData) ? ratingsData : ratingsData?.reviews || [];
      setReviews(reviewsList);
      console.log(ratingsData)

      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsList.forEach((r) => {
        if (breakdown[r.rating] !== undefined) breakdown[r.rating] += 1;
      });
      const count = reviewsList.length;
      const avg = count === 0 ? 0 : reviewsList.reduce((sum, r) => sum + r.rating, 0) / count;
      setRatingSummary({ avg: avg.toFixed(1), count, breakdown });
      if (user) {
        const liked = await ProductApi.checkUserInterest(productId);
        setIsLiked(!!liked?.isLiked);
      } else {
        setIsLiked(false);
      }
      const likesRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/user-interests/likeCount/${productId}`);
      console.log("Likes count response:", likesRes.data);
      setLikesCount(likesRes.data.count || 0);
      
    } catch (err) {
      console.error("Error fetching product data:", err.message);
     
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // ------------------------------------------------------------------
  // rating & like handlers
  // ------------------------------------------------------------------
  const handleToggleLike = async () => {
    if (!checkLogin()) return;
    if (!user) return;
    const productId = product._id;
    try {
      if (isLiked) {
        await ProductApi.removeUserInterest(productId);
        setIsLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
        toast.success("Removed from wishlist");
      } else {
        await ProductApi.addUserInterest(productId);
        setIsLiked(true);
        setLikesCount((c) => c + 1);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!checkLogin()) {
      toast.error("Please login to submit review");
      return;
    }
    if (!rating) return toast.error("Please select rating");
    try {
      const response = await ProductApi.submitRating({
        productId: product._id,
        rating: Number(rating),
        review: reviewText,
      });

      toast.success(response.message || "Review submitted successfully");
      
      // Fetch updated reviews
      const reviewsList = await ProductApi.getProductRatings(product._id);
      setReviews(reviewsList);
      
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsList.forEach((r) => {
        if (breakdown[r.rating] !== undefined) breakdown[r.rating] += 1;
      });
      const count = reviewsList.length;
      const avg = count === 0 ? 0 : reviewsList.reduce((sum, r) => sum + r.rating, 0) / count;
      setRatingSummary({ avg: avg.toFixed(1), count, breakdown });
      setShowRatingForm(false);
      setRating(0);
      setReviewText("");
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    }
  };

  // ------------------------------------------------------------------
  // cart / buy / share etc.
  // ------------------------------------------------------------------
  const buyNow = () => {
    window.Tawk_API.hideWidget();
    if (!product) return;
    if (!isConsultation) {
      const variant = selectedDuration || selectedPack;
      const variantInfo = variant ? {
        type: selectedVariantType,
        name: selectedVariantLabel,
        price: selectedVariantPrice,
        originalPrice: selectedVariantOriginalPrice
      } : null;
      localStorage.setItem('selectedVariant', JSON.stringify(variantInfo));
      addToCart(product._id, quantity, variantInfo);
    
    } else {
      setShowScheduleModal(true);
    }
  };
  const toggleWishlist = handleToggleLike;

  const shareProduct = async () => {
    const shareUrl = `${window.location.origin}/product/${slug}`;
    const shareData = {
      title: `${product?.name} | GutTalks`,
      text: `✨ ${product?.name} ✨\n⭐ ${product?.rating}★ \n💰 ₹${product?.salePrice}\n📦 Free Shipping`,
      url: shareUrl,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      }
    }
  };
  const whatsappShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  const HandleAddToCart = async () => {
     window.Tawk_API.hideWidget();
    if (!product || isConsultation) return;
    const variant = selectedDuration || selectedPack;
    const variantInfo = variant ? {
      type: selectedVariantType,
      name: selectedVariantLabel,
      price: selectedVariantPrice,
      originalPrice: selectedVariantOriginalPrice
    } : null;
   await addToCart(product._id, quantity, variantInfo);
    setToastMsg(`${product.name} (${selectedVariantLabel}) added to cart`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleScroll = () => setShowScrollTop(window.scrollY > 300);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
// Update price when selection changes
  useEffect(() => {
    if (selectedDuration && selectedPack) {
      setSelectedVariantPrice(selectedDuration.salePrice + selectedPack.salePrice);
      setSelectedVariantOriginalPrice(selectedDuration.originalPrice + selectedPack.originalPrice);
      setSelectedVariantLabel(`${selectedDuration.duration} + ${selectedPack.name}`);
      setSelectedVariantType('both');
    } else if (selectedDuration) {
      setSelectedVariantPrice(selectedDuration.salePrice);
      setSelectedVariantOriginalPrice(selectedDuration.originalPrice);
      setSelectedVariantLabel(selectedDuration.duration);
      setSelectedVariantType('duration');
    } else if (selectedPack) {
      setSelectedVariantPrice(selectedPack.salePrice);
      setSelectedVariantOriginalPrice(selectedPack.originalPrice);
      setSelectedVariantLabel(selectedPack.name);
      setSelectedVariantType('pack');
    } else {
      setSelectedVariantPrice(product?.salePrice || null);
      setSelectedVariantOriginalPrice(product?.originalPrice || null);
      setSelectedVariantLabel('');
      setSelectedVariantType('');
    }
  }, [selectedDuration, selectedPack, product]);
  if (loading) return <SkeletonLoader />;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  // Helper to render option cards
  const renderOptions = (options, type, selected, setSelected, labelKey, priceKey = 'salePrice', originalPriceKey = 'originalPrice') => {
    if (!options || options.length === 0) return null;
    return (
      <div className="mt-4">
        <h3 className="font-semibold text-[#1A4D3E] mb-2">
          {type === 'duration' ? 'Select Duration' : 'Select Pack'}
        </h3>
        <div className="flex flex-wrap gap-3">
          {options.map((opt, idx) => {
            const isSelected = selected === opt;
            const discountPercent = Math.round(((opt.originalPrice - opt.salePrice) / opt.originalPrice) * 100);
            const perUnitPrice = (opt.salePrice / (type === 'pack' ? (opt.name.includes('Pack of') ? parseInt(opt.name.split(' ')[2]) : 1) : 1)).toFixed(0);
            return (
              <button
                key={idx}
                onClick={() => setSelected(opt)}
                className={`relative p-3 rounded-xl border-2 transition-all text-left min-w-[140px] ${
                  isSelected
                    ? 'border-[#18606D] bg-[#F4FAFB] shadow-md'
                    : 'border-[#D9EEF2] bg-white hover:shadow'
                }`}
              >
                {opt.label === 'Most Popular' && (
                  <span className="absolute -top-2 right-2 bg-[#18606D] text-white text-[10px] px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="font-semibold text-[#1A4D3E]">{opt[labelKey]}</div>
                <div className="text-xs text-[#64748B] line-through">₹{opt[originalPriceKey]}</div>
                <div className="text-lg font-bold text-[#18606D]">₹{opt[priceKey]}</div>
                <div className="text-[10px] text-green-600">Save {discountPercent}%</div>
                <div className="text-[10px] text-[#64748B]">₹{perUnitPrice}/{type === 'duration' ? 'mo' : 'kit'}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Hero Section - Fully Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mb-12 md:mb-16">
          {/* Left: Image Gallery + Rating Breakdown */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg border border-[#D9EEF2] group aspect-square max-w-full">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${mainImage}`}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
                loading="eager"
              />
              <div className="absolute top-3 left-3 backdrop-blur-md bg-red-500/90 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                -{Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}%
              </div>
              {isTestProduct && (
                <div className="absolute top-3 right-3 backdrop-blur-md bg-[#18606D]/90 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Beaker size={10} /> Gut Health Test
                </div>
              )}
              {isConsultation && (
                <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 text-[#18606D] px-2 py-0.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Clock size={10} /> {product.consultationDuration}
                </div>
              )}
            </div>

            {product.imageUrls?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {product.imageUrls.map((img, idx) => (
                  <button
                    key={idx}
                    onMouseOver={() => setMainImage(img)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      mainImage === img
                        ? "border-[#18606D] shadow-md"
                        : "border-[#D9EEF2] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img}`}
                      alt={`Thumb ${idx + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Rating Breakdown - Responsive */}
            <div className="bg-white rounded-xl p-4 mt-4 border border-[#D9EEF2] shadow-sm">
              <h3 className="text-sm md:text-md font-bold text-[#1A4D3E] mb-3">Rating Overview</h3>
              {Object.entries(ratingSummary.breakdown)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([star, count]) => {
                  const percent = ratingSummary.count ? Math.round((count / ratingSummary.count) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-2">
                      <span className="w-6 text-sm text-[#1A4D3E] font-semibold">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-8 text-xs text-[#64748B]">{percent}%</span>
                    </div>
                  );
                })}
              <div className="text-xs text-[#64748B] mt-2 text-center">
                Based on {ratingSummary.count} reviews
              </div>
            </div>
          </div>

          {/* Right: Product Info - Responsive typography */}
          <div className="space-y-4">
            {isTestProduct && (
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-[#E8F4F7] text-[#18606D] px-2 py-1 rounded-full">
                  <Truck size={12} /> Home sample
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-[#E8F4F7] text-[#18606D] px-2 py-1 rounded-full">
                  <Microscope size={12} /> NABL Lab
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-[#E8F4F7] text-[#18606D] px-2 py-1 rounded-full">
                  <Users size={12} /> Expert consultation
                </span>
              </div>
            )}

            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                {isTestProduct && (
                  <span className="text-xs font-semibold text-[#18606D] bg-[#E8F4F7] px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {product.name.includes("SMT") ? "Basic Screening" : "Advanced Analysis"}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] mt-2 break-words">
                  {product.name}
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleWishlist}
                  className="p-2 rounded-full bg-white shadow-md border border-[#D9EEF2] hover:shadow-lg transition"
                >
                  <FaHeart className={`text-xl ${isLiked ? "text-red-500 fill-red-500" : "text-[#18606D]"}`} />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-2 rounded-full bg-white shadow-md border border-[#D9EEF2] hover:shadow-lg transition"
                >
                  <Share2 size={20} className="text-[#18606D]" />
                </button>
              </div>
            </div>

            <p className="text-sm text-[#64748B]">{product.shortDescription}</p>

            <div className="flex flex-wrap items-center gap-3">
              <StarRating rating={ratingSummary.avg} reviewCount={ratingSummary.count} />
              <span className="text-sm text-[#18606D]">❤️ {likesCount} likes</span>
            </div>

             <div className="flex flex-wrap items-baseline gap-3">
    <span className="text-2xl sm:text-3xl font-bold text-[#18606D]">
      ₹{selectedVariantPrice || product.salePrice}
    </span>
    <span className="text-sm text-[#94A3B8] line-through">
      ₹{selectedVariantOriginalPrice || product.originalPrice}
    </span>
    {selectedVariantLabel && (
      <span className="text-xs bg-[#E8F4F7] text-[#18606D] px-2 py-0.5 rounded-full">
        {selectedVariantLabel}
      </span>
    )}
    </div>
            <p className="text-xs text-[#64748B]">{product.taxNote}</p>

            {product.description && (
              <div className="text-sm text-[#475569] leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {highlights.map((h, idx) => (
                  <span key={idx} className="bg-[#E8F4F7] text-[#18606D] px-2 py-1 rounded-full text-xs font-medium">
                    {h}
                  </span>
                ))}
              </div>
            )}

            {isConsultation && (
              <div className="space-y-2 bg-[#F4FAFB] p-4 rounded-xl">
                <div className="flex items-center gap-2 text-[#1A4D3E]">
                  <Clock size={18} className="text-[#18606D]" />
                  <span className="text-sm">Duration: {product.consultationDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-[#1A4D3E]">
                  <User size={18} className="text-[#18606D]" />
                  <span className="text-sm">Expert: {product.expertName || "Senior Gut Health Expert"}</span>
                </div>
              </div>
            )}

            {!isConsultation && (
              <div>
                <p className="text-sm text-[#64748B]">
                  Stock:{" "}
                  <span className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
                  </span>
                </p>
                {product.stock > 0 && product.stock < 10 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Only {product.stock} left – order soon
                  </p>
                )}
              </div>
            )}
              {!isConsultation && (
    <>
      {/* Render duration options if any */}
      {product.durationOptions && product.durationOptions.length > 0 && 
        renderOptions(product.durationOptions, 'duration', selectedDuration, setSelectedDuration, 'duration', 'salePrice', 'originalPrice')
      }
      {/* Render pack options if any */}
      {product.packOptions && product.packOptions.length > 0 && 
        renderOptions(product.packOptions, 'pack', selectedPack, setSelectedPack, 'name', 'salePrice', 'originalPrice')
      }
    </>
  )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {isConsultation ? (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <Calendar size={18} /> Choose Your Slot
                </button>
              ) : (
                <>
                  <QuantitySelector quantity={quantity} setQuantity={setQuantity} stock={product.stock} />
                  <button
                    onClick={HandleAddToCart}
                    className="flex-1 py-3 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button
                    onClick={buyNow}
                    className="py-3 px-6 border border-[#18606D] text-[#18606D] rounded-xl font-semibold hover:bg-[#18606D] hover:text-white transition-all"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>
            {isConsultation && <p className="text-xs text-[#64748B] text-center">Limited slots available today</p>}
          </div>
        </div>

        {/* Benefits & Highlights */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-6 md:mb-8 text-center">
            {hasBenefits ? "Why Choose This Program?" : "Key Highlights"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {hasBenefits
              ? product.benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -12px rgba(0,0,0,0.1)" }}
                    className="bg-white rounded-xl p-4 shadow-md border border-[#D9EEF2] transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E8F4F7] flex items-center justify-center mb-3 text-[#18606D]">
                      {getBenefitIcon(benefit)}
                    </div>
                    <h3 className="font-bold text-[#1A4D3E] text-sm md:text-base">{benefit}</h3>
                  </motion.div>
                ))
              : highlights.map((h, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-md border border-[#D9EEF2] text-center"
                  >
                    <p className="text-[#18606D] font-medium text-sm">{h}</p>
                  </motion.div>
                ))}
          </div>
        </div>

        {/* What to Expect */}
        {product.whatToExpect?.length > 0 && (
          <div className="mb-12 md:mb-16">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-6 md:mb-8 text-center">What to Expect</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {product.whatToExpect.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, boxShadow: "0 20px 25px -12px rgba(24,96,109,0.2)" }}
                  className="bg-white rounded-2xl p-5 text-center shadow-md border border-[#D9EEF2]"
                >
                  <div className="relative w-14 h-14 mx-auto mb-3">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#18606D] to-[#2A7F8F] opacity-10" />
                    <div className="relative w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-[#18606D] border border-[#D9EEF2]">
                      {getWhatToExpectIcon(item.title)}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#18606D] text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <h3 className="font-bold text-[#1A4D3E] text-md mb-1">{item.title}</h3>
                  <p className="text-sm text-[#64748B]">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Expert Section (Consultation Only) */}
        {isConsultation && (
          <div className="mb-12 md:mb-16">
            <div className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt={product.expertName || "Expert"}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-400 rounded-full p-1 shadow-md">
                    <Award size={16} className="text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-xl md:text-2xl font-bold">{product.expertName || "Senior Gut Health Expert"}</h3>
                  <p className="text-[#CFE8EC] text-sm">Certified Gut Health Specialist</p>
                  <p className="mt-2 text-sm opacity-90">
                    Over 10+ years of experience in clinical nutrition and gut microbiome research.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                    <span className="flex items-center gap-1"><CheckCircle size={14} /> Verified Expert</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={14} /> 98% Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Form Section - White background */}
        <div className="mb-12 md:mb-16 bg-white rounded-2xl shadow-md border border-[#D9EEF2] p-5 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A4D3E]">Share Your Experience</h2>
            {!showRatingForm && (
              <button
                onClick={() => {
                  if (checkLogin()) setShowRatingForm(true);
                  else toast.error("Please login to write review");
                }}
                className="px-5 py-2 bg-[#18606D] text-white rounded-xl font-semibold hover:bg-[#2A7F8F] transition text-sm"
              >
                Write a Review
              </button>
            )}
          </div>

          {showRatingForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleSubmitRating}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-[#1A4D3E] mb-2">Your Rating *</label>
                <div className="flex gap-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A4D3E] mb-2">Your Review</label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none text-sm"
                  placeholder="Share your thoughts about this product..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={rating === 0}
                  className="px-6 py-2 bg-[#18606D] text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-[#2A7F8F] transition text-sm"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingForm(false)}
                  className="px-6 py-2 border border-[#D9EEF2] text-[#1A4D3E] rounded-xl hover:bg-[#F4FAFB] transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Customer Reviews List - White background, fixed height overflow */}
        <div className="mb-12 md:mb-16 bg-white rounded-2xl shadow-md border border-[#D9EEF2] p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#1A4D3E] mb-4">Customer Reviews ({ratingSummary.count})</h2>
          {reviews.length === 0 ? (
            <p className="text-[#64748B] italic text-center py-6">No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-[#D9EEF2] pb-4 last:border-0">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                    <span className="font-semibold text-[#1A4D3E] text-sm">{r.userId?.shippingAddress?.username ||r.userId?.name || "Anonymous"}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>
                  {r.review && <p className="text-sm text-[#475569] mt-1">{r.review}</p>}
                  <p className="text-xs text-[#64748B] mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Section */}
        {product.faqs?.length > 0 && (
          <div className="mb-12 md:mb-16">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3 max-w-3xl mx-auto">
              {product.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-[#D9EEF2] overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-5 py-3 text-left flex justify-between items-center hover:bg-[#F4FAFB] transition"
                  >
                    <span className="font-semibold text-[#1A4D3E] text-sm">{faq.question}</span>
                    {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-4 text-[#64748B] text-sm border-t border-[#D9EEF2]"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
       
        <button
          onClick={shareProduct}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#18606D] text-white shadow-lg flex items-center justify-center hover:scale-110 transition transform"
        >
          <Share2 size={18} />
        </button>
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-[#18606D] shadow-lg flex items-center justify-center hover:scale-110 transition transform border border-[#D9EEF2]"
          >
            <ChevronUp size={20} />
          </button>
        )}
      </div>

      {/* Sticky CTA for mobile (program only) */}
      {!isConsultation && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#D9EEF2] p-3 shadow-lg z-40">
          <div className="flex gap-3">
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} stock={product.stock} />
            <button
              onClick={HandleAddToCart}
              className="flex-1 py-3 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#18606D] text-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2"
          >
            <CheckCircle size={16} /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        productName={product.name}
        productPrice={product.salePrice || product.originalPrice}
      />
    </div>
  );
}