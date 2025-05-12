import { NextFunction, Request, Response } from "express";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import instructorRoutes from "./routes/instructor.route";
import courseRoutes from './routes/course.route';
import moduleRoutes from "./routes/module.route";
import lectureRoutes from "./routes/lecture.route";
import assignmentRoutes from './routes/assignment.route';
import noteRoutes from './routes/note.route';
import paymentRoutes from './routes/payment.route';
import discountRoutes from './routes/discount.route';
import homeRoutes from './routes/home.route';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/lectures", lectureRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/home', homeRoutes);

// ——— 404 Handler ———
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ——— Global Error Handler———
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

