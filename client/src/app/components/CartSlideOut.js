"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlus, FaMinus, FaTrash, FaArrowLeft, FaWallet, FaMoneyBillWave } from "react-icons/fa";

import { useCart } from "../context/CartContext";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { couponAPI } from "../lib/coupons";
import { ProductApi } from "../lib/ProductApi";
import { paymentAPI } from "../lib/payment";
import { orderAPI } from "../lib/order";
import { useRouter } from "next/navigation";
import axios from "axios";

const CartSlideOut = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    fetchCart,
    clearCart
  } = useCart();
  
  const user = useSelector((s) => s.auth.user);

  // ================================
  // 1. DATA LOADING
  // ================================
  const [mappedCart, setMappedCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  // PAYMENT TYPE
  const [paymentMethod, setPaymentMethod] = useState(null); 
  const [showCODSummary, setShowCODSummary] = useState(false); 

  const codFee = 52;
  
  const getCartItemProductId = (item) => {
    if (item.productId) return String(item.productId);
    if (typeof item.product === "string") return item.product;
    if (item.product?._id) return String(item.product._id);
    return null;
  };

  const resolveVariantPrice = (item) => {
    const variant = item.variant;
    const product = item.product;
    if (!variant || !product) return null;

    if (variant.price != null && variant.price !== "") {
      return Number(variant.price);
    }

    if (variant.type === "both" && variant.name?.includes(" + ")) {
      const [durLabel, packLabel] = variant.name.split(" + ").map((s) => s.trim());
      const dur = product.durationOptions?.find((d) => d.duration === durLabel);
      const pack = product.packOptions?.find((p) => p.name === packLabel);
      if (dur && pack) return Number(dur.salePrice) + Number(pack.salePrice);
    }
    if (variant.type === "duration" || variant.name) {
      const dur = product.durationOptions?.find(
        (d) => d.duration === variant.name || variant.name?.includes(d.duration)
      );
      if (dur?.salePrice != null) return Number(dur.salePrice);
    }
    if (variant.type === "pack" || variant.name) {
      const pack = product.packOptions?.find(
        (p) => p.name === variant.name || variant.name?.includes(p.name)
      );
      if (pack?.salePrice != null) return Number(pack.salePrice);
    }
    return null;
  };

  // Load Products Logic
  useEffect(() => {
    const loadProducts = async () => {
      if (!isCartOpen || cartItems.length === 0) {
        if (cartItems.length === 0) setMappedCart([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      try {
        const final = [];
        for (const item of cartItems) {
          const id = getCartItemProductId(item);
          if (!id) continue;

          let product = item.product;
          if (typeof product === "string" || !product?.name) {
            product = await ProductApi.getProductById(id);
          }

          final.push({
            ...item,
            product,
            variant: item.variant ?? null,
          });
        }

        if (final.length > 0) {
          setMappedCart(final);
        } else {
          console.warn("Cart sync: could not resolve products for cart items");
        }
      } catch (err) {
        console.error("Cart Sync Error:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [cartItems, isCartOpen]);

  // ================================
  // 2. CHECKOUT STATE
  // ================================
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryETA, setDeliveryETA] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCOD, setIsCOD] = useState(false); 
  const [address, setAddress] = useState({
    fullName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  });
  const [token, setToken] = useState(null);
  const onClose = () => setIsCartOpen(false);


useEffect(() => { fetchCart(); }, [user]);

  useEffect(() => {
    const mergeCart = async () => {
      const guestCart = JSON.parse(localStorage.getItem("cart"));
      if (guestCart && user) {
        for (const item of guestCart) {
          await addToCart(item.product._id || item.productId, item.quantity);
        }
        localStorage.removeItem("cart");
        await fetchCart();
      }
    };
    mergeCart();
  }, [user]);

  // Load Available Coupons
  const [availableCoupons, setAvailableCoupons] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const data = await couponAPI.getAll();
        setAvailableCoupons(data.coupons);
      } catch {}
    };
    load();
  }, []);
  
  // ================================
  // RESET LOGIC
  // ================================
  useEffect(() => {
    if (couponDiscount > 0) {
      setCouponDiscount(0);
      setCouponCode("");
      setDeliveryETA(null);
      setIsCOD(false);
      setShowCODSummary(false);
      if (checkoutStep === 'payment' || checkoutStep === 'coupon') {
        setCheckoutStep('address'); 
        toast("Cart updated. Please recalculate shipping.");
      }
    }
  }, [mappedCart, cartItems]);

  // ================================
  // 3. CALCULATION
  // ================================
  const calculateUnitFinalPrice = (item) => {
    if (!item.product) return 0;

    const variantPrice = resolveVariantPrice(item);
    if (variantPrice != null) return variantPrice;

    const price = item.product.salePrice ?? item.product.price ?? item.product.originalPrice ?? 0;
    return Number(price);
  };


 const subtotal = useMemo(() => {
  return mappedCart.reduce((acc, item) => {
    const unitPrice = calculateUnitFinalPrice(item); // ✅ pass item, not item.product
    return acc + (unitPrice * item.quantity);
  }, 0);
}, [mappedCart]);

  const totalWeight = useMemo(() => 
    mappedCart.reduce((sum, item) => sum + Number(item?.product?.weight || 0.2) * item.quantity, 0), 
  [mappedCart]);

  const onlineDiscountPercent = 10;
  const onlineDiscountAmountPreview = Math.round(subtotal * (onlineDiscountPercent / 100));
  const onlinePreviewTotal = subtotal - couponDiscount - onlineDiscountAmountPreview;
  const codTotal = subtotal - couponDiscount + codFee;
  const finalAmount = paymentMethod === "online"
    ? Number(onlinePreviewTotal.toFixed(0))
    : isCOD
      ? Math.ceil(codTotal)
      : Number((subtotal - couponDiscount).toFixed(2));
  const roundOffAmount = isCOD ? finalAmount - codTotal : 0;

  // ================================
  // 4. ACTIONS
  // ================================
  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter valid coupon.");
    setLoading(true);
    try {
      const res = await couponAPI.applyCoupon(couponCode, subtotal);
      setCouponDiscount(res.discount);
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

 const validateAddress = () => {
  const newErrors = {};

  // Full Name: letters, spaces, min 3 chars
  const nameRegex = /^[A-Za-z\s]{3,}$/;
  if (!address.fullName.trim()) {
    newErrors.fullName = "Full name is required";
  } else if (!nameRegex.test(address.fullName.trim())) {
    newErrors.fullName = "Use only letters and spaces (min 3 characters)";
  }

  // Email: valid format and local part must contain at least one letter
  const email = address.email.trim();
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!email) {
    newErrors.email = "Email address is required";
  } else if (!emailRegex.test(email)) {
    newErrors.email = "Enter a valid email address (e.g., name@example.com)";
  } else {
    const localPart = email.split('@')[0];
    if (!/[A-Za-z]/.test(localPart)) {
      newErrors.email = "Email local part must contain at least one letter (cannot be only numbers)";
    }
  }

  // Phone: exactly 10 digits, starts with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!address.phone) {
    newErrors.phone = "Mobile number is required";
  } else if (!phoneRegex.test(address.phone)) {
    newErrors.phone = "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
  }

  // Address Line 1
  if (!address.addressLine1.trim()) {
    newErrors.addressLine1 = "Address is required";
  }

  // City
  if (!address.city.trim()) {
    newErrors.city = "City is required";
  }

  // State
  if (!address.state) {
    newErrors.state = "Please select a state";
  }

  // Pincode: exactly 6 digits
  const pincodeRegex = /^\d{6}$/;
  if (!address.pincode) {
    newErrors.pincode = "Pincode is required";
  } else if (!pincodeRegex.test(address.pincode)) {
    newErrors.pincode = "Enter a valid 6-digit pincode";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const calculateShipping = async () => {
    if (!validateAddress()) return toast.error("Check address fields");
    setLoading(true);
    setIsCOD(false);
    setShowCODSummary(false);
    try {
      const charge = await ProductApi.getShippingCharges({
        address: address,
        delivery_postcode: address.pincode,
        weight: totalWeight
      });
      toast.success("Address saved & Shipping updated!");
      localStorage.setItem("shippingAddress", JSON.stringify(address));
      setToken(charge.user.phone);
      setCheckoutStep("coupon");
    } catch (err) {
      toast.error(err.message || "Shipping error");
    }
    setLoading(false);
  };

  const handleRazorpay = async () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment gateway is still loading. Please wait 2 seconds.");
      return;
    }
    const discountAmount = Number(subtotal * 0.10).toFixed(2);
    const finalOnlineAmount = subtotal - couponDiscount - discountAmount;
    const roundedRupees = Math.round(finalOnlineAmount);
    const amountToPay = roundedRupees * 100;
    if (!amountToPay || amountToPay < 100) {
      toast.error("Invalid payment amount");
      return;
    }
    setLoading(true);
    try {
      const rpOrder = await paymentAPI.createOrder({
        amount: amountToPay,
        phone: token
      });
      const options = {
        key: "rzp_live_T8bgEapAOWAFoo",
        amount: rpOrder.amount,
        currency: "INR",
        order_id: rpOrder.id,
        name: "GutTalks",
        remember_customer: true,
        modal: {
          ondismiss: function () { setLoading(false); },
          handleback: true,
          backdropclose: false,
          zIndex: 999999,
          confirm_close: true,
          animation: true,
          escape: false
        },
        config: {
          display: {
            blocks: {
              utp: { name: "UPI Apps", instruments: [{ method: 'upi' }] },
              bank: { name: "Cards & NetBanking", instruments: [{ method: 'card' }, { method: 'netbanking' }] }
            },
            sequence: ['block.utp', 'block.bank'],
            preferences: { show_default_blocks: true }
          }
        },
        retry: { enabled: true, max_count: 3 },
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
          method: 'upi'
        },
        theme: { color: "#18606D" },
        handler: async (response) => {
          try {
            const verify = await paymentAPI.verifyPayment(response);
            if (verify.success) {
              await placeOrder("online", response);
            } else {
              toast.error("Payment Verification Failed");
            }
          } catch (err) {
            toast.error("Verification Error");
          } finally {
            setLoading(false);
          }
        }
      };
      const rz = new window.Razorpay(options);
      rz.on('payment.failed', function (response) {
        toast.error("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rz.open();
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setCheckoutStep("cart");
      setShowCODSummary(false);
      setIsCOD(false);
      setPaymentMethod(null);
    }
  }, [user]);

  const placeOrder = async (payMethod, paymentDetails = null) => {
    setLoading(true);
    try {
      const formData = {
        shippingAddress: address,
        paymentMethod: payMethod,
        paymentDetails,
        discount: couponDiscount,
        offerDiscount: 0,
        roundOff: roundOffAmount,
        isCODEnabled: isCOD,
        totalWeight,
        finalAmount,
        phone: token,
        items: mappedCart,
        userId: user ? true : false,
      };
      const order = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/order`, formData);
      toast.success("Order Placed!");
      await clearCart();
      localStorage.removeItem("cart");
      setIsCartOpen(false);
      setTimeout(() => router.push("/orders"), 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order Failed");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (checkoutStep === "address") setCheckoutStep("cart");
    else if (checkoutStep === "coupon") setCheckoutStep("address");
    else if (checkoutStep === "payment") {
      if (showCODSummary) {
        setShowCODSummary(false);
        setIsCOD(false);
      } else {
        setCheckoutStep("coupon");
      }
    }
  };

  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isCartOpen]);

   const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAddress = localStorage.getItem("shippingAddress");
      if (savedAddress) {
        try { setAddress(JSON.parse(savedAddress)); } catch {}
      }
    }
  }, []);
  useEffect(() => {
    if (!isCartOpen) return;
    const savedAddress = localStorage.getItem("shippingAddress");
    if (savedAddress) {
      try { setAddress(JSON.parse(savedAddress)); } catch {}
    }
  }, [isCartOpen]);

  useEffect(() => {
    const loadRazorpayScript = () => new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
    if (isCartOpen && checkoutStep === 'payment') loadRazorpayScript();
  }, [isCartOpen, checkoutStep]);

  const handleOnlinePayment = async () => {
    setIsCOD(false);
    setPaymentMethod("online");
    if (!window.Razorpay) {
      toast.loading("Loading payment gateway...", { id: 'razorpay-load' });
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        toast.dismiss('razorpay-load');
        setTimeout(() => handleRazorpay(), 100);
      };
      script.onerror = () => {
        toast.dismiss('razorpay-load');
        toast.error("Failed to load payment gateway. Please try again.");
      };
      document.body.appendChild(script);
      return;
    }
    handleRazorpay();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className="fixed inset-x-0 bottom-0 top-[90px] bg-black/40 z-9999"
            style={{zIndex: 999999}}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-[90px] h-[calc(100vh-90px)] max-w-md w-full bg-white shadow-xl z-9999"
           style={{ zIndex: 1000000 }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          >
            {/* Header */}
            <div className="flex justify-between p-6 border-b border-[#D9EEF2]">
              <div className="flex items-center gap-3">
                {checkoutStep !== "cart" && <FaArrowLeft className="cursor-pointer text-[#18606D]" onClick={goBack} />}
                <h2 className="font-bold text-xl text-[#1A4D3E]">Checkout</h2>
              </div>
              <FaTimes className="cursor-pointer text-xl text-[#64748B] hover:text-[#18606D]" onClick={onClose} />
            </div>

            <div className="p-6 overflow-y-auto flex-1 h-[calc(100%-140px)]">
              {/* Cart step (unchanged) */}
              {checkoutStep === "cart" && (
                <>
                  {mappedCart.length === 0 ? <p className="text-center text-gray-500">Cart Empty</p> : (
                  mappedCart.map((item) => {
  const unitPrice = calculateUnitFinalPrice(item);
  return (
    <div key={item._id || `${getCartItemProductId(item)}-${item.variant?.name || "default"}`} className="flex gap-3 bg-gray-100 p-3 rounded-lg mb-3">
      <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.product.imageUrls[0]}`} className="w-20 h-20 rounded-lg object-cover" />
      <div className="flex-1">
        <p className="font-semibold">{item.product.name}</p>
        {item.variant && (
          <p className="text-xs text-[#64748B]">Variant: {item.variant.name}</p>
        )}
        <div><span className="font-bold">₹{unitPrice.toFixed(2)}</span></div>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 bg-gray-200 rounded"><FaMinus/></button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 bg-gray-200 rounded"><FaPlus/></button>
          <FaTrash className="text-teal-600 ml-auto cursor-pointer" onClick={() => removeFromCart(item._id)}/>
        </div>
      </div>
    </div>
  );
})
                  )}
                  {mappedCart.length > 0 && (
                    <button onClick={() => setCheckoutStep("address")} className="w-full bg-[#0f766e] text-white py-3 rounded-xl mt-4">Proceed to Address</button>
                  )}
                </>
              )}

              {/* Address step (unchanged) – kept same as before */}
              {checkoutStep === "address" && (
                <>
                  <h3 className="font-bold mb-3 text-[#1A4D3E]">Shipping Address</h3>
                  <div className="space-y-3">
                    {Object.keys(address).map((k) => (
                      <div key={k}>
                        {k === "state" ? (
                          <select
                            value={address.state}
                            onChange={(e) => { setAddress({ ...address, state: e.target.value }); setErrors({ ...errors, state: "" }); }}
                            className={`w-full border p-2 rounded ${errors.state ? "border-red-500" : ""}`}
                          >
                            <option value="">Select State</option>
                            {indianStates.map(stateName => <option key={stateName} value={stateName}>{stateName}</option>)}
                          </select>
                        ) : (
                          <input
                            value={address[k]}
                            placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
                            onChange={(e) => { setAddress({ ...address, [k]: e.target.value }); setErrors({ ...errors, [k]: "" }); }}
                            className={`w-full border p-2 rounded ${errors[k] ? "border-red-500" : ""}`}
                          />
                        )}
                        {errors[k] && <p className="text-red-500 text-xs">{errors[k]}</p>}
                      </div>
                    ))}
                  </div>
                  <button onClick={calculateShipping} disabled={loading} className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3 rounded-xl mt-6 font-semibold">
                    {loading ? "Processing..." : "Proceed to Coupons"}
                  </button>
                </>
              )}

              {/* NEW ENHANCED COUPON PANEL */}
              {checkoutStep === "coupon" && (
                <>
                  <h3 className="font-bold mb-3 text-[#1A4D3E]">Apply Coupon</h3>
                  <div className="flex gap-2 mb-4">
                    <input 
                      value={couponCode} 
                      onChange={e => setCouponCode(e.target.value)} 
                      className="flex-1 border border-[#D9EEF2] px-3 py-2 rounded-xl bg-[#F4FAFB] focus:ring-2 focus:ring-[#18606D]"
                      placeholder="Enter coupon code"
                    />
                    <button 
                      onClick={applyCoupon} 
                      disabled={loading}
                      className="px-4 py-2 bg-[#18606D] text-white rounded-xl font-medium hover:bg-[#2A7F8F] transition-colors disabled:opacity-50"
                    >
                      {loading ? "..." : "Apply"}
                    </button>
                  </div>

                  <p className="font-semibold mb-2 text-[#18606D] flex items-center gap-2">Available Coupons</p>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {availableCoupons.length ? (
                      availableCoupons.map((cp) => (
                        <div 
                          key={cp._id} 
                          className="border-2 border-dashed border-[#D9EEF2] rounded-xl p-3 bg-white hover:border-[#18606D] transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-[#18606D]">{cp.code}</span>
                                {cp.maxDiscount && (
                                  <span className="text-[10px] bg-[#E8F4F7] text-[#18606D] px-2 py-0.5 rounded-full font-bold">
                                    SAVE UP TO ₹{cp.maxDiscount}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-[#1A4D3E] mt-1">
                                {cp.discountType === "percentage" 
                                  ? `Get ${cp.discountValue}% OFF` 
                                  : `Flat ₹${cp.discountValue} OFF`}
                              </p>
                            </div>
                            <button 
                              onClick={() => setCouponCode(cp.code)}
                              className="text-[#2A7F8F] font-bold text-sm hover:underline"
                            >
                              APPLY
                            </button>
                          </div>
                          <div className="mt-2 pt-2 border-t border-[#D9EEF2]">
                            <details className="group">
                              <summary className="text-[11px] text-[#18606D] cursor-pointer font-medium list-none flex items-center gap-1 group-open:mb-2">
                                <span>Terms & Conditions</span>
                                <span className="group-open:rotate-180 transition-transform text-[8px]">▼</span>
                              </summary>
                              <div className="text-[10px] text-[#64748B] space-y-1 bg-[#F4FAFB] p-2 rounded">
                                <li className="list-none">• Min. Order Value: <b>₹{cp.minAmount || 0}</b></li>
                                {cp.maxDiscount && <li className="list-none">• Max. Discount: <b>₹{cp.maxDiscount}</b></li>}
                                <li className="list-none">• Valid until: <b>{new Date(cp.expiresAt).toLocaleDateString()}</b></li>
                              </div>
                            </details>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#64748B] text-center py-10">No coupons available right now.</p>
                    )}
                  </div>

                  <button 
                    onClick={() => setCheckoutStep("payment")} 
                    className="w-full mt-6 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                  >
                    Continue to Payment
                  </button>
                </>
              )}

              {/* Payment step (same as before, but with updated colours) – kept for brevity */}
              {checkoutStep === "payment" && (
                <div className="space-y-4 px-2">
                  {!showCODSummary && (
                    <div className="flex flex-col gap-3">
                      <h3 className="font-bold text-base text-[#1A4D3E]">Select Payment Method</h3>
                      <button onClick={handleOnlinePayment} className="w-full bg-[#0f766e] text-white p-4 rounded-2xl active:scale-[0.98] transition-all shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-left">
                            <FaWallet className="text-sm text-yellow-400"/>
                            <div><span className="block font-semibold text-sm">Pay Online</span><span className="text-[10px] text-yellow-300 font-bold uppercase">★ 10% Discount Applied</span></div>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-lg leading-none">₹{onlinePreviewTotal.toFixed(0)}</span>
                            <span className="text-[10px] line-through opacity-50">₹{(subtotal - couponDiscount).toFixed(2)}</span>
                          </div>
                        </div>
                      </button>
                     
                      <p className="text-[10px] text-center text-gray-400 mt-2 px-6">Pay online to avoid extra COD charges and get the best price.</p>
                    </div>
                  )}
                  {showCODSummary && (
                    <div className="bg-teal-50 p-5 rounded-xl border border-teal-200 animate-in fade-in slide-in-from-bottom-4">
                      <h3 className="font-bold text-[#0f766e] mb-4 text-lg border-b border-teal-200 pb-2">COD Order Summary</h3>
                      <div className="space-y-2 text-sm text-gray-700 mb-4">
                        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-teal-600"><span>Shipping</span><span>FREE</span></div>
                        <div className="flex justify-between text-teal-700 font-medium"><span>COD Handling Charges</span><span>+ ₹{codFee}</span></div>
                        {couponDiscount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>- ₹{couponDiscount}</span></div>}
                        <div className="border-t border-teal-200 pt-2 mt-2 flex justify-between font-bold text-lg text-[#0f766e]"><span>Total Payable</span><span>₹{finalAmount}</span></div>
                      </div>
                      <button onClick={() => placeOrder("cod")} disabled={loading} className="w-full bg-[#0f766e] text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                        {loading ? "Processing..." : `Place COD Order (₹${finalAmount})`}
                      </button>
                      <button onClick={() => { setShowCODSummary(false); setIsCOD(false); }} className="w-full text-center text-sm text-gray-500 mt-3 underline">Change Payment Method</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Summary Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-99999">
              <div onClick={() => setShowPriceDetails(!showPriceDetails)} className="flex justify-between cursor-pointer">
                <span className="font-bold text-[#0f766e]">Total: ₹{finalAmount.toFixed(0)}</span>
                <span className="text-[#0f766e] text-sm">{showPriceDetails ? "Hide Details ▲" : "View Details ▼"}</span>
              </div>
              <AnimatePresence>
                {showPriceDetails && (
                  <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden bg-gray-50 mt-2 rounded text-sm p-3 space-y-2">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-teal-600"><span>Shipping</span><span>FREE</span></div>
                    {isCOD && <div className="flex justify-between text-teal-700"><span>COD Handling</span><span>+₹{codFee}</span></div>}
                    {couponDiscount > 0 && <div className="flex justify-between text-green-700"><span>Coupon Discount</span><span>-₹{couponDiscount}</span></div>}
                    {paymentMethod === "online" && <div className="flex justify-between text-cyan-700"><span>Online Discount (10%)</span><span>-₹{onlineDiscountAmountPreview.toFixed(2)}</span></div>}
                    <hr/>
                    <div className="flex justify-between font-bold text-lg text-[#0f766e]"><span>Grand Total</span><span>₹{finalAmount}</span></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSlideOut;