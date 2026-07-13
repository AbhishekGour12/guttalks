import express from 'express';
import { 
  generateSlots, 
  getAvailableSlots, 
  getAllSlots, 
  deleteSlot,
  deleteSlotsByDateRange,
  holdSlot, 
  releaseSlot, 
  getAvailableDates 
} from '../Controllers/availablityController.js';

import { adminAuth } from '../Middleware/adminAuth.js';

const router = express.Router();

router.post('/generate', adminAuth, generateSlots);
router.get('/slots', getAvailableSlots);
router.get('/admin/all', adminAuth, getAllSlots);
router.delete('/admin/slot/:id', adminAuth, deleteSlot);
router.delete('/admin/range', adminAuth, deleteSlotsByDateRange);
router.post('/hold-slot', holdSlot);
router.post('/release-slot', releaseSlot);
router.get('/available-dates', getAvailableDates);

export default router;