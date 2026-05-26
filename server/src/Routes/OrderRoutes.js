import express from 'express';
import { createOrder, getOrders, getOrderById, trackUserOrder } from '../Controllers/OrderController.js';
import { authMiddleware} from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.get('/track/:shipmentId', authMiddleware, trackUserOrder);

export default router;