// controllers/adminAuthController.js
import Admin from '../Models/Admin.js';
import jwt from 'jsonwebtoken';
import "../config/env.js";

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Admin found:', admin);
    const isMatch = await admin.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Optional: Get current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};