"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaKey, FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getApiBaseUrl } from '../../lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing in the URL.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const res = await axios.post(
        `${apiBaseUrl}/api/admin/reset-password`,
        { token, newPassword }
      );
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setSuccess(true);
        setTimeout(() => {
          router.replace('/admin/login');
        }, 2500);
      } else {
        toast.error(res.data.error || 'Failed to reset password');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-[#D9EEF2] p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 text-red-500 rounded-full mb-4">
          <FaLock size={20} />
        </div>
        <h1 className="text-2xl font-bold text-[#1A4D3E] mb-2">Invalid Request</h1>
        <p className="text-[#64748B] text-sm mb-6">The password reset link is invalid, incomplete, or missing a token.</p>
        <button
          onClick={() => router.replace('/admin/login')}
          className="w-full bg-[#18606D] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
        >
          <FaArrowLeft size={12} /> Back to Login
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-[#D9EEF2] p-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4 animate-bounce">
            <FaCheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#1A4D3E] mb-2">Password Reset Successful!</h1>
          <p className="text-[#64748B] text-sm mb-6">Your password has been successfully updated. Redirecting you to the login page...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#18606D]" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
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
            <h1 className="text-2xl font-bold text-[#1A4D3E]">Create New Password</h1>
            <p className="text-[#64748B] text-sm mt-1">Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              disabled={loading || !!(confirmPassword && confirmPassword !== newPassword)}
              className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50">
              {loading
                ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                : <><FaKey /> Reset Password</>}
            </button>

            <button type="button" onClick={() => router.replace('/admin/login')}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#1A4D3E] transition">
              <FaArrowLeft size={12} /> Back to Sign In
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AdminResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7] px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-xl border border-[#D9EEF2] p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18606D] mx-auto mb-4" />
            <p className="text-[#64748B] text-sm">Loading page...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
