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
exports.getInstructorCourses = exports.getInstructorClasses = exports.addInstructorDetails = void 0;
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const db_1 = __importDefault(require("../Config/db"));
const ClassesModel_1 = __importDefault(require("../Models/ClassesModel"));
const CourseModel_1 = __importDefault(require("../Models/CourseModel"));
const addInstructorDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { bio, qualifications, resume, skills } = req.body;
        const instructorId = req.body.user._id;
        if (!bio || !qualifications || !resume || !skills) {
            return res.status(400).json({ message: "All credentials are required!" });
        }
        if (!instructorId) {
            return res.status(400).json({ message: "User not found try again" });
        }
        const parsedSkills = Array.isArray(skills)
            ? skills
            : skills.split(",").map((skill) => skill.trim());
        yield (0, db_1.default)();
        const isUser = yield UserModel_1.default.findById(instructorId);
        if (!isUser) {
            return res.status(404).json({ message: "User not found." });
        }
        isUser.roleDetails.instructor = Object.assign(Object.assign({}, isUser.roleDetails.instructor), { bio,
            qualifications,
            resume, skills: parsedSkills, approvedByAdmin: ((_b = (_a = isUser.roleDetails) === null || _a === void 0 ? void 0 : _a.instructor) === null || _b === void 0 ? void 0 : _b.approvedByAdmin) || false, classesCreated: ((_d = (_c = isUser.roleDetails) === null || _c === void 0 ? void 0 : _c.instructor) === null || _d === void 0 ? void 0 : _d.classesCreated) || [], courseCreated: ((_f = (_e = isUser.roleDetails) === null || _e === void 0 ? void 0 : _e.instructor) === null || _f === void 0 ? void 0 : _f.courseCreated) || [] });
        yield isUser.save();
        res.status(201).json({ message: "Instructor details updated successfully.", isUser });
    }
    catch (error) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});
exports.addInstructorDetails = addInstructorDetails;
const getInstructorClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instructorId = yield req.body.user._id;
        if (!instructorId) {
            res.status(400).json({ message: "Id not found" });
        }
        yield (0, db_1.default)();
        const classes = yield ClassesModel_1.default.find({ instructor: instructorId });
        if (!classes) {
            res.status(400).json({ message: "Classes not found" });
        }
        res.status(200).json({ message: "classes found", classes });
    }
    catch (error) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});
exports.getInstructorClasses = getInstructorClasses;
const getInstructorCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instructorId = yield req.body.user._id;
        if (!instructorId) {
            res.status(400).json({ message: "Id not found" });
        }
        yield (0, db_1.default)();
        const courses = yield CourseModel_1.default.find({ instructor: instructorId });
        if (!courses) {
            res.status(400).json({ message: "Courses not found" });
        }
        res.status(200).json({ message: "Courses found", courses });
    }
    catch (error) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});
exports.getInstructorCourses = getInstructorCourses;
