import express from 'express';
import { getAllOrders, updateOrderStatus } from '../Controllers/OrderController.js';
import { adminLogin, getAdminProfile, resetAdminPassword } from '../Controllers/adminController.js';
import { adminAuth } from '../Middleware/adminAuth.js';
const router = express.Router();


router.post('/login', adminLogin);
router.post('/reset-password', resetAdminPassword);
router.get('/profile', adminAuth, getAdminProfile);
router.get('/orders', adminAuth, getAllOrders);
router.put('/:orderId/status', adminAuth, updateOrderStatus);


export default router;