import { Request, Response, NextFunction} from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import transporter from '../config/mailer';
import { generateVerificationToken } from '../utils/generateVerificationToken';
import { generateVerificationEmail } from '../utils/emailTemplates';
import { generateAuthToken } from '../utils/token';
import { registerSchema, loginSchema, verifySchema, resendSchema } from '../schemas/auth.schema';

export const register = async (req: Request, res: Response, next: NextFunction ) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }
  const { name, email, password } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const token = generateVerificationToken(email);
  const expiry = new Date(Date.now() + 24 * 3600 * 1000);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, emailToken: token, emailTokenExpiry: expiry },
  });
  const link = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: `"InternZity" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email',
    html: generateVerificationEmail(link),
  });
  return res.status(201).json({ message: 'Registered! Please check your email.' });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const parse = verifySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }
  const { token } = parse.data;
  const user = await prisma.user.findFirst({ where: { emailToken: token } });
  if (!user || !user.emailTokenExpiry || user.emailTokenExpiry < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailToken: null, emailTokenExpiry: null },
  });
  return res.json({ message: 'Email verified successfully' });
};

export const resendVerification = async (req: Request, res: Response) => {
  const parse = resendSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }
  const { email } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.isEmailVerified) {
    return res.status(400).json({ error: 'Email already verified' });
  }
  const token = generateVerificationToken(email);
  const expiry = new Date(Date.now() + 24 * 3600 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { emailToken: token, emailTokenExpiry: expiry },
  });
  const link = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: `"InternZity" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Resend: Verify Your Email',
    html: generateVerificationEmail(link),
  });
  return res.json({ message: 'Verification email resent' });
};

export const login = async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!user.isEmailVerified) {
    return res.status(403).json({ error: 'Email not verified' });
  }
  const token = generateAuthToken(user.id);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
};

export const logout = async (_req: Request, res: Response) => {
  // stateless JWT: client should delete token
  return res.json({ message: 'Logged out. Discard your token.' });
};
