"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectInstructor = exports.getAllInstructors = exports.approveInstructor = void 0;
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const db_1 = __importDefault(require("../Config/db"));
const nodemailerConfig_1 = __importDefault(require("../Config/nodemailerConfig"));
const approveInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { instructorId } = req.body;
    try {
        if (!instructorId) {
            return res.status(400).json({ message: "InstructorId required" });
        }
        yield (0, db_1.default)();
        const user = yield UserModel_1.default.findById(instructorId);
        if (!user) {
            return res.status(400).json({ message: "Instructor not found" });
        }
        if (user.roleDetails && user.roleDetails.instructor) {
            user.roleDetails.instructor.approvedByAdmin = true;
            yield user.save();
            const mailOptions = {
                from: process.env.EMAIL,
                to: user === null || user === void 0 ? void 0 : user.email,
                subject: "Approval as Instructor at Improvise",
                html: `
                    <p>Congratulations ${user === null || user === void 0 ? void 0 : user.name},</p>
                    <p>You have been approved as a Instructor at Improvise. Now you can take class at our platform.</p>
                    <p>Thank You</p>
                    
                `,
            };
            yield nodemailerConfig_1.default.sendMail(mailOptions);
            return res.status(200).json({ message: "Instructor approved successfully." });
        }
        else {
            return res.status(400).json({ message: "Instructor role details not found." });
        }
    }
    catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
exports.approveInstructor = approveInstructor;
const getAllInstructors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        const instructors = yield UserModel_1.default.find({ role: "instructor" });
        if (instructors.length === 0) {
            return res.status(404).json({ message: "No instructors found." });
        }
        return res.status(200).json(instructors);
    }
    catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
exports.getAllInstructors = getAllInstructors;
const rejectInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { instructorId, reason } = req.body;
    console.log(instructorId);
    console.log(reason);
    try {
        if (!instructorId || !reason) {
            return res.status(400).json({ message: "InstructorId required" });
        }
        yield (0, db_1.default)();
        const user = yield UserModel_1.default.findById(instructorId);
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: "Instructor not found" });
        }
        if (user.roleDetails && user.roleDetails.instructor) {
            user.roleDetails.instructor.approvedByAdmin = false;
            yield user.save();
            const mailOptions = {
                from: process.env.EMAIL,
                to: user === null || user === void 0 ? void 0 : user.email,
                subject: "Approval status as Instructor at Improvise",
                html: `
                    <p>Hii ${user === null || user === void 0 ? void 0 : user.name},</p>
                    <p>We have received you applicaiton to be an instructor at Improvise but we are sorry to say that you are not been seleted for this role.</p>
                    <p>Reason for rejecting you:</p>
                    <p>${reason}</p>
                    <p>Thank You</p>

   
                `,
            };
            yield nodemailerConfig_1.default.sendMail(mailOptions);
            return res.status(200).json({ message: "Instructor approved successfully." });
        }
        else {
            return res.status(400).json({ message: "Instructor role details not found." });
        }
    }
    catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
exports.rejectInstructor = rejectInstructor;
