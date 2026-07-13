"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import CartSlideOut from "./components/CartSlideOut";
import Footer from "./components/Footer";

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


  return (
    <>
      {!shouldHide && <Navbar />}

      {!shouldHide && <CartSlideOut />}

      {children}

      {!shouldHide && <Footer />}
    </>
  );
}