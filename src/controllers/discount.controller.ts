import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createDiscount = async (req: Request, res: Response) => {
  const { courseId, percent, validUntil } = req.body;
  const data: any = { courseId, percent };
  if (validUntil) data.validUntil = new Date(validUntil);
  const discount = await prisma.discount.create({ data });
  res.status(201).json(discount);
};

export const updateDiscount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { percent, validUntil } = req.body;
  const data: any = {};
  if (percent !== undefined) data.percent = percent;
  if (validUntil !== undefined) data.validUntil = new Date(validUntil);
  const discount = await prisma.discount.update({
    where: { id },
    data,
  });
  res.json(discount);
};

export const deleteDiscount = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.discount.delete({ where: { id } });
  res.status(204).send();
};
