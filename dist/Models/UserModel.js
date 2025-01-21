"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    firebaseUid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "instructor"], required: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    isAdmin: { type: Boolean, default: false },
    contact: { type: Number, required: true, unique: true },
    profilePic: {
        type: String,
        default: function () {
            if (this.gender === "male") {
                return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/677417160009f1f2f607/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
            }
            else if (this.gender === "female") {
                return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/677417530004c18adf84/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
            }
            else {
                return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/6774191d001f6dc31578/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
            }
        },
    },
    roleDetails: {
        instructor: {
            bio: { type: String },
            qualifications: { type: String },
            resume: { type: String },
            skills: [{ type: String }],
            approvedByAdmin: { type: Boolean, default: false },
            classesCreated: [
                {
                    classId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Class", required: true },
                    title: { type: String, required: true },
                    date: { type: String, required: true },
                    timing: { type: String, required: true },
                    maxStudents: { type: Number, required: true },
                    category: { type: String, required: true },
                    level: { type: String, required: true },
                    thumbnail: { type: String, required: true },
                },
            ],
            courseCreated: [
                {
                    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course", required: true },
                    title: { type: String, required: true },
                    date: { type: String, required: true },
                    maxStudents: { type: Number, required: true },
                    price: { type: Number, required: true },
                    modules: [
                        {
                            title: { type: String },
                            content: { type: String },
                            duration: { type: Number },
                        },
                    ],
                    category: { type: String, required: true },
                    level: { type: String, required: true },
                    thumbnail: { type: String, required: true },
                },
            ],
        },
        student: {
            enrolledClasses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Class" }],
            enrolledCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" }],
        },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
