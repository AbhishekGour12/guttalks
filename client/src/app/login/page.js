// src/app/login/page.jsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Phone, Heart, Sparkles, ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { authAPI } from "../lib/auth";
import { useDispatch } from "react-redux";
import { loginSuccess, logoutSuccess } from "../store/features/authSlice";

// --- Wellness/Health Premium Theme ---
const LoginPage = () => {
  const [hover, setHover] = useState(false);
  const [formData, setFormData] = useState({ 
    phone: ""
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  // Enhanced validation function
  const validatePhoneNumber = (phone, code) => {
    if (!phone || phone.trim() === "") {
      setPhoneError("");
      setIsPhoneValid(false);
      return false;
    }
    
    if (phone.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      setIsPhoneValid(false);
      return false;
    }
    
    if (!/^\d+$/.test(phone)) {
      setPhoneError("Only digits allowed");
      setIsPhoneValid(false);
      return false;
    }
    
    if (code === "+91") {
      const firstDigit = phone.charAt(0);
      if (!['6', '7', '8', '9'].includes(firstDigit)) {
        setPhoneError("Indian numbers must start with 6-9");
        setIsPhoneValid(false);
        return false;
      }
    }
    
    setPhoneError("");
    setIsPhoneValid(true);
    return true;
  };

  // Format phone number
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) return cleaned;
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    let cleaned = value.replace(/\D/g, "");
    
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    
    setFormData({ ...formData, phone: cleaned });
    validatePhoneNumber(cleaned, countryCode);
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!validatePhoneNumber(formData.phone, countryCode)) {
      toast.error(phoneError || "Please enter a valid phone number");
      return;
    }

    const fullPhone = `${countryCode}${formData.phone}`;

    try {
      setIsLoading(true);
      const response = await authAPI.requestotp(fullPhone);
      console.log("OTP sent to:", fullPhone);
      toast.success("OTP sent successfully!");
      setOtpSent(true);
      setTimer(120);

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtp("");
    handleSendOtp();
  };

  // Handle Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!otpSent) {
      toast.error("Please request OTP first");
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);
      const fullPhone = `${countryCode}${formData.phone}`;
      const userData = { phone: fullPhone, otp: otp };
      const response = await authAPI.login(userData);

      if (response) {
        toast.success(response.message || "Login successful!");
        
        localStorage.setItem("token", response.token);
        dispatch(loginSuccess(response.data));
        router.push("/");
      }
      
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7]">
      <div className="flex flex-col md:flex-row w-[90%] max-w-[1000px] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left Panel - Brand & Wellness Visual */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-10 bg-gradient-to-br from-[#18606D] to-[#2A7F8F] text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#CFE8EC] opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D9EEF2] opacity-10 rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-12 h-12 text-[#CFE8EC] fill-current" />
                <h1 className="text-4xl font-bold tracking-tight">GutTalks</h1>
              </div>
              <p className="text-sm text-[#CFE8EC] tracking-wide">Your Journey to Better Gut Health</p>
            </div>

            <div className="w-full flex justify-center mb-8">
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/login-gut-health.png"
                  alt="Gut Health Wellness"
                  fill
                  unoptimized
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300";
                  }}
                />
              </div>
            </div>

            <blockquote className="text-center italic text-[#CFE8EC] max-w-[280px] text-sm leading-relaxed">
              "A healthy gut is the foundation of a vibrant life. Start your transformation today."
            </blockquote>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-xs text-[#CFE8EC]">
                <Shield className="w-3 h-3" />
                <span>Trusted by 10,000+ users</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex justify-center items-center bg-white p-8 md:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#18606D]">Welcome Back</h2>
              <p className="text-sm text-[#2A7F8F] mt-2">Sign in to access your personalized gut health insights</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number with Country Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#18606D]">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 max-sm:w-fit px-3 py-3 rounded-xl border border-[#D9EEF2] bg-[#F4FAFB] text-[#18606D] font-medium focus:outline-none focus:ring-2 focus:ring-[#2A7F8F] focus:border-[#2A7F8F] transition-all max-sm:text-xs max-sm:px-1"
                    suppressHydrationWarning
                  >
                    <option value="+91">🇮🇳 +91</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      className={`w-full px-5 py-3 rounded-xl border ${
                        phoneError && formData.phone.length > 0
                          ? "border-red-400 bg-red-50 focus:ring-red-200"
                          : isPhoneValid && formData.phone.length === 10
                          ? "border-[#2A7F8F] bg-[#F4FAFB] focus:ring-[#2A7F8F]"
                          : "border-[#D9EEF2] bg-[#F4FAFB] focus:ring-[#2A7F8F] focus:border-[#2A7F8F]"
                      } text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 transition-all max-sm:placeholder:text-transparent`}
                      suppressHydrationWarning
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    {phoneError && formData.phone.length > 0 && (
                      <p className="text-xs text-red-500 mt-1 ml-2">{phoneError}</p>
                    )}
                    {isPhoneValid && formData.phone.length === 10 && !phoneError && (
                      <p className="text-xs text-[#2A7F8F] mt-1 ml-2 font-medium">✓ Valid phone number</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Send OTP Button */}
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading || !formData.phone || formData.phone.length !== 10}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white font-semibold hover:from-[#2A7F8F] hover:to-[#18606D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              )}

              {/* OTP Input */}
              {otpSent && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[#18606D]">
                    Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setOtp(value);
                      }}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-5 py-3 text-center text-xl tracking-[8px] font-mono rounded-xl border border-[#D9EEF2] bg-[#F4FAFB] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2A7F8F] focus:border-[#2A7F8F] transition-all"
                    />
                  </div>
                  
                  {timer > 0 ? (
                    <p className="text-center text-sm text-[#2A7F8F]">
                      OTP expires in <span className="font-semibold text-[#18606D]">{formatTime(timer)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="w-full text-center text-sm text-[#18606D] hover:text-[#2A7F8F] font-semibold transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || (otpSent && (!otp || otp.length !== 6))}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={`w-full py-3.5 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                  hover
                    ? "bg-gradient-to-r from-[#2A7F8F] to-[#18606D] text-white shadow-md"
                    : "bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>Login</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D9EEF2]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#2A7F8F]">New to GutWell?</span>
                </div>
              </div>

              {/* Guest Checkout Option */}
              <Link
                href="/"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  dispatch(logoutSuccess());
                }}
                className="block w-full py-3 text-center text-[#18606D] border border-[#D9EEF2] rounded-xl hover:bg-[#F4FAFB] hover:border-[#2A7F8F] transition-all font-medium"
              >
                Explore as Guest
              </Link>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-xs text-[#2A7F8F]">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-[#18606D] hover:text-[#2A7F8F] hover:underline transition-colors">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#18606D] hover:text-[#2A7F8F] hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </p>
              <p className="text-xs text-[#2A7F8F]">
                Need help with your gut health journey?{" "}
                <Link href="/contact" className="text-[#18606D] hover:text-[#2A7F8F] hover:underline transition-colors">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;