import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "./src/.env" });

const mongoUri = process.env.MONGO_URI || "mongodb://172.17.0.1:27017/gutstalk";

async function update() {
  try {
    console.log("Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    const Product = mongoose.model("Product", new mongoose.Schema({
      name: String,
      imageUrls: [String]
    }));

    const res1 = await Product.updateOne(
      { name: /The Gut Blueprint/i },
      { $set: { imageUrls: [
        "/uploads/products/1776018002773-64276654.png",
        "/uploads/products/1776018002782-246491941.png",
        "/uploads/products/1776018002798-377911366.png",
        "/uploads/products/1776018002814-285698901.png",
        "/uploads/products/1776018002839-361715729.png"
      ]}}
    );
    console.log("Updated The Gut Blueprint:", res1);

    const res2 = await Product.updateOne(
      { name: /RychBiome/i },
      { $set: { imageUrls: [
        "/uploads/products/1775908721933-66250082.jpg",
        "/uploads/products/1775908721949-83460323.jpg",
        "/uploads/products/1775908721952-359530967.jpg"
      ]}}
    );
    console.log("Updated RychBiome:", res2);

    const res3 = await Product.updateOne(
      { name: /GutMap/i },
      { $set: { imageUrls: [
        "/uploads/products/1776017394000-772962374.png",
        "/uploads/products/1776017394022-431766192.png",
        "/uploads/products/1776017394032-863785680.png",
        "/uploads/products/1776017394057-414533836.png"
      ]}}
    );
    console.log("Updated GutMap:", res3);

    const res4 = await Product.updateOne(
      { name: /GutTalks Root Rx/i },
      { $set: { imageUrls: [
        "/uploads/products/1777624057820-476026179.png",
        "/uploads/products/1777624057833-683364295.png",
        "/uploads/products/1777624057840-997936983.png"
      ]}}
    );
    console.log("Updated GutTalks Root Rx:", res4);

    console.log("All updates complete!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error during update:", err);
  }
}

update();
