import { Router } from 'express';
import { getStreak, updateStreak } from '../controllers/streak.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

// Protect both routes
router.get('/', isAuthenticated, getStreak);
router.post('/', isAuthenticated, updateStreak);

export default router;
