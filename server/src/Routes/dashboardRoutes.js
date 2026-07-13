import express from 'express';
import { getDashboardStats } from '../Controllers/dashboardController.js';
import { adminAuth } from '../Middleware/adminAuth.js';

const router = express.Router();

router.get('/stats', adminAuth, getDashboardStats);

export default router;