"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaFacebook, FaInstagram, FaLinkedin, FaGoogle, FaYoutube } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { CONTACT } from "../lib/guttalksContent";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e, href) => {
    if (href === "/#products") {
      const el = document.getElementById("products");
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const footerLinks = {
    Company: [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Products", href: "/#products" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms & Conditions", href: "/terms-conditions" },
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Refund Policy", href: "/refund-policy" },
    ],
    Support: [
      { name: "FAQs", href: "/faq" },
      { name: "Cancellation Policy", href: "/cancellation-policy" },
      { name: "Contact Support", href: "/contact" },
    ],
  };

  const socialLinks = [
    { icon: FaFacebook, href: "https://www.facebook.com/people/Gut-Talks/61593081512303/", label: "Facebook" },
    { icon: FaInstagram, href: "https://www.instagram.com/gut_talks_/", label: "Instagram" },
    { icon: FaLinkedin, href: "https://www.linkedin.com/in/gut-talks-7b655042a/", label: "LinkedIn" },
    { icon: FaGoogle, href: "https://share.google/7qbFlUldgr8UErTLE", label: "Google" },
    { icon: FaYoutube, href: "https://youtube.com/c/guttalks", label: "YouTube" },
  ];

  return (
    <footer className="bg-[#18606D] text-white mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">GutTalks</span>
            </div>
            <p className="text-sm text-[#CFE8EC] leading-relaxed">
              Your trusted partner for a healthier, happier gut. Personalized testing, expert consultations, and lasting digestive wellness.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="text-[#CFE8EC] hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              {footerLinks.Company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm text-[#CFE8EC] hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.Legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[#CFE8EC] hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-[#CFE8EC]">
                <FiMail className="flex-shrink-0 mt-0.5 text-white" size={16} />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#CFE8EC]">
                <FiPhone className="flex-shrink-0 mt-0.5 text-white" size={16} />
                <a href={`tel:${CONTACT.phoneTel}`} className="hover:text-white transition-colors">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#CFE8EC]">
                <FiMapPin className="flex-shrink-0 mt-0.5 text-white" size={16} />
                <span>{CONTACT.address}<br />{CONTACT.hours}</span>
              </li>
            </ul>
            {/* Small trust badge */}
            <div className="mt-6 pt-4 border-t border-white/30">
              <div className="flex items-center gap-2 text-xs text-[#CFE8EC]">
                <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                Secure & Trusted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#CFE8EC]">
            &copy; {currentYear} GutTalks. All rights reserved.
          </p>
          <p className="text-xs text-[#CFE8EC] flex items-center gap-1">
            Made with <FaHeart className="text-red-300 text-xs" /> for better gut health
          </p>
        </div>
      </div>
    </footer>
  );
}