"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import { FAQS, CONTACT } from "../lib/guttalksContent";

export default function FaqPage() {
  const [open, setOpen] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7] pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A4D3E] mb-3">Frequently Asked Questions</h1>
          <p className="text-[#64748B]">
            Clear answers about GutTalks, GutMap Complete™, Root Rx, programs, and pricing.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div key={item.q} className="bg-white rounded-xl border border-[#D9EEF2] shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
                >
                  <span className="font-semibold text-[#1A4D3E]">{item.q}</span>
                  <FaChevronDown className={`text-[#18606D] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 sm:px-5 pb-5 text-sm text-[#475569] leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-[#D9EEF2] p-6 text-center space-y-3">
          <p className="text-[#1A4D3E] font-medium">Still have questions?</p>
          <p className="text-sm text-[#64748B]">
            {CONTACT.address} · {CONTACT.hours}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="inline-block bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white px-6 py-2.5 rounded-xl font-semibold">
              Contact Support
            </Link>
            <Link href="/#solutions" className="inline-block border border-[#18606D] text-[#18606D] px-6 py-2.5 rounded-xl font-semibold">
              View Solutions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
