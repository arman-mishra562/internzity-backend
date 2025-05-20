"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscount = exports.updateDiscount = exports.createDiscount = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createDiscount = async (req, res) => {
    const { courseId, percent, validUntil } = req.body;
    const data = { courseId, percent };
    if (validUntil)
        data.validUntil = new Date(validUntil);
    const discount = await prisma_1.default.discount.create({ data });
    res.status(201).json(discount);
};
exports.createDiscount = createDiscount;
const updateDiscount = async (req, res) => {
    const { id } = req.params;
    const { percent, validUntil } = req.body;
    const data = {};
    if (percent !== undefined)
        data.percent = percent;
    if (validUntil !== undefined)
        data.validUntil = new Date(validUntil);
    const discount = await prisma_1.default.discount.update({
        where: { id },
        data,
    });
    res.json(discount);
};
exports.updateDiscount = updateDiscount;
const deleteDiscount = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.discount.delete({ where: { id } });
    res.status(204).send();
};
exports.deleteDiscount = deleteDiscount;
