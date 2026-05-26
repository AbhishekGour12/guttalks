import express from 'express';
import { getAllOrders, updateOrderStatus } from '../Controllers/OrderController.js';
const router = express.Router();

router.get('/orders', getAllOrders )
router.put('/:orderId/status', updateOrderStatus );
export default router;