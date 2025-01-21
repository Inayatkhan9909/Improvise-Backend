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
exports.CancelUserCourseBooking = exports.getUserBookedCourses = exports.BookCourse = exports.updateCourse = exports.deleteCourse = exports.getAllCourses = exports.createCourse = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const db_1 = __importDefault(require("../Config/db"));
const CourseModel_1 = __importDefault(require("../Models/CourseModel"));
const nodemailerConfig_1 = __importDefault(require("../Config/nodemailerConfig"));
require('dotenv').config();
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { title, description, price, date, timing, duration, maxStudents, category, level, thumbnail, } = req.body;
        const instructor = req.body.user._id;
        const instructorname = req.body.user.name;
        const instructorprofile = req.body.profilePic;
        if (!title ||
            !description ||
            !price ||
            !date ||
            !timing ||
            !duration ||
            !maxStudents ||
            !category ||
            !level ||
            !thumbnail) {
            return res.status(400).json({ message: "All credentials are required!" });
        }
        if (!instructor) {
            return res.status(400).json({ message: "Invalid Instructor!" });
        }
        yield (0, db_1.default)();
        // Create new class document
        const newCourse = new CourseModel_1.default({
            title,
            description,
            instructor,
            instructorname,
            instructorprofile,
            price,
            date,
            timing,
            duration,
            maxStudents,
            category,
            level,
            thumbnail,
        });
        // Save the class in the database
        const savedCourse = yield newCourse.save({ session });
        // Update instructor details in the User collection
        const updatedInstructor = yield UserModel_1.default.findByIdAndUpdate(instructor, {
            $push: {
                "roleDetails.instructor.courseCreated": {
                    courseId: savedCourse._id,
                    title: savedCourse.title,
                    date: savedCourse.date,
                    price: savedCourse.price,
                    maxStudents: savedCourse.maxStudents,
                    category: savedCourse.category,
                    level: savedCourse.level,
                    thumbnail: savedCourse.thumbnail,
                },
            },
        }, { new: true, session });
        if (!updatedInstructor) {
            throw new Error("Failed to update instructor details");
        }
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            message: "Class created successfully",
            course: savedCourse,
            instructor: updatedInstructor,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to create class" });
    }
});
exports.createCourse = createCourse;
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        const courses = yield CourseModel_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch classes" });
    }
});
exports.getAllCourses = getAllCourses;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required!" });
        }
        yield (0, db_1.default)();
        // Find the class
        const courseToDelete = yield CourseModel_1.default.findById(courseId).session(session);
        if (!courseToDelete) {
            return res.status(404).json({ message: "Class not found!" });
        }
        // Remove class reference from instructor's details
        const instructorId = courseToDelete.instructor;
        const updatedInstructor = yield UserModel_1.default.findByIdAndUpdate(instructorId, {
            $pull: { "roleDetails.instructor.classesCreated": { courseId } },
        }, { session, new: true });
        if (!updatedInstructor) {
            throw new Error("Failed to update instructor details");
        }
        // Get the list of enrolled students
        const enrolledStudents = courseToDelete.studentsEnrolled || [];
        // Send email notifications to students
        if (enrolledStudents.length > 0) {
            const studentEmails = enrolledStudents.map((student) => student.email);
            const mailOptions = {
                from: process.env.EMAIL,
                to: studentEmails,
                subject: `Class Cancellation Notification: ${courseToDelete.title}`,
                html: `
            <p>Dear Student,</p>
            <p>We regret to inform you that the class <strong>${courseToDelete.title}</strong> has been canceled.</p>
            <p>If you have any questions or concerns, please contact us.</p>
            <p>Best regards,<br>Your Team</p>
          `,
            };
            yield nodemailerConfig_1.default.sendMail(mailOptions);
        }
        // Delete the class
        yield CourseModel_1.default.findByIdAndDelete(courseId).session(session);
        // Commit the transaction
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            message: "Class deleted successfully",
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete class",
        });
    }
});
exports.deleteCourse = deleteCourse;
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { courseId, title, description, date, timing, duration, price, maxStudents, category, level, thumbnail, } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required!" });
        }
        if (!title ||
            !description ||
            !date ||
            !timing ||
            !duration ||
            !price ||
            !maxStudents ||
            !category ||
            !level ||
            !thumbnail) {
            return res.status(400).json({ message: "All credentials are required!" });
        }
        yield (0, db_1.default)();
        // Check if the class exists
        const existingCourse = yield CourseModel_1.default.findById(courseId).session(session);
        if (!existingCourse) {
            return res.status(404).json({ message: "Course not found!" });
        }
        const originalCourse = existingCourse.toObject();
        const updatedCourse = yield CourseModel_1.default.findByIdAndUpdate(courseId, {
            title,
            description,
            date,
            timing,
            duration,
            price,
            maxStudents,
            category,
            level,
            thumbnail,
        }, { new: true, session });
        if (!updatedCourse) {
            throw new Error("Failed to update class details");
        }
        // Update instructor's class details
        const instructorId = updatedCourse.instructor;
        const updatedInstructor = yield UserModel_1.default.findByIdAndUpdate(instructorId, {
            $set: {
                "roleDetails.instructor.classesCreated.$[class]": {
                    courseId: updatedCourse._id,
                    title: updatedCourse.title,
                    date: updatedCourse.date,
                    timing: updatedCourse.price,
                    maxStudents: updatedCourse.maxStudents,
                    category: updatedCourse.category,
                    level: updatedCourse.level,
                    thumbnail: updatedCourse.thumbnail,
                },
            },
        }, {
            new: true,
            arrayFilters: [{ "class.classId": courseId }],
            session,
        });
        if (!updatedInstructor) {
            throw new Error("Failed to update instructor details");
        }
        if (originalCourse.studentsEnrolled && originalCourse.studentsEnrolled.length > 0) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: originalCourse.studentsEnrolled.map((student) => student.email), // Get emails of all booked students
                subject: `Course Update: ${title}`,
                html: `
            <p>Dear Student,</p>
            <p>The corse you booked has been updated. Below are the updated details:</p>
            <ul>
              <li><strong>Title:</strong> ${title}</li>
              <li><strong>Description:</strong> ${description}</li>
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Duration:</strong> ${duration} minutes</li>
              <li><strong>Category:</strong> ${category}</li>
              <li><strong>Level:</strong> ${level}</li>
            </ul>
            <p>Please check the updated details in your dashboard.</p>
            <p>Best regards,<br>Your Team</p>
          `,
            };
            yield nodemailerConfig_1.default.sendMail(mailOptions);
        }
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            updatedCourse,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update class" });
    }
});
exports.updateCourse = updateCourse;
const BookCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    try {
        const { courseId } = req.body;
        const user = (_a = req.body) === null || _a === void 0 ? void 0 : _a.user;
        if (!courseId || !user) {
            return res.status(400).json({ message: "Course ID and user details are required!" });
        }
        yield (0, db_1.default)();
        session.startTransaction();
        const existingCourse = yield CourseModel_1.default.findById(courseId).session(session);
        if (!existingCourse) {
            return res.status(404).json({ message: "Course not found!" });
        }
        if (existingCourse.studentsEnrolled.includes(user._id)) {
            return res.status(400).json({ message: "User is already enrolled in this course." });
        }
        existingCourse.studentsEnrolled.push(user._id);
        yield existingCourse.save({ session });
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(user._id, {
            $push: { "roleDetails.student.enrolledCourses": courseId },
        }, { new: true, session });
        if (!updatedUser) {
            throw new Error("Failed to update user details");
        }
        yield session.commitTransaction();
        const mailOptions = {
            from: process.env.EMAIL,
            to: updatedUser.email,
            subject: "Course Booking Confirmation",
            html: `
          <p>Dear ${updatedUser.name},</p>
          <p>Thank you for booking a class!</p>
          <p>Here are the details of your booking:</p>
          <ul>
            <li><strong>Course:</strong> ${existingCourse.title}</li>
            <li><strong>Date:</strong> ${existingCourse.date.toDateString()}<ourse
          </ul>
          <p>We look forward to seeing you there!</p>
          <p>Best regards,</p>
          <p>Your Team</p>
        `,
        };
        yield nodemailerConfig_1.default.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: "Course booked successfully and confirmation email sent.",
        });
    }
    catch (error) {
        console.error(error);
        yield session.abortTransaction();
        res.status(500).json({ success: false, message: "Failed to book course", error: error });
    }
    finally {
        session.endSession();
    }
});
exports.BookCourse = BookCourse;
const getUserBookedCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = yield req.body.user._id;
        if (!userId) {
            res.status(400).json({ message: "Id not found" });
        }
        yield (0, db_1.default)();
        const courses = yield CourseModel_1.default.find({ studentsEnrolled: userId });
        if (!courses) {
            res.status(400).json({ message: "Courses not found" });
        }
        res.status(200).json({ message: "courses found", courses });
    }
    catch (error) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});
exports.getUserBookedCourses = getUserBookedCourses;
const CancelUserCourseBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    try {
        const { courseId } = req.params;
        const user = (_a = req.body) === null || _a === void 0 ? void 0 : _a.user;
        if (!courseId || !user) {
            return res.status(400).json({ message: "Course ID and user details are required!" });
        }
        yield (0, db_1.default)();
        session.startTransaction();
        // Check if the class exists
        const existingCourse = yield CourseModel_1.default.findById(courseId).session(session);
        if (!existingCourse) {
            return res.status(404).json({ message: "Course not found!" });
        }
        // Check if the user is enrolled in the class
        const isEnrolled = existingCourse.studentsEnrolled.includes(user._id);
        if (!isEnrolled) {
            return res.status(400).json({ message: "User is not enrolled in this class." });
        }
        // Remove user from class's enrolled students
        existingCourse.studentsEnrolled = existingCourse.studentsEnrolled.filter((studentId) => studentId.toString() !== user._id.toString());
        yield existingCourse.save({ session });
        // Remove class from user's enrolled classes
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(user._id, {
            $pull: { "roleDetails.student.enrolledClasses": courseId },
        }, { new: true, session });
        if (!updatedUser) {
            throw new Error("Failed to update user details");
        }
        // Send cancellation email to the user
        const mailOptions = {
            from: process.env.EMAIL,
            to: updatedUser.email,
            subject: "Course Booking Cancellation",
            html: `
        <p>Dear ${updatedUser.name},</p>
        <p>Your booking for the course <strong>${existingCourse.title}</strong> has been successfully canceled.</p>
        <p>If this was a mistake, feel free to book the course again at your convenience.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
      `,
        };
        yield nodemailerConfig_1.default.sendMail(mailOptions);
        yield session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Course booking canceled successfully and confirmation email sent.",
        });
    }
    catch (error) {
        console.error(error);
        yield session.abortTransaction();
        res.status(500).json({ success: false, message: "Failed to cancel course booking", error });
    }
    finally {
        session.endSession();
    }
});
exports.CancelUserCourseBooking = CancelUserCourseBooking;
