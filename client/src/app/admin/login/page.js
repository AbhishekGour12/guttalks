"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEnvelope, FaLock, FaSignInAlt,
  FaKey, FaArrowLeft, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const TOKEN_KEY = "adminToken";
const INFO_KEY  = "_agi";

export default function AdminLogin() {
  const router = useRouter();

  // ── redirect if already logged in ───────────────────────────
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      router.replace('/admin');
    }
  }, [router]);

  // ── login state ──────────────────────────────────────────────
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  // ── forgot-password state ────────────────────────────────────
  const [mode, setMode]               = useState('login');
  const [fpEmail, setFpEmail]         = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fpLoading, setFpLoading]     = useState(false);

  // ── handlers ─────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/admin/login`,
        { email, password }
      );

      const { success, token, admin } = res.data;

      if (success && token) {
        // Write synchronously BEFORE navigation so admin/page.js always finds it
        window.localStorage.setItem(TOKEN_KEY, token);

        // Store obfuscated info (non-critical, ignore failures)
        try {
          const safe = {
            id:    admin.id    || admin._id || "",
            name:  admin.name  || "",
            email: admin.email || "",
            role:  admin.role  || "admin",
          };
          window.localStorage.setItem(INFO_KEY, btoa(JSON.stringify(safe)));
        } catch (_) {}

        toast.success('Login successful!');
        router.replace('/admin');
      } else {
        toast.error(res.data.error || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setFpLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/admin/reset-password`,
        { email: fpEmail, newPassword }
      );
      if (res.data.success) {
        toast.success('Password updated! Please sign in.');
        setEmail(fpEmail);
        setPassword('');
        setFpEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setMode('login');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setFpLoading(false);
    }
  };

  const switchToForgot = () => { setFpEmail(email); setMode('forgot'); };
  const switchToLogin  = () => { setNewPassword(''); setConfirmPassword(''); setMode('login'); };

  // ── ui ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7] px-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* LOGIN */}
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-xl border border-[#D9EEF2] p-8"
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-[#1A4D3E]">Admin Login</h1>
                <p className="text-[#64748B] text-sm mt-1">GutTalks admin panel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm" />
                    <input
                      type="email" required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
                      placeholder="admin@guttalks.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-[#1A4D3E]">Password</label>
                    <button type="button" onClick={switchToForgot} className="text-xs text-[#18606D] hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm" />
                    <input
                      type={showPassword ? 'text' : 'password'} required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#18606D]">
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50">
                  {loading
                    ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    : <><FaSignInAlt /> Sign In</>}
                </button>
              </form>
            </motion.div>
          )}

          {/* RESET PASSWORD */}
          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-xl border border-[#D9EEF2] p-8"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E8F4F7] rounded-full mb-3">
                  <FaKey className="text-[#18606D] text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-[#1A4D3E]">Reset Password</h1>
                <p className="text-[#64748B] text-sm mt-1">Enter your email and set a new password</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Admin Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm" />
                    <input
                      type="email" required
                      value={fpEmail}
                      onChange={e => setFpEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
                      placeholder="admin@guttalks.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm" />
                    <input
                      type={showNew ? 'text' : 'password'} required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
                      placeholder="Min. 6 characters"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#18606D]">
                      {showNew ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Confirm New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm" />
                    <input
                      type={showConfirm ? 'text' : 'password'} required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-red-400 bg-red-50'
                          : 'border-[#D9EEF2]'
                      }`}
                      placeholder="Re-enter new password"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#18606D]">
                      {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button type="submit"
                  disabled={fpLoading || !!(confirmPassword && confirmPassword !== newPassword)}
                  className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50">
                  {fpLoading
                    ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    : <><FaKey /> Update Password</>}
                </button>

                <button type="button" onClick={switchToLogin}
                  className="w-full flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#1A4D3E] transition">
                  <FaArrowLeft size={12} /> Back to Sign In
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
