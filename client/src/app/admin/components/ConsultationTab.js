"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTag, FaClock, FaSave, FaEye, FaToggleOn, FaToggleOff, FaRedoAlt, FaStethoscope } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../lib/api";

export default function ConsultationTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    basePrice: 499,
    offerPrice: 99,
    timerDurationMinutes: 5,
    isOfferActive: true,
    bannerText: "⚡ Special Offer! Book Root Rx Consultation for ₹99 (Was ₹499)"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/admin/consultation-settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Error fetching consultation settings:", err);
      toast.error("Failed to load consultation settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.put("/admin/consultation-settings", settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Consultation settings saved successfully!");
        setSettings(res.data.settings);
      } else {
        toast.error(res.data.message || "Failed to update settings");
      }
    } catch (err) {
      console.error("Error saving consultation settings:", err);
      toast.error(err?.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetUserTimer = () => {
    try {
      localStorage.removeItem("gut_consultation_offer_expiration");
      localStorage.removeItem("gut_consultation_offer_expired");
      localStorage.removeItem("gut_consultation_banner_dismissed");
      toast.success("Local offer timer reset! Refresh your site to test the offer banner again.");
    } catch (err) {
      toast.error("Could not reset local storage");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#18606D]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#D9EEF2]">
        <div>
          <div className="flex items-center gap-2">
            <FaStethoscope className="text-[#18606D] text-2xl" />
            <h1 className="text-2xl font-bold text-[#1A4D3E]">Consultation Offer & Pricing Settings</h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Configure dynamic consultation base price, offer price, and persistent countdown banner settings for visitors.
          </p>
        </div>

        <button
          onClick={handleResetUserTimer}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F4F7] text-[#18606D] rounded-xl text-sm font-semibold hover:bg-[#D9EEF2] transition shadow-sm"
        >
          <FaRedoAlt size={14} /> Reset My Offer Timer
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Settings */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-[#D9EEF2] space-y-6">
          <h2 className="text-lg font-bold text-[#1A4D3E] border-b border-[#D9EEF2] pb-3 flex items-center gap-2">
            <FaTag className="text-[#18606D]" /> Pricing & Offer Duration
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Offer Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#F4FAFB] rounded-xl border border-[#D9EEF2]">
              <div>
                <span className="font-semibold text-[#1A4D3E] block">Offer Status</span>
                <span className="text-xs text-[#64748B]">Enable or disable the limited-time consultation offer across the site.</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, isOfferActive: !settings.isOfferActive })}
                className="text-3xl transition-colors focus:outline-none"
              >
                {settings.isOfferActive ? (
                  <FaToggleOn className="text-[#18606D]" />
                ) : (
                  <FaToggleOff className="text-gray-400" />
                )}
              </button>
            </div>

            {/* Base Price & Offer Price Inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">
                  Base Price (₹) <span className="text-xs font-normal text-gray-500">(Original Price)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={settings.basePrice}
                    onChange={(e) => setSettings({ ...settings, basePrice: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none font-semibold text-[#1A4D3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">
                  Offer Price (₹) <span className="text-xs font-normal text-gray-500">(Discounted Price)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#18606D] font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={settings.offerPrice}
                    onChange={(e) => setSettings({ ...settings, offerPrice: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 border border-[#18606D] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none font-bold text-[#18606D] bg-[#F4FAFB]"
                  />
                </div>
              </div>
            </div>

            {/* Timer Duration */}
            <div>
              <label className="block text-sm font-semibold text-[#1A4D3E] mb-1 flex items-center gap-1.5">
                <FaClock className="text-[#18606D]" /> Offer Timer Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                required
                value={settings.timerDurationMinutes}
                onChange={(e) => setSettings({ ...settings, timerDurationMinutes: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none font-semibold text-[#1A4D3E]"
              />
              <p className="text-xs text-[#64748B] mt-1">
                First-time visitors will see a live countdown for this duration. The timer persists across reloads via LocalStorage.
              </p>
            </div>

            {/* Banner Announcement Text */}
            <div>
              <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">
                Offer Banner Announcement Text
              </label>
              <input
                type="text"
                required
                value={settings.bannerText}
                onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none text-sm font-medium"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-60"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <FaSave /> Save Consultation Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview & Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9EEF2] space-y-4">
            <h2 className="text-lg font-bold text-[#1A4D3E] border-b border-[#D9EEF2] pb-3 flex items-center gap-2">
              <FaEye className="text-[#18606D]" /> Live Customer View Preview
            </h2>

            {/* Top Banner Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">1. Top Banner Preview</span>
              <div className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white p-3 rounded-xl shadow-md text-center text-xs sm:text-sm font-semibold flex items-center justify-between gap-2">
                <span className="truncate">{settings.bannerText}</span>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-xs shrink-0">⏱️ 04:59</span>
              </div>
            </div>

            {/* Floating Corner Badge Preview */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">2. Floating Corner Badge Preview (When Banner Dismissed)</span>
              <div className="bg-white border-2 border-[#18606D] rounded-full p-2.5 shadow-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 pl-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="font-bold text-[#18606D]">Offer ends in 04:59</span>
                </div>
                <span className="bg-[#18606D] text-white font-bold px-3 py-1.5 rounded-full text-xs">
                  Book @ ₹{settings.offerPrice}
                </span>
              </div>
            </div>

            {/* Price Pricing Summary */}
            <div className="bg-[#F4FAFB] p-4 rounded-xl border border-[#D9EEF2] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Price (After Offer Expiration):</span>
                <span className="font-bold text-gray-700">₹{settings.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#18606D] font-semibold">Active Offer Price:</span>
                <span className="font-bold text-[#18606D]">₹{settings.offerPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">User Savings:</span>
                <span className="font-bold text-green-600">₹{Math.max(0, settings.basePrice - settings.offerPrice)} OFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
