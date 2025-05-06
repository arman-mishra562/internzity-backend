import { Router } from "express";
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/logout', logout);

export default router;
