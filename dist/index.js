"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./Routes/authRoutes"));
const instructorRoutes_1 = __importDefault(require("./Routes/instructorRoutes"));
const classRoutes_1 = __importDefault(require("./Routes/classRoutes"));
const adminRoutes_1 = __importDefault(require("./Routes/adminRoutes"));
const courseRoutes_1 = __importDefault(require("./Routes/courseRoutes"));
const removeUnverifedUsers_1 = __importDefault(require("./CronJobs/removeUnverifedUsers"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 2000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, removeUnverifedUsers_1.default)();
const router = express_1.default.Router();
app.use("/auth", authRoutes_1.default);
app.use("/instructor", instructorRoutes_1.default);
app.use('/classes', classRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/courses", courseRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
