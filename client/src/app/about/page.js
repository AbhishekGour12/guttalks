// app/about/page.jsx
"use client";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  FaCalendarCheck, FaCreditCard, FaUserEdit, FaVideo, FaMicrophoneAlt,
  FaShieldAlt, FaHeartbeat, FaLeaf, FaUsers, FaSmile, FaClock, 
  FaStar, FaQuoteLeft, FaArrowRight, FaCheckCircle, FaAward, FaMapMarkerAlt
} from "react-icons/fa";
import { CONTACT } from "../lib/guttalksContent";

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [inView, setInView] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('.section-fade').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stats = [
    { value: "1000s", label: "Trusted Clients", icon: FaUsers },
    { value: "Science", label: "Backed Care", icon: FaLeaf },
    { value: "Expert", label: "Gut Specialists", icon: FaAward },
    { value: "10–9", label: "All Days IST", icon: FaClock }
  ];

  const values = [
    { title: "Personalized Care", desc: "Every gut is unique—so is your plan", icon: FaHeartbeat, color: "#18606D" },
    { title: "Evidence-Based", desc: "Science-backed nutrition & testing", icon: FaLeaf, color: "#2A7F8F" },
    { title: "Compassionate Support", desc: "Guidance you can trust every step", icon: FaShieldAlt, color: "#0f766e" },
    { title: "Lasting Results", desc: "Sustainable habits, not quick fixes", icon: FaCheckCircle, color: "#0891b2" }
  ];

  const steps = [
    { num: 1, title: "Book Session", desc: "Root Rx from ₹99", icon: FaCalendarCheck },
    { num: 2, title: "Share Symptoms", desc: "Tell us your story", icon: FaUserEdit },
    { num: 3, title: "Expert Consult", desc: "One-on-one guidance", icon: FaMicrophoneAlt },
    { num: 4, title: "Get Your Plan", desc: "Nutrition & lifestyle roadmap", icon: FaCreditCard },
    { num: 5, title: "Continue Care", desc: "Programs, tests & probiotics", icon: FaVideo }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4FAFB] via-white to-[#E8F4F7]">
      <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/herocraousel_3.png"
            alt="GutTalks — your gut health partner"
            fill
            className="object-cover brightness-[0.45]"
            priority
          />
        </div>
        <motion.div style={{ opacity }} className="relative z-10 text-center text-white px-4 max-w-4xl">
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-sm uppercase tracking-widest text-[#CFE8EC] mb-3">
            About GutTalks
          </motion.p>
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-3xl md:text-5xl font-bold mb-4">
            More Than a Health Platform—Your Gut Health Partner
          </motion.h1>
          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Personalized, science-backed guidance beyond generic advice—so you never have to struggle with gut health alone.
          </motion.p>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <Link href="/#solutions" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105">
              Explore Our Solutions <FaArrowRight />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section id="story" className="section-fade py-20 px-4 max-w-6xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" animate={inView.story ? "visible" : "hidden"} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A4D3E] mb-4">Why We Exist</h2>
          <div className="w-20 h-1 bg-[#18606D] mx-auto rounded-full mb-6"></div>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" animate={inView.story ? "visible" : "hidden"} className="space-y-4 text-[#1A4D3E] text-lg leading-relaxed">
            <p>
              Many people experience bloating, acidity, irregular digestion, food sensitivities, and low energy—often trying multiple diets and remedies without lasting relief.
            </p>
            <p>
              That&apos;s why we created GutTalks: to provide personalized, science-backed guidance that goes beyond generic advice. Every gut is unique, so we take time to understand your symptoms, lifestyle, food habits, and health goals before creating a plan that&apos;s right for you.
            </p>
            <p>
              Our team of gut health experts combines clinical knowledge with compassionate care to help you improve digestion, restore gut balance, and build healthier habits for the long term.
            </p>
            <p className="font-medium text-[#18606D]">
              We don&apos;t believe in quick fixes or one-size-fits-all solutions. We believe in personalized care, evidence-based nutrition, and sustainable lifestyle changes that deliver lasting results.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate={inView.story ? "visible" : "hidden"} className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
            <Image src="/program-blueprint.png" alt="Personalized gut care" fill className="object-cover" />
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#18606D]/10 to-[#2A7F8F]/10 py-16">
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white rounded-xl p-6 text-center shadow-sm border border-[#D9EEF2]">
              <s.icon className="mx-auto text-[#18606D] text-2xl mb-2" />
              <p className="text-2xl font-bold text-[#1A4D3E]">{s.value}</p>
              <p className="text-sm text-[#64748B]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A4D3E] mb-4">Our Promise</h2>
          <p className="text-[#64748B] max-w-2xl mx-auto">
            You&apos;re more than a customer—you&apos;re part of our wellness community. We&apos;re committed to personalized guidance, science-backed nutrition support, and compassionate care for lasting gut health.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} whileHover={{ y: -8 }} className="bg-white rounded-xl p-6 text-center shadow-md border border-[#D9EEF2] hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-full bg-[#E8F4F7] flex items-center justify-center mx-auto mb-4" style={{ color: value.color }}><value.icon size={28} /></div>
              <h3 className="font-bold text-xl text-[#1A4D3E] mb-2">{value.title}</h3>
              <p className="text-[#64748B] text-sm">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1A4D3E] text-center mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step) => (
              <div key={step.num} className="bg-[#F4FAFB] rounded-xl p-5 border border-[#D9EEF2] text-center">
                <div className="w-10 h-10 rounded-full bg-[#18606D] text-white flex items-center justify-center mx-auto mb-3 font-bold">{step.num}</div>
                <step.icon className="mx-auto text-[#18606D] mb-2" />
                <h3 className="font-semibold text-[#1A4D3E]">{step.title}</h3>
                <p className="text-xs text-[#64748B] mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#18606D] to-[#2A7F8F] rounded-2xl p-8 md:p-10 text-white text-center shadow-xl">
          <FaMapMarkerAlt className="mx-auto text-3xl mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Visit Us</h2>
          <p className="text-lg text-[#CFE8EC] mb-2">{CONTACT.address}</p>
          <p className="text-sm text-[#CFE8EC]/90 mb-6">Work timing: {CONTACT.hours}</p>
          <p className="text-[#E8F4F7] mb-6 max-w-xl mx-auto">
            Welcome to GutTalks—your trusted partner for a healthier, happier gut. Trusted by thousands for expert guidance, support, and confidence throughout their journey.
          </p>
          <Link href="/" className="inline-block bg-white text-[#18606D] font-semibold px-6 py-3 rounded-full hover:bg-[#F4FAFB] transition">
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
}
