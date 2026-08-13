"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiFacebook, FiTwitter,
  FiInstagram, FiLinkedin, FiChevronDown, FiHelpCircle, FiMessageSquare,
} from "react-icons/fi";
import { FaWhatsapp, FaHeadset, FaShieldAlt, FaFlask, FaUserMd } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../lib/api";
import { CONTACT, SUPPORT_TOPICS, FAQS } from "../lib/guttalksContent";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first to send a message");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post("/contact/submit", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      if (response.data.success) {
        toast.success(response.data.message || "Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: FiMapPin, title: "Visit Us", details: CONTACT.address },
    { icon: FiPhone, title: "Call Us", details: CONTACT.phoneDisplay, link: `tel:${CONTACT.phoneTel}` },
    { icon: FiMail, title: "Email Us", details: CONTACT.email, link: `mailto:${CONTACT.email}` },
    { icon: FiClock, title: "Working Hours", details: CONTACT.hours },
  ];

  const socialLinks = [
    { name: "Facebook", icon: FiFacebook, url: "https://facebook.com/guttalks", color: "#1877F2" },
    { name: "Instagram", icon: FiInstagram, url: "https://instagram.com/guttalks", color: "#E4405F" },
    { name: "Twitter", icon: FiTwitter, url: "https://twitter.com/guttalks", color: "#1DA1F2" },
    { name: "LinkedIn", icon: FiLinkedin, url: "https://linkedin.com/company/guttalks", color: "#0077B5" },
    { name: "WhatsApp", icon: FaWhatsapp, url: CONTACT.whatsapp, color: "#25D366" },
  ];

  const quickLinks = [
    { icon: FaUserMd, title: "Root Rx Session", desc: "Book expert consult for ₹99", href: "/#solutions" },
    { icon: FaFlask, title: "GutMap Complete™", desc: "Advanced microbiome testing", href: "/#solutions" },
    { icon: FiHelpCircle, title: "Full FAQ", desc: "Programs, pricing & safety", href: "/faq" },
    { icon: FaShieldAlt, title: "Policies", desc: "Privacy, refunds & terms", href: "/privacy-policy" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7]">
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#18606D]/5 to-[#2A7F8F]/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-semibold uppercase tracking-wide text-[#18606D] mb-2">
            Customer Support
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-[#1A4D3E] mb-4">
            We&apos;re Here to Help
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-[#64748B] max-w-2xl mx-auto">
            Questions about consultations, GutMap testing, programs, or products? Reach our support team—we respond promptly and with care.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactInfo.map((info, idx) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 text-center shadow-md border border-[#D9EEF2]"
            >
              <div className="w-12 h-12 rounded-full bg-[#E8F4F7] flex items-center justify-center mx-auto mb-4 text-[#18606D]">
                <info.icon size={22} />
              </div>
              <h3 className="font-bold text-[#1A4D3E] mb-2">{info.title}</h3>
              {info.link ? (
                <a href={info.link} className="text-[#64748B] text-sm hover:text-[#18606D] transition">
                  {info.details}
                </a>
              ) : (
                <p className="text-[#64748B] text-sm">{info.details}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Support topics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <FaHeadset className="text-[#18606D] text-xl" />
          <h2 className="text-2xl font-bold text-[#1A4D3E]">How Can We Support You?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SUPPORT_TOPICS.map((topic, idx) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-[#D9EEF2] p-4 shadow-sm"
            >
              <h3 className="font-semibold text-[#1A4D3E] text-sm mb-1">{topic.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{topic.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick links: Root Rx / GutMap / FAQ / Policies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-start gap-3 bg-white rounded-xl border border-[#D9EEF2] p-4 hover:border-[#18606D] hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E8F4F7] flex items-center justify-center text-[#18606D] shrink-0">
                <item.icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-[#1A4D3E] text-sm">{item.title}</p>
                <p className="text-xs text-[#64748B]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg border border-[#D9EEF2] p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <FiMessageSquare className="text-[#18606D]" />
              <h2 className="text-2xl font-bold text-[#1A4D3E]">Send us a message</h2>
            </div>
            <p className="text-[#64748B] mb-6 text-sm">We strive to respond promptly during working hours.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Subject *</label>
                  <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none bg-white">
                    <option value="">Select a subject</option>
                    <option value="consultation">Consultation Booking</option>
                    <option value="gutmap">GutMap Complete™ Testing</option>
                    <option value="blueprint">Gut Blueprint Program</option>
                    <option value="rychbiome">RychBiome Probiotics</option>
                    <option value="rebalance">Gut Rebalance Journey</option>
                    <option value="program">Program Guidance</option>
                    <option value="product">Product Query</option>
                    <option value="technical">Technical Assistance</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Message *</label>
                <textarea name="message" rows="5" required minLength={10} value={formData.message} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none" placeholder="Tell us how we can help..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-70">
                {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><FiSend /> Send Message</>}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-[#D9EEF2] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#D9EEF2]">
                <h3 className="font-bold text-[#1A4D3E]">Find Us in Jalandhar</h3>
                <p className="text-xs text-[#64748B]">{CONTACT.address}</p>
              </div>
              <div className="h-64 w-full">
                <iframe
                  src={CONTACT.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="GutTalks — Bombay Nagar, Jalandhar"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-[#D9EEF2] p-6">
              <h3 className="text-xl font-bold text-[#1A4D3E] mb-4">Connect With Us</h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4FAFB] border border-[#D9EEF2] text-[#1A4D3E] hover:shadow-md transition"
                  >
                    <social.icon size={18} style={{ color: social.color }} />
                    <span className="text-sm font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] rounded-2xl p-6 text-white text-center">
              <FaWhatsapp size={32} className="mx-auto mb-2" />
              <h3 className="text-xl font-bold mb-1">Chat on WhatsApp</h3>
              <p className="text-sm opacity-90 mb-3">Quick replies · {CONTACT.hours}</p>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-[#18606D] px-5 py-2 rounded-xl font-semibold hover:shadow-lg transition">
                Start Chat
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ on Contact */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A4D3E] mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-[#64748B]">Quick answers—or visit our full <Link href="/faq" className="text-[#18606D] font-medium underline">FAQ page</Link>.</p>
        </div>
        <div className="space-y-3">
          {FAQS.slice(0, 6).map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="bg-white rounded-xl border border-[#D9EEF2] shadow-sm overflow-hidden">
                <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : idx)} className="w-full flex items-center justify-between gap-4 p-4 text-left">
                  <span className="font-semibold text-[#1A4D3E] text-sm sm:text-base">{item.q}</span>
                  <FiChevronDown className={`text-[#18606D] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm text-[#475569] leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 text-center text-xs text-[#64748B]">
          <Link href="/privacy-policy" className="bg-white border border-[#D9EEF2] rounded-xl p-3 hover:border-[#18606D]">Privacy Policy</Link>
          <Link href="/refund-policy" className="bg-white border border-[#D9EEF2] rounded-xl p-3 hover:border-[#18606D]">Refund & Cancellation</Link>
          <Link href="/terms-conditions" className="bg-white border border-[#D9EEF2] rounded-xl p-3 hover:border-[#18606D]">Terms of Service</Link>
        </div>
      </section>
    </div>
  );
}
