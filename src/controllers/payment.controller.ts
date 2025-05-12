import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';

export const createRazorpayOrder = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const order = await paymentService.createRazorpayOrder(courseId);
  res.json(order);
};

export const captureRazorpayPayment = async (req: Request, res: Response) => {
  const { paymentId, orderId } = req.body;
  await paymentService.captureRazorpayPayment(orderId, paymentId);
  res.json({ success: true });
};

export const createPayPalOrder = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const order = await paymentService.createPayPalOrder(courseId);
  res.json(order);
};

export const capturePayPalOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const userId = (req as any).user.id;
  const courseId = req.params.courseId;
  const capture = await paymentService.capturePayPalOrder(orderId, userId, courseId);
  res.json(capture);
};

export const processGooglePay = async (req: Request, res: Response) => {
  const { paymentToken } = req.body;
  const userId = (req as any).user.id;
  const courseId = req.params.courseId;
  const result = await paymentService.processGooglePay(paymentToken, courseId, userId);
  res.json(result);
};
