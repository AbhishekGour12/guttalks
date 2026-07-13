import Order from '../Models/Order.js';
import Booking from '../Models/Booking.js';
import User from '../Models/User.js';
import {Product} from '../Models/Product.js';
import Slot from '../Models/Slot.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Current date boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Orders stats
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.customStatus !== 'completed' && o.customStatus !== 'cancelled').length;
    
    // Consultations (bookings)
    const consultations = await Booking.find({});
    const totalConsultations = consultations.length;
    const pendingConsultations = consultations.filter(b => b.status === 'scheduled').length;
    const consultationRevenue = consultations.reduce((sum, b) => sum + (b.price || 0), 0);
    
    // Customers
    const totalCustomers = await User.countDocuments();
    
    // Products
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10, $gt: 0 } });
    
    // Monthly revenue (last 12 months)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthOrders = await Order.find({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      const monthConsultations = await Booking.find({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      const revenue = monthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0) +
                      monthConsultations.reduce((s, b) => s + (b.price || 0), 0);
      monthlyRevenue.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        revenue
      });
    }
    
    // Consultation trends (last 12 months)
    const consultationTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const count = await Booking.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      consultationTrends.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        count
      });
    }
    
    // Order status distribution
    const orderStatusCounts = {
      delivered: await Order.countDocuments({ customStatus: 'completed' }),
      inTransit: await Order.countDocuments({ customStatus: { $in: ['kit_dispatched', 'pickup_initiated', 'sample_picked_up'] } }),
      pending: await Order.countDocuments({ customStatus: { $nin: ['completed', 'cancelled'] } }),
      cancelled: await Order.countDocuments({ customStatus: 'cancelled' }),
      rto: await Order.countDocuments({ customStatus: 'rto' })
    };
    
    // Conversion rate (percentage of users who placed at least one order)
    const usersWithOrders = await Order.distinct('userId');
    const conversionRate = totalCustomers ? (usersWithOrders.length / totalCustomers * 100).toFixed(1) : 0;
    
    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');
    
    // Recent consultations (last 5)
    const recentConsultations = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');
    
    res.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalConsultations,
        consultationRevenue,
        totalCustomers,
        totalProducts,
        pendingOrders,
        pendingConsultations,
        lowStockProducts,
        conversionRate
      },
      charts: {
        monthlyRevenue,
        consultationTrends,
        orderStatusCounts
      },
      recent: {
        orders: recentOrders,
        consultations: recentConsultations
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};