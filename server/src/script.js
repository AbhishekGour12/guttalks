import mongoose from 'mongoose';
import MCQ from './Models/MCQ.js';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: "./src/.env" });

const defaultMCQs = [
  { question: "How long have you been experiencing digestive issues?", options: ["Less than 1 month", "1‑6 months", "6‑12 months", "More than 1 year"], order: 1 },
  { question: "Which of the following symptoms do you experience regularly? (Select all that apply)", options: ["Bloating", "Acidity/Heartburn", "Constipation", "Diarrhoea", "Nausea", "Abdominal pain", "Gas", "None"], order: 2 },
  { question: "How would you rate your stress level on a typical day?", options: ["Very low", "Low", "Moderate", "High", "Very high"], order: 3 },
  { question: "Do you have any known food intolerances?", options: ["Yes – dairy", "Yes – gluten", "Yes – others", "No", "Unsure"], order: 4 },
  { question: "How many meals do you typically eat per day?", options: ["1‑2", "3", "4‑5", "More than 5", "Irregular"], order: 5 },
  { question: "Do you consume probiotic foods (yogurt, kefir, kimchi, etc.)?", options: ["Daily", "A few times a week", "Rarely", "Never"], order: 6 },
  { question: "Have you ever been diagnosed with a gut‑related condition (IBS, IBD, GERD, etc.)?", options: ["Yes", "No", "Suspected but not diagnosed"], order: 7 },
  { question: "Do you take any regular medications that affect digestion (antibiotics, antacids, etc.)?", options: ["Yes – antibiotics", "Yes – antacids", "Yes – other", "No"], order: 8 },
  { question: "How would you describe your sleep quality?", options: ["Excellent", "Good", "Average", "Poor", "Very poor"], order: 9 },
  { question: "What is your primary goal for this consultation?", options: ["Diagnose root cause", "Get diet plan", "Manage symptoms", "Improve overall health", "Other"], order: 10 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await MCQ.deleteMany({});
    await MCQ.insertMany(defaultMCQs);
    console.log("✅ 10 default MCQs seeded");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();