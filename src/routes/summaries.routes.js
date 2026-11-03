import { Router } from 'express';
import { createSummary, getSummary, updateSaved } from '../controllers/summaries.controller.js';
const router = Router();
router.post('/', createSummary);
router.get('/:id', getSummary);
router.patch('/:id/save', updateSaved);
export default router;