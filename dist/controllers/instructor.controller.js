"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyInstructor = void 0;
const instructor_service_1 = require("../services/instructor.service");
const applyInstructor = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const instructor = await instructor_service_1.instructorService.apply(req.user.id, req.body);
        res.status(201).json({ message: "Application submitted", data: instructor });
    }
    catch (error) {
        next(error);
    }
};
exports.applyInstructor = applyInstructor;
