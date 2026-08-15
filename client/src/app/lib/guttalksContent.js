/** Shared GutTalks marketing & support content */

export const CONTACT = {
  address: "274-275, Bombay Nagar, Jalandhar",
  hours: "10 AM – 9 PM IST (All days working)",
  email: "help@guttalks.in",
  phoneDisplay: "+91 98765 43210",
  phoneTel: "+919876543210",
  whatsapp: "https://wa.me/919876543210",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3407.5!2d75.5762!3d31.3260!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5a5747a9eb8d%3A0xe4b0f0f0f0f0f0f0!2sBombay%20Nagar%2C%20Jalandhar%2C%20Punjab!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
};

export const SUPPORT_TOPICS = [
  {
    title: "Consultation Bookings",
    desc: "Help scheduling, rescheduling, or joining your Root Rx or expert session.",
  },
  {
    title: "Program Guidance",
    desc: "Questions about Gut Blueprint, Rebalance Journey phases, or your personalized plan.",
  },
  {
    title: "Product Queries",
    desc: "RychBiome probiotics, GutMap Complete kits, shipping, and usage guidance.",
  },
  {
    title: "Technical Assistance",
    desc: "Login, payments, Zoom links, reports, or website issues.",
  },
  {
    title: "General Support",
    desc: "Anything else—we're here to provide a supportive experience.",
  },
];

export const FAQS = [
  {
    q: "What is GutTalks?",
    a: "GutTalks is a personalized gut health platform that combines advanced microbiome testing, expert consultations, tailored nutrition, and customized probiotics to help identify and address the root cause of digestive issues.",
  },
  {
    q: "How is GutTalks different?",
    a: "Unlike generic advice, our recommendations are based on your unique microbiome profile. We create a personalized plan and provide ongoing expert support throughout your gut health journey.",
  },
  {
    q: "Do I need to visit a clinic?",
    a: "No. Your microbiome test kit is delivered to your home and can be completed in under 10 minutes. Consultations are conducted online, with in-person appointments available in Jalandhar.",
  },
  {
    q: "When can I expect results?",
    a: "Many people notice improvements in digestion, bloating, and energy within a few weeks. Results vary based on your health, consistency, and personalized plan.",
  },
  {
    q: "Is the program safe?",
    a: "Yes. Our approach focuses on improving gut health through personalized nutrition and evidence-based recommendations. It is designed to support your wellness and is not a substitute for medical treatment.",
  },
  {
    q: "How much does it cost to get started?",
    a: "Start with an Expert Gut Health Consultation (Root Rx Session) for ₹99 (Introductory Offer; was ₹399). Additional programs, microbiome tests, and personalized probiotics are transparently priced on their respective pages.",
  },
  {
    q: "What is The Gut Blueprint: 360° Restoration Program?",
    a: "A clinically guided, personalized gut restoration system using microbiome testing, custom probiotics, expert consultations, and nutrition tracking. Price: ₹2,599. Phases: Test & Discover (Weeks 1–2), Targeted Rebalance (Weeks 3–10), Ongoing Mastery (Months 3–6+).",
  },
  {
    q: "What is RychBiome Personalized Probiotics?",
    a: "Custom probiotics formulated after an advanced microbiome test—with clinically validated strains, the right CFU strength, and acid-resistant capsules. Price: ₹8,999.",
  },
  {
    q: "What is GutMap Complete™?",
    a: "An advanced at-home microbiome test powered by Next-Generation DNA Sequencing (NGS), plus a detailed report and one-on-one expert consultation. Pricing: Single ₹7,999 · Double ₹14,999 · Family Pack (3) ₹23,449.",
  },
  {
    q: "What is The Gut Rebalance Journey?",
    a: "A personalized nutrition program based on your microbiome profile. Choose 2-Month (₹5,199), 3-Month (₹7,399), or 4-Month with WhatsApp support (₹9,999). Phases: Calm & Reset, Rebuild & Rebalance, Maintain & Thrive.",
  },
];

export const PROGRAMS = [
  {
    id: "blueprint",
    match: /gut blueprint/i,
    image: "/program-blueprint.png",
    badge: "Flagship Program",
    title: "The Gut Blueprint: 360° Restoration Program™",
    shortTitle: "The Gut Blueprint",
    tagline:
      "A clinically guided, personalized gut restoration system using microbiome testing, custom probiotics, expert consultations, and nutrition tracking.",
    price: "₹25,999",
    priceNote: null,
    problem:
      "Chronic gut issues like IBS, bloating, food sensitivities, and fatigue often stem from underlying microbiome imbalances—not a lack of effort or ineffective lifestyle habits.",
    solution:
      "The Gut Blueprint: 360° Restoration Program™ combines advanced microbiome testing, precision-formulated personalized probiotics, expert medical consultations, and tailored nutrition guidance to identify and address your gut's unique root causes.",
    transformation:
      "By creating a data-driven, clinically guided restoration plan, the program helps restore digestive health, reduce recurring symptoms, and support lasting gut function so you can eat, feel, and live with greater confidence.",
    phases: [
      {
        name: "Phase 1: Test & Discover",
        detail: "Weeks 1–2",
        body: "Complete the Gut Talks Advanced Microbiome Test at home in under 10 minutes. Using advanced sequencing, we analyze your gut microbiome and provide a detailed report. In a one-on-one consultation, your clinical dietitian explains the results and creates your personalized gut restoration plan.",
      },
      {
        name: "Phase 2: Targeted Rebalance",
        detail: "Weeks 3–10",
        body: "Based on your results, you'll receive a precision-formulated synbiotic blend, a personalized nutrition plan, and regular expert check-ins. Your plan is adjusted as needed to help improve digestion, reduce bloating, and support a healthier gut.",
      },
      {
        name: "Phase 3: Ongoing Mastery",
        detail: "Months 3–6+",
        body: "Continue with expert consultations to refine your nutrition and supplementation as your gut improves. This phase focuses on maintaining long-term digestive balance, resilience, and sustainable gut health.",
      },
    ],
    benefits: [],
    cta: "Explore Program",
    isConsultation: false,
  },
  {
    id: "rychbiome",
    match: /rychbiome/i,
    image: "/program-rychbiome.png",
    badge: "Personalized Probiotics",
    title: "RychBiome Personalized Probiotics by Gut Talks",
    shortTitle: "RychBiome Probiotics",
    tagline: "Personalized probiotics designed for your unique microbiome.",
    price: "₹8,999",
    priceNote: null,
    problem:
      "Every gut microbiome is unique, but most probiotics are made for everyone. This one-size-fits-all approach may not effectively address bloating, digestive discomfort, fatigue, or other gut health concerns.",
    solution:
      "RychBiome Personalized Probiotics start with an advanced microbiome test to understand your unique gut profile. Based on your results, our experts formulate a custom probiotic with clinically validated strains, the right CFU strength, and acid-resistant capsules for optimal delivery.",
    transformation:
      "A personalized probiotic helps restore gut balance, improve digestion, reduce bloating, enhance nutrient absorption, and support long-term digestive wellness—so you can feel your best every day.",
    phases: [
      { name: "Science-Backed Formula", detail: "Core", body: "Advanced probiotics to support gut balance and digestive wellness." },
      { name: "Supports Gut Health", detail: "Benefits", body: "Helps improve digestion, reduce bloating, and support regularity." },
      { name: "Personalized for You", detail: "Custom", body: "Tailored to your unique microbiome for better, lasting results." },
      { name: "Clean • Safe • Effective", detail: "Quality", body: "High quality ingredients. No unnecessary additives." },
    ],
    benefits: [],
    cta: "View Product",
    isConsultation: false,
  },
  {
    id: "gutmap",
    match: /gutmap|microbiome test/i,
    image: "/program-gutmap.png",
    badge: "GutMap Complete™",
    title: "Advanced Gut Microbiome Testing",
    shortTitle: "GutMap Complete™",
    tagline:
      "Unlock personalized insights into your gut microbiome with the advanced GutMap Complete™ test.",
    price: "From ₹7,999",
    priceNote: "Single ₹7,999 · Double ₹14,999 · Family Pack (3) ₹23,449",
    problem:
      "Many digestive issues stem from an imbalanced gut microbiome, not just food choices. Without understanding your unique gut bacteria, generic treatments may only provide temporary relief instead of addressing the root cause.",
    solution:
      "Gut Talks GutMap Complete™ is an advanced at-home microbiome test powered by Next-Generation DNA Sequencing (NGS). It analyzes your gut bacteria and microbial diversity, then provides a detailed report and a one-on-one expert consultation with personalized nutrition, probiotic, and gut restoration recommendations.",
    transformation:
      "Understand your gut with confidence instead of guesswork. With science-backed insights and personalized recommendations, you can improve digestion, restore gut balance, optimize nutrition, and support long-term digestive health.",
    phases: [
      { name: "Advanced Testing", detail: "NGS", body: "Science-backed analysis of your gut microbiome." },
      { name: "Personalized Insights", detail: "Report", body: "Understand your unique gut profile." },
      { name: "Actionable Guidance", detail: "Plan", body: "Get clear recommendations to improve your gut health." },
      { name: "Private & Secure", detail: "Trust", body: "Your data is safe, confidential & protected." },
    ],
    benefits: [],
    cta: "Order Your Test",
    isConsultation: false,
  },
  {
    id: "rootrx",
    match: /root rx|root-rx/i,
    image: "/program-rootrx.png",
    badge: "Introductory Offer",
    title: "GutTalks Root Rx Session",
    shortTitle: "Root Rx Session",
    tagline: "Take the Free Gut Assessment mindset—analyze your gut issues with an expert.",
    price: "₹99",
    priceNote: "Introductory offer · Was ₹399",
    problem:
      "Bloating, irregular digestion, fatigue, skin concerns, and other recurring symptoms may be signs that your gut needs personalized attention. If diets and generic solutions haven't worked, it's time to understand your gut better.",
    solution:
      "Connect with certified gut health experts in a one-on-one consultation. We'll identify potential triggers behind your symptoms and provide a personalized nutrition and lifestyle roadmap tailored to your body, goals, and gut health.",
    transformation:
      "Gain clarity about your digestive health, make informed nutrition choices, and take the first step toward better digestion, improved well-being, and lasting gut health.",
    phases: [
      { name: "Symptom Clarity", detail: "Step 1", body: "Identify potential triggers behind your symptoms." },
      { name: "Personal Roadmap", detail: "Step 2", body: "Nutrition & lifestyle guidance tailored to your goals." },
      { name: "Expert Support", detail: "Step 3", body: "One-on-one care from certified gut health experts." },
    ],
    benefits: [],
    cta: "Book for ₹99",
    isConsultation: true,
  },
  {
    id: "rebalance",
    match: /rebalance|journey/i,
    image: "/program-rebalance.png",
    badge: "Nutrition Journey",
    title: "The Gut Rebalance Journey",
    shortTitle: "Gut Rebalance Journey",
    tagline:
      "A personalized nutrition program based on your unique microbiome profile to restore gut balance, improve digestion, and support long-term gut health.",
    price: "From ₹5,199",
    priceNote: "2-Mo ₹5,199 · 3-Mo ₹7,399 · 4-Mo ₹9,999 (+ WhatsApp support)",
    problem:
      "Lasting gut health needs structured, personalized nutrition—not one-size-fits-all diets or short detoxes.",
    solution:
      "Choose your program length and move through Calm & Reset, Rebuild & Rebalance, and Maintain & Thrive—with Low-FODMAP guidance, probiotic support, and sustainable lifestyle strategies.",
    transformation:
      "Reduce triggers, restore microbial balance, and build lasting habits for long-term digestive wellness.",
    phases: [
      {
        name: "Phase 1: Calm & Reset",
        detail: "Weeks 1–4",
        body: "Reduce triggers. Calm your gut. Build the foundation for healing with a personalized Low-FODMAP nutrition plan to identify food triggers and reduce bloating, gas, and digestive discomfort.",
        benefits: [
          "Personalized Low-FODMAP meal plan",
          "Identify food triggers",
          "Reduce bloating & digestive discomfort",
          "Improve gut comfort & regularity",
          "Support a healthier gut environment",
        ],
      },
      {
        name: "Phase 2: Rebuild & Rebalance",
        detail: "Weeks 5–12",
        body: "Restore your microbiome with personalized probiotic support and gradual food reintroduction to improve gut bacteria, digestion, and nutrient absorption.",
        benefits: [
          "Customized probiotic recommendations",
          "Restore microbial balance",
          "Gradual food reintroduction",
          "Improve microbiome diversity",
          "Better digestion & nutrient absorption",
        ],
      },
      {
        name: "Phase 3: Maintain & Thrive",
        detail: "Months 4–6+",
        body: "Build lasting gut health with a flexible nutrition plan and lifestyle strategies that help prevent recurring digestive issues.",
        benefits: [
          "Maintain healthy gut bacteria",
          "Diverse, gut-friendly nutrition",
          "Sustainable lifestyle habits",
          "Reduce recurring symptoms",
          "Long-term digestive wellness",
        ],
      },
    ],
    packages: [
      { name: "2-Month Program", detail: "Covers Phases 1 & 2", price: "₹5,199" },
      { name: "3-Month Program", detail: "Covers All 3 Phases", price: "₹7,399" },
      { name: "4-Month Program", detail: "All 3 Phases + 2 Months WhatsApp Support", price: "₹9,999" },
    ],
    benefits: [],
    cta: "Choose Your Plan",
    isConsultation: false,
  },
];
