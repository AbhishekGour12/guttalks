"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import CartSlideOut from "./components/CartSlideOut";
import Footer from "./components/Footer";
import TawkTo from "./components/TwakTo";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // All routes where components should hide
  const hiddenRoutes = [
    "/login",
    "/signup",
    "/admin",
    "/privacy-policy",
    "/terms-conditions",
    "/shipping-policy",
    "/refund-policy",
  ];

  // Check nested routes also
  const shouldHide = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHide && <Navbar />}
      {!shouldHide && <CartSlideOut />}
      {!shouldHide && <TawkTo />}

      {children}

      {!shouldHide && <Footer />}
    </>
  );
}