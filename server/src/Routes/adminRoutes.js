import express from 'express';
import { getAllOrders, updateOrderStatus } from '../Controllers/OrderController.js';
import { adminLogin, getAdminProfile, resetAdminPassword, adminForgotPassword } from '../Controllers/adminController.js';
import { adminAuth } from '../Middleware/adminAuth.js';
const router = express.Router();


import { getConsultationSettings, updateConsultationSettings } from '../Controllers/consultationSettingsController.js';

router.post('/login', adminLogin);
router.post('/forgot-password', adminForgotPassword);
router.post('/reset-password', resetAdminPassword);
router.get('/profile', adminAuth, getAdminProfile);
router.get('/orders', adminAuth, getAllOrders);
router.put('/:orderId/status', adminAuth, updateOrderStatus);
router.get('/consultation-settings', adminAuth, getConsultationSettings);
router.put('/consultation-settings', adminAuth, updateConsultationSettings);


export default router;