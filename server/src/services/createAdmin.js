// scripts/createAdmin.js
import mongoose from 'mongoose';
import Admin from '../Models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await Admin.findOne({ email: 'admin@guttalks.in' });
    if (!existingAdmin) {
      const admin = new Admin({
        name: 'Super Admin',
        email: 'admin@guttalks.in',
        password: 'Admin@123' // Change this!
      });
      await admin.save();
      console.log('✅ Admin created successfully');
    } else {
      console.log('⚠️ Admin already exists');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export { createAdmin };