"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const instructor_route_1 = __importDefault(require("./routes/instructor.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const module_route_1 = __importDefault(require("./routes/module.route"));
const lecture_route_1 = __importDefault(require("./routes/lecture.route"));
const assignment_route_1 = __importDefault(require("./routes/assignment.route"));
const note_route_1 = __importDefault(require("./routes/note.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const discount_route_1 = __importDefault(require("./routes/discount.route"));
const home_route_1 = __importDefault(require("./routes/home.route"));
const streak_route_1 = __importDefault(require("./routes/streak.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});
app.use('/api/auth', auth_route_1.default);
app.use('/api/admin', admin_route_1.default);
app.use("/api/instructor", instructor_route_1.default);
app.use('/api/courses', course_route_1.default);
app.use("/api/modules", module_route_1.default);
app.use("/api/lectures", lecture_route_1.default);
app.use('/api/assignments', assignment_route_1.default);
app.use('/api/notes', note_route_1.default);
app.use('/api/payments', payment_route_1.default);
app.use('/api/discounts', discount_route_1.default);
app.use('/api/home', home_route_1.default);
app.use('/api/user/streak', streak_route_1.default);
// ——— 404 Handler ———
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// ——— Global Error Handler———
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
