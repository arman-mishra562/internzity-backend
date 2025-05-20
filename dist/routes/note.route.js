"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const note_controller_1 = require("../controllers/note.controller");
const note_schema_1 = require("../schemas/note.schema");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ body: note_schema_1.createNoteSchema }), note_controller_1.createNote);
router.get('/lecture/:lectureId', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ params: note_schema_1.lectureParamsSchema }), note_controller_1.listNotesForLecture);
router.get('/my', auth_middleware_1.isAuthenticated, note_controller_1.listNotesForUser);
exports.default = router;
