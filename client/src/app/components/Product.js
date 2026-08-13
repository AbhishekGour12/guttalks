// app/products/page.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, User, ShoppingCart, Calendar, Filter, Search } from "lucide-react";
import { ProductApi } from "../lib/ProductApi";

const LOCAL_IMAGE_FALLBACKS = [
  { match: /gut blueprint/i, src: "/program-blueprint.png" },
  { match: /rychbiome/i, src: "/program-rychbiome.png" },
  { match: /gutmap|microbiome test/i, src: "/program-gutmap.png" },
  { match: /root rx/i, src: "/program-rootrx.png" },
  { match: /rebalance|journey/i, src: "/program-rebalance.png" },
];

const getProductImage = (product) => {
  if (product.imageUrls?.[0]) {
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`;
  }
  const local = LOCAL_IMAGE_FALLBACKS.find((f) => f.match.test(product.name || ""));
  return local?.src || null;
};

// Product Card Component
const ProductCard = ({ product }) => {
  const isConsultation = product.productType === "consultation";
  const discount = Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100);
  const imageSrc = getProductImage(product);
  
  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        whileHover={{ y: -8, boxShadow: "0 20px 25px -12px rgba(0,0,0,0.15)" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#D9EEF2] cursor-pointer group h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-[#F4FAFB] flex-shrink-0">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#18606D]">
              No image
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#18606D] text-xs font-semibold px-2 py-1 rounded-full">
            {isConsultation ? "Consultation" : "Program"}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-[#1A4D3E] line-clamp-1">{product.name}</h3>
          <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{product.shortDescription}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-[#1A4D3E]">{product.rating}</span>
            <span className="text-xs text-[#64748B]">({product.reviewCount})</span>
          </div>
          
          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#18606D]">
              ₹{product.originalPrice && product.salePrice && product.originalPrice > product.salePrice ? product.salePrice : (product.originalPrice || product.salePrice)}
            </span>
            {product.originalPrice && product.salePrice && product.originalPrice > product.salePrice && (
              <span className="text-xs text-[#94A3B8] line-through">₹{product.originalPrice}</span>
            )}
          </div>
          
          {/* Consultation specific */}
          {isConsultation && (
            <div className="mt-2 flex items-center gap-1 text-xs text-[#18606D]">
              <Clock size={12} />
              <span>{product.consultationDuration}</span>
            </div>
          )}
          
          {/* Program stock */}
          {!isConsultation && product.stock > 0 && (
            <div className="mt-2 text-xs text-green-600">
              In stock ({product.stock} units)
            </div>
          )}
          
          <button className="mt-4 w-full py-2 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition">
            {isConsultation ? "Book Consultation" : "View Program"}
          </button>
        </div>
      </motion.div>
    </Link>
  );
};



export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // all, consultation, program
  const [searchQuery, setSearchQuery] = useState("");

  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductApi.getProducts({ limit: 100 });
      setProducts(res.products || []);
      console.log("fetched products", res.products)
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filterType !== "all" && product.productType !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return product.name.toLowerCase().includes(query) || 
             product.shortDescription?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7]" id="product">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Shop Programs & Consultations</h1>
          <p className="text-[#64748B] mt-2 max-w-2xl mx-auto">
            From Root Rx sessions to Gut Blueprint, GutMap testing, RychBiome probiotics, and Rebalance journeys—choose what fits your gut.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterType === "all"
                  ? "bg-[#18606D] text-white"
                  : "bg-white border border-[#D9EEF2] text-[#1A4D3E] hover:bg-[#F4FAFB]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("consultation")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterType === "consultation"
                  ? "bg-[#18606D] text-white"
                  : "bg-white border border-[#D9EEF2] text-[#1A4D3E] hover:bg-[#F4FAFB]"
              }`}
            >
              Consultations
            </button>
            <button
              onClick={() => setFilterType("program")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterType === "program"
                  ? "bg-[#18606D] text-white"
                  : "bg-white border border-[#D9EEF2] text-[#1A4D3E] hover:bg-[#F4FAFB]"
              }`}
            >
              Programs & Kits
            </button>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9B6E]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-white border border-[#D9EEF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18606D]"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18606D]"></div>
          </div>
        ) : (
          <>
            {/* Products Section */}
            {filteredProducts.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
                  {filterType === "all" ? "All Products" : filterType === "consultation" ? "Expert Consultations" : "Programs & Kits"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            
          </>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#1A4D3E]">No products found matching your criteria.</p>
            <button
              onClick={() => { setFilterType("all"); setSearchQuery(""); }}
              className="mt-3 text-[#18606D] underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}