"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const discount_middleware_1 = require("../middlewares/discount.middleware");
const discount_controller_1 = require("../controllers/discount.controller");
const discount_schema_1 = require("../schemas/discount.schema");
const router = (0, express_1.Router)();
// All discount routes require authentication + per-course/instructor-or-admin check
router.use(auth_middleware_1.isAuthenticated);
router.post('/', (0, validateRequest_1.default)({ body: discount_schema_1.createDiscountSchema }), discount_middleware_1.canManageDiscount, discount_controller_1.createDiscount);
router.patch('/:id', (0, validateRequest_1.default)({ params: discount_schema_1.discountParamSchema, body: discount_schema_1.updateDiscountSchema }), discount_middleware_1.canManageDiscount, discount_controller_1.updateDiscount);
router.delete('/:id', (0, validateRequest_1.default)({ params: discount_schema_1.discountParamSchema }), discount_middleware_1.canManageDiscount, discount_controller_1.deleteDiscount);
exports.default = router;
