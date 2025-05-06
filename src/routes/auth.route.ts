import { Router } from "express";
import asyncHandler from 'express-async-handler';
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', asyncHandler(register));
router.get('/verify', asyncHandler(verifyEmail));
router.post('/resend-verification', asyncHandler(resendVerification));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));

export default router;
