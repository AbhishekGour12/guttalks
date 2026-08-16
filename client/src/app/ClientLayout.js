"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import CartSlideOut from "./components/CartSlideOut";
import Footer from "./components/Footer";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

import OfferBannerWidget from "./components/OfferBannerWidget";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hiddenRoutes = [
    "/login",
    "/signup",
    "/admin",
    "/privacy-policy",
    "/terms-conditions",
    "/shipping-policy",
    "/refund-policy",
  ];

  const shouldHide = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const hideWhatsApp = [
    "/login",
    "/signup",
    "/admin"
  ].some((route) => pathname.startsWith(route));

  return (
    <>
      {!shouldHide && <OfferBannerWidget />}

      {!shouldHide && <Navbar />}

      {!shouldHide && <CartSlideOut />}

      {children}

      {!shouldHide && <Footer />}

      {!hideWhatsApp && (
        <motion.a
          href="https://wa.me/919888803053"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#22c35e] transition-colors flex items-center justify-center cursor-pointer border border-[#1ebd56]"
          aria-label="Chat on WhatsApp"
        >
          <FaWhatsapp className="w-7 h-7" />
        </motion.a>
      )}
    </>
  );
}