import mongoose from "mongoose";
import MCQ from "./Models/MCQ.js";
import "./config/env.js";

export const defaultMCQs = [
  {
    question: "How long have you been experiencing digestive issues?",
    options: ["Less than 1 month", "1–6 months", "6–12 months", "More than 1 year"],
    order: 1,
    isActive: true,
  },
  {
    question: "Which of the following symptoms do you experience regularly? (Select all that apply)",
    options: ["Bloating", "Acidity/Heartburn", "Constipation", "Diarrhoea", "Nausea", "Abdominal pain", "Gas", "None"],
    order: 2,
    isActive: true,
  },
  {
    question: "How would you rate your stress level on a typical day?",
    options: ["Very low", "Low", "Moderate", "High", "Very high"],
    order: 3,
    isActive: true,
  },
  {
    question: "Do you have any known food intolerances?",
    options: ["Yes – dairy", "Yes – gluten", "Yes – others", "No", "Unsure"],
    order: 4,
    isActive: true,
  },
  {
    question: "How many meals do you typically eat per day?",
    options: ["1–2", "3", "4–5", "More than 5", "Irregular"],
    order: 5,
    isActive: true,
  },
  {
    question: "Do you consume probiotic foods (yogurt, kefir, kimchi, etc.)?",
    options: ["Daily", "A few times a week", "Rarely", "Never"],
    order: 6,
    isActive: true,
  },
  {
    question: "Have you ever been diagnosed with a gut-related condition (IBS, IBD, GERD, etc.)?",
    options: ["Yes", "No", "Suspected but not diagnosed"],
    order: 7,
    isActive: true,
  },
  {
    question: "Do you take any regular medications that affect digestion (antibiotics, antacids, etc.)?",
    options: ["Yes – antibiotics", "Yes – antacids", "Yes – other", "No"],
    order: 8,
    isActive: true,
  },
  {
    question: "How would you describe your sleep quality?",
    options: ["Excellent", "Good", "Average", "Poor", "Very poor"],
    order: 9,
    isActive: true,
  },
  {
    question: "What is your primary goal for this consultation?",
    options: ["Diagnose root cause", "Get diet plan", "Manage symptoms", "Improve overall health", "Other"],
    order: 10,
    isActive: true,
  },
];

export async function seedMCQs(options = { isStandalone: false }) {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/gutstalk";

  try {
    if (options.isStandalone) {
      console.log(`Connecting to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB successfully!");
    }

    const existingCount = await MCQ.countDocuments();
    console.log(`Found ${existingCount} existing MCQ(s) in database.`);

    const operations = defaultMCQs.map((mcq) => ({
      updateOne: {
        filter: { question: mcq.question },
        update: { $set: mcq },
        upsert: true,
      },
    }));

    const result = await MCQ.bulkWrite(operations);
    console.log(`✅ MCQ Seeding Completed Successfully!`);
    console.log(`   - Matched/Updated: ${result.matchedCount}`);
    console.log(`   - Newly Inserted (Upserted): ${result.upsertedCount}`);

    if (options.isStandalone) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error seeding MCQs:", error.message);
    if (options.isStandalone) {
      process.exit(1);
    }
  }
}

// Execute if run directly from node CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  seedMCQs({ isStandalone: true });
}
