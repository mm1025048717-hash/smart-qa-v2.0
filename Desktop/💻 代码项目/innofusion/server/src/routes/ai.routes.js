import { Router } from 'express';
import { getSuggestions } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// @route   POST api/ai/suggest
// @desc    Get AI suggestions for bubble fusion
// @access  Private
router.post('/suggest', protect, getSuggestions);

export default router;
