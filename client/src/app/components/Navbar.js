"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiPhone, FiCalendar, FiHome, 
  FiFileText, FiUser, FiMail, FiChevronRight,
  FiStar, FiShield, FiHeart, FiLogOut, FiShoppingCart,
  FiChevronDown
} from 'react-icons/fi';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../store/features/authSlice';
import { useCart } from '../context/CartContext';
import { ProductApi } from '../lib/ProductApi';
import { useModal } from '../context/ModalContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [mobileProductsExpanded, setMobileProductsExpanded] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const user = useSelector((state) => state.auth.user);
  const { setIsCartOpen, cartItems } = useCart();
  const { openScheduleModal } = useModal();

  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : (cartItems?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleLogout = () => {
    dispatch(logoutSuccess());
    localStorage.removeItem('token');
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  const navLinks = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Products', href: '#', icon: FiFileText, hasDropdown: true },
    ...(user?[{ name: 'My Orders', href: '/dashboard', icon: FiUser }]:[]),
    { name: 'Contact', href: '/contact', icon: FiMail },
    { name: 'About', href: '/about', icon: FiShield },
  ];
  
  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await ProductApi.getProducts({ limit: 8 });
        setProducts(res.products || []);
      } catch (error) {
        console.error("Failed to fetch products for dropdown:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileProducts = () => setMobileProductsExpanded(!mobileProductsExpanded);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={` fixed h-[90px] top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/98 shadow-lg border-b border-[#D9EEF2]' : 'bg-white/90 border-b border-[#D9EEF2]/50'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-[60px] max-md:h-[40px]">
              <Image src="/logo.png" alt="Logo" width={120} height={50} priority className="h-full w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.hasDropdown ? (
                  <>
                    <Link
                      href={link.href}
                      className={`text-sm font-medium relative transition-colors flex items-center gap-1 ${
                        isActive(link.href) ? 'text-[#18606D]' : 'text-[#64748B] hover:text-[#18606D]'
                      }`}
                    >
                      {link.name}
                      <FiChevronDown className={`text-sm transition-transform duration-200 group-hover:rotate-180`} />
                      {isActive(link.href) && (
                        <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#18606D] rounded-full" />
                      )}
                    </Link>
                    {/* Desktop Dropdown */}
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white rounded-2xl shadow-xl border border-[#D9EEF2] w-80 p-4">
                        <h3 className="text-sm font-semibold text-[#1A4D3E] px-2 pb-2 border-b border-[#D9EEF2] mb-2">
                          Popular Products
                        </h3>
                        {loadingProducts ? (
                          <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-[#18606D] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="max-h-80 overflow-y-auto space-y-2">
                            {products.map((product) => (
                              <Link
                                key={product._id}
                                href={`/product/${product.slug}`}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F4FAFB] transition"
                              >
                                <div className="w-10 h-10 rounded-lg bg-[#F4FAFB] overflow-hidden flex-shrink-0">
                                  {product.imageUrls?.[0] && (
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#1A4D3E] truncate">{product.name}</p>
                                  <p className="text-xs text-[#18606D] font-semibold">₹{product.salePrice}</p>
                                </div>
                                <FiChevronRight className="text-[#64748B] text-sm" />
                              </Link>
                            ))}
                            {products.length === 0 && !loadingProducts && (
                              <p className="text-sm text-[#64748B] text-center py-2">No products available</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    
                    className={`text-sm font-medium relative transition-colors ${
                      isActive(link.href) ? 'text-[#18606D]' : 'text-[#64748B] hover:text-[#18606D]'
                    } ${link.name === 'My Orders' && !user ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {link.name}
                    {isActive(link.href) && (
                      <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#18606D] rounded-full" />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Auth/CTA Section */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 rounded-full hover:bg-[#F4FAFB] transition"
            >
              <FiShoppingCart className="text-[#18606D] text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E67E22] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-4 ml-2">
                <span className="text-sm font-medium text-[#18606D]">Hi, {user.name || user.username || 'User'}!</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-xl border-2 border-[#18606D] text-[#18606D] text-sm font-semibold hover:bg-[#18606D] hover:text-white transition-all">
                  Login
                </motion.button>
              </Link>
            )}

            <motion.button whileHover={{ scale: 1.05 }} className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white px-5 py-2 rounded-xl text-sm font-semibold" onClick={() => openScheduleModal('Consultation', 399)}>
              Book ₹99 Call
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-[#18606D] bg-[#F4FAFB] rounded-lg">
            <FiMenu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu with Product Showcase */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[70] flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-[#D9EEF2]">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">GutTalks+</h2>
                  {user && <p className="text-sm text-[#18606D] font-medium">Welcome, {user.name || user.username || 'User'}!</p>}
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-[#F4FAFB] rounded-lg">
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Regular nav links */}
                {navLinks.map((link) => {
                  if (link.hasDropdown) {
                    return (
                      <div key={link.name} className="space-y-2">
                        <button
                          onClick={toggleMobileProducts}
                          className="w-full flex items-center justify-between p-3 rounded-xl text-[#64748B] hover:bg-[#F4FAFB] transition"
                        >
                          <div className="flex items-center gap-3">
                            <link.icon size={18} />
                            <span className="font-medium">{link.name}</span>
                          </div>
                          <FiChevronDown className={`text-sm transition-transform duration-200 ${mobileProductsExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileProductsExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-6 space-y-2"
                            >
                              {loadingProducts ? (
                                <div className="flex justify-center py-4">
                                  <div className="w-6 h-6 border-2 border-[#18606D] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              ) : products.length > 0 ? (
                                products.map((product) => (
                                  <Link
                                    key={product._id}
                                    href={`/product/${product.slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4FAFB] transition"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-[#F4FAFB] overflow-hidden flex-shrink-0">
                                      {product.imageUrls?.[0] && (
                                        <img
                                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[#1A4D3E] truncate">{product.name}</p>
                                      <p className="text-xs text-[#18606D] font-semibold">₹{product.salePrice}</p>
                                    </div>
                                    <FiChevronRight className="text-[#64748B] text-sm" />
                                  </Link>
                                ))
                              ) : (
                                <p className="text-sm text-[#64748B] text-center py-2">No products available</p>
                              )}
                              
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl ${isActive(link.href) ? 'bg-[#18606D]/10 text-[#18606D]' : 'text-[#64748B] hover:bg-[#F4FAFB]'}`}
                    >
                      <link.icon size={18} />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  );
                })}
                
                {/* Cart link */}
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-[#64748B] hover:bg-[#F4FAFB] transition"
                >
                  <FiShoppingCart size={18} />
                  <span className="font-medium">Cart ({cartCount})</span>
                </button>
              </div>

              {/* Bottom Auth Section */}
              <div className="p-4 border-t border-[#D9EEF2] space-y-3">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full border-2 border-red-500 text-red-500 p-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
                  >
                    <FiLogOut /> Logout
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full border-2 border-[#18606D] text-[#18606D] p-3 rounded-xl flex items-center justify-center gap-2 font-semibold">
                      <FiUser /> Login
                    </button>
                  </Link>
                )}
                <button
                  onClick={() => {
                    openScheduleModal('Consultation', 399);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <FiCalendar /> Book ₹99 Consultation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-[90px]" />
    </>
  );
};

export default Navbar;