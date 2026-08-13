"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import { ProductApi } from "../lib/ProductApi";
import { PROGRAMS } from "../lib/guttalksContent";
import ScheduleCallModal from "./ScheduleCallModal";

export default function ProgramCardSlider() {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [activeId, setActiveId] = useState(PROGRAMS[0].id);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    ProductApi.getProducts({ limit: 100 })
      .then((res) => setProducts(res.products || []))
      .catch(() => {});
  }, []);

  const findSlug = (program) => {
    const match = products.find((p) => program.match.test(p.name || ""));
    return match?.slug || null;
  };

  const scrollByCard = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const active = PROGRAMS.find((p) => p.id === activeId) || PROGRAMS[0];

  return (
    <section id="solutions" className="py-16 md:py-20 bg-gradient-to-b from-white via-[#F4FAFB] to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-sm font-semibold tracking-wide text-[#18606D] uppercase mb-2">Our Solutions</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A4D3E] mb-3">
            Every Gut is Unique. Your Care Should Be Too.
          </h2>
          <p className="text-[#64748B] max-w-2xl mx-auto">
            Science-backed insights. Personalized solutions. Lasting wellness—all designed around you.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#64748B]">Swipe or use arrows to explore</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => scrollByCard(-1)} className="p-2.5 rounded-full border border-[#D9EEF2] bg-white text-[#18606D] hover:bg-[#E8F4F7]" aria-label="Previous">
              <FaArrowLeft size={14} />
            </button>
            <button type="button" onClick={() => scrollByCard(1)} className="p-2.5 rounded-full border border-[#D9EEF2] bg-white text-[#18606D] hover:bg-[#E8F4F7]" aria-label="Next">
              <FaArrowRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {PROGRAMS.map((program) => {
            const slug = findSlug(program);
            const isActive = activeId === program.id;
            return (
              <motion.article
                key={program.id}
                onClick={() => setActiveId(program.id)}
                whileHover={{ y: -4 }}
                className={`snap-start shrink-0 w-[85%] sm:w-[70%] md:w-[48%] lg:w-[38%] rounded-2xl overflow-hidden border cursor-pointer transition shadow-md ${
                  isActive ? "border-[#18606D] ring-2 ring-[#18606D]/20" : "border-[#D9EEF2] bg-white"
                }`}
              >
                <div className="relative h-48 sm:h-56 bg-[#F4FAFB]">
                  <Image src={program.image} alt={program.title} fill className="object-cover" sizes="(max-width: 768px) 85vw, 40vw" />
                  <span className="absolute top-3 left-3 bg-[#18606D]/95 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
                    {program.badge}
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-white">
                  <h3 className="font-bold text-[#1A4D3E] text-lg leading-snug line-clamp-2">{program.shortTitle || program.title}</h3>
                  <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{program.tagline}</p>
                  <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl font-bold text-[#18606D]">{program.price}</span>
                    {program.priceNote && <span className="text-[11px] text-[#94A3B8]">{program.priceNote}</span>}
                  </div>
                  {program.isConsultation ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowScheduleModal(true);
                      }}
                      className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white text-sm font-semibold"
                    >
                      {program.cta}
                    </button>
                  ) : (
                    <Link
                      href={slug ? `/product/${slug}` : "/#products"}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 block w-full py-2.5 rounded-xl bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white text-sm font-semibold text-center"
                    >
                      {program.cta}
                    </Link>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 md:mt-10 bg-white rounded-2xl border border-[#D9EEF2] p-5 sm:p-8 shadow-sm space-y-6"
        >
          <div>
            <h3 className="text-xl font-bold text-[#1A4D3E] mb-2">{active.title}</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">{active.tagline}</p>
            <p className="mt-2 text-lg font-bold text-[#18606D]">
              {active.price}
              {active.priceNote ? <span className="ml-2 text-xs font-normal text-[#94A3B8]">{active.priceNote}</span> : null}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#18606D] mb-2">The Problem</h4>
              <p className="text-sm text-[#475569] leading-relaxed">{active.problem}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#18606D] mb-2">The Solution</h4>
              <p className="text-sm text-[#475569] leading-relaxed">{active.solution}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#18606D] mb-2">The Transformation</h4>
              <p className="text-sm text-[#475569] leading-relaxed">{active.transformation}</p>
            </div>
          </div>

          {active.packages?.length > 0 && (
            <div className="pt-4 border-t border-[#E8F4F7]">
              <h4 className="text-sm font-bold text-[#1A4D3E] mb-3">Choose Your Program</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                {active.packages.map((pkg) => (
                  <div key={pkg.name} className="rounded-xl border border-[#D9EEF2] bg-[#F4FAFB] p-4">
                    <p className="font-semibold text-[#1A4D3E]">{pkg.name}</p>
                    <p className="text-xs text-[#64748B] mt-1">{pkg.detail}</p>
                    <p className="text-[#18606D] font-bold mt-2">{pkg.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E8F4F7] space-y-4">
            {active.phases.map((phase) => (
              <div key={phase.name} className="rounded-xl bg-[#F4FAFB] border border-[#E8F4F7] p-4">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <p className="font-semibold text-[#1A4D3E]">{phase.name}</p>
                  {phase.detail && <span className="text-xs text-[#18606D] font-medium">{phase.detail}</span>}
                </div>
                {phase.body && <p className="text-sm text-[#475569] leading-relaxed">{phase.body}</p>}
                {phase.benefits?.length > 0 && (
                  <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                    {phase.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-xs text-[#475569]">
                        <FaCheck className="text-[#18606D] mt-0.5 shrink-0" size={10} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        productName="GutTalks Root Rx Session"
        productPrice={99}
      />
    </section>
  );
}
