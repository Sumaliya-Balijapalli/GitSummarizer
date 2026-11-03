import { Router } from 'express';
import { getHistory, getSavedHistory, deleteHistory } from '../controllers/history.controller.js';
const router = Router();
router.get('/', getHistory);
router.get('/saved', getSavedHistory);
router.delete('/:id', deleteHistory);
export default router;