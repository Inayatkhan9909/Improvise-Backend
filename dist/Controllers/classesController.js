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
exports.CancelUserClassBooking = exports.getUserBookedClasses = exports.BookClass = exports.updateClass = exports.deleteClass = exports.getAllClasses = exports.createClass = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ClassesModel_1 = __importDefault(require("../Models/ClassesModel"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const db_1 = __importDefault(require("../Config/db"));
const nodemailerConfig_1 = __importDefault(require("../Config/nodemailerConfig"));
const createClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { title, description, date, timing, duration, maxStudents, category, level, thumbnail, } = req.body;
        const instructor = req.body.user._id;
        const instructorname = req.body.user.name;
        const instructorprofile = req.body.user.profilePic;
        if (!title ||
            !description ||
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
        const newClass = new ClassesModel_1.default({
            title,
            description,
            instructor,
            instructorname,
            instructorprofile,
            date,
            timing,
            duration,
            maxStudents,
            category,
            level,
            thumbnail,
        });
        // Save the class in the database
        const savedClass = yield newClass.save({ session });
        // Update instructor details in the User collection
        const updatedInstructor = yield UserModel_1.default.findByIdAndUpdate(instructor, {
            $push: {
                "roleDetails.instructor.classesCreated": {
                    classId: savedClass._id,
                    title: savedClass.title,
                    date: savedClass.date,
                    timing: savedClass.timing,
                    maxStudents: savedClass.maxStudents,
                    category: savedClass.category,
                    level: savedClass.level,
                    thumbnail: savedClass.thumbnail,
                },
            },
        }, { new: true, session });
        if (!updatedInstructor) {
            throw new Error("Failed to update instructor details");
        }
        // Commit the transaction
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: savedClass,
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
exports.createClass = createClass;
const getAllClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        const classes = yield ClassesModel_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json({
            success: true,
            classes,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch classes" });
    }
});
exports.getAllClasses = getAllClasses;
const deleteClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { classId } = req.params;
        if (!classId) {
            return res.status(400).json({ message: "Class ID is required!" });
        }
        yield (0, db_1.default)();
        // Find the class
        const classToDelete = yield ClassesModel_1.default.findById(classId).session(session);
        if (!classToDelete) {
            return res.status(404).json({ message: "Class not found!" });
        }
        // Remove class reference from instructor's details
        const instructorId = classToDelete.instructor;
        const updatedInstructor = yield UserModel_1.default.findByIdAndUpdate(instructorId, {
            $pull: { "roleDetails.instructor.classesCreated": { classId } },
        }, { session, new: true });
        if (!updatedInstructor) {
            throw new Error("Failed to update instructor details");
        }
        // Get the list of enrolled students
        const enrolledStudents = classToDelete.bookedStudents || [];
        // Send email notifications to students
        if (enrolledStudents.length > 0) {
            const studentEmails = enrolledStudents.map((student) => student.email);
            const mailOptions = {
                from: process.env.EMAIL,
                to: studentEmails,
                subject: `Class Cancellation Notification: ${classToDelete.title}`,
                html: `
          <p>Dear Student,</p>
          <p>We regret to inform you that the class <strong>${classToDelete.title}</strong> has been canceled.</p>
          <p>If you have any questions or concerns, please contact us.</p>
          <p>Best regards,<br>Your Team</p>
        `,
            };
            yield nodemailerConfig_1.default.sendMail(mailOptions);
        }
        // Delete the class
        yield ClassesModel_1.default.findByIdAndDelete(classId).session(session);
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
exports.deleteClass = deleteClass;
const updateClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { classId, title, description, date, timing, duration, maxStudents, category, level, thumbnail, } = req.body;
        if (!classId) {
            return res.status(400).json({ message: "Class ID is required!" });
        }
        if (!title ||
            !description ||
            !date ||
            !timing ||
            !duration ||
            !maxStudents ||
            !category ||
            !level ||
            !thumbnail) {
            return res.status(400).json({ message: "All credentials are required!" });
        }
        yield (0, db_1.default)();
        // Check if the class exists
        const existingClass = yield ClassesModel_1.default.findById(classId).session(session);
        if (!existingClass) {
            return res.status(404).json({ message: "Class not found!" });
        }
        const originalClass = Object.assign({}, existingClass._doc);
        const updatedClass = yield ClassesModel_1.default.findByIdAndUpdate(classId, {
            title,
            description,
            date,
            timing,
            duration,
            maxStudents,
            category,
            level,
            thumbnail,
        }, { new: true, session });
        if (!updatedClass) {
            throw new Error("Failed to update class details");
        }
        // Update instructor's class details
        const instructorId = updatedClass.instructor;
        const updatedInstructor = yield UserModel_1.default.findByIdAndUpdate(instructorId, {
            $set: {
                "roleDetails.instructor.classesCreated.$[class]": {
                    classId: updatedClass._id,
                    title: updatedClass.title,
                    date: updatedClass.date,
                    timing: updatedClass.timing,
                    maxStudents: updatedClass.maxStudents,
                    category: updatedClass.category,
                    level: updatedClass.level,
                    thumbnail: updatedClass.thumbnail,
                },
            },
        }, {
            new: true,
            arrayFilters: [{ "class.classId": classId }],
            session,
        });
        if (!updatedInstructor) {
            throw new Error("Failed to update instructor details");
        }
        if (originalClass.bookedStudents && originalClass.bookedStudents.length > 0) {
            const mailOptions = {
                from: "your-email@gmail.com",
                to: originalClass.bookedStudents.map((student) => student.email), // Get emails of all booked students
                subject: `Class Update: ${title}`,
                html: `
            <p>Dear Student,</p>
            <p>The class you booked has been updated. Below are the updated details:</p>
            <ul>
              <li><strong>Title:</strong> ${title}</li>
              <li><strong>Description:</strong> ${description}</li>
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Timing:</strong> ${timing}</li>
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
            message: "Class updated successfully",
            updatedClass,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update class" });
    }
});
exports.updateClass = updateClass;
const BookClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    try {
        const { classId } = req.body;
        const user = (_a = req.body) === null || _a === void 0 ? void 0 : _a.user;
        if (!classId || !user) {
            return res.status(400).json({ message: "Class ID and user details are required!" });
        }
        yield (0, db_1.default)();
        session.startTransaction();
        const existingClass = yield ClassesModel_1.default.findById(classId).session(session);
        if (!existingClass) {
            return res.status(404).json({ message: "Class not found!" });
        }
        if (existingClass.enrolledStudents.includes(user._id)) {
            return res.status(400).json({ message: "User is already enrolled in this class." });
        }
        existingClass.enrolledStudents.push(user._id);
        yield existingClass.save({ session });
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(user._id, {
            $push: { "roleDetails.student.enrolledClasses": classId },
        }, { new: true, session });
        if (!updatedUser) {
            throw new Error("Failed to update user details");
        }
        yield session.commitTransaction();
        const mailOptions = {
            from: process.env.EMAIL,
            to: updatedUser.email,
            subject: "Class Booking Confirmation",
            html: `
          <p>Dear ${updatedUser.name},</p>
          <p>Thank you for booking a class!</p>
          <p>Here are the details of your booking:</p>
          <ul>
            <li><strong>Class:</strong> ${existingClass.title}</li>
            <li><strong>Date:</strong> ${existingClass.date.toDateString()}</li>
            <li><strong>Time:</strong> ${existingClass.timing}</li>
          </ul>
          <p>We look forward to seeing you there!</p>
          <p>Best regards,</p>
          <p>Your Team</p>
        `,
        };
        yield nodemailerConfig_1.default.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: "Class booked successfully and confirmation email sent.",
        });
    }
    catch (error) {
        console.error(error);
        yield session.abortTransaction();
        res.status(500).json({ success: false, message: "Failed to book class", error: error });
    }
    finally {
        session.endSession();
    }
});
exports.BookClass = BookClass;
const getUserBookedClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = yield req.body.user._id;
        if (!userId) {
            res.status(400).json({ message: "Id not found" });
        }
        yield (0, db_1.default)();
        const classes = yield ClassesModel_1.default.find({ enrolledStudents: userId });
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
exports.getUserBookedClasses = getUserBookedClasses;
const CancelUserClassBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    try {
        const { classId } = req.params;
        const user = (_a = req.body) === null || _a === void 0 ? void 0 : _a.user;
        if (!classId || !user) {
            return res.status(400).json({ message: "Class ID and user details are required!" });
        }
        yield (0, db_1.default)();
        session.startTransaction();
        // Check if the class exists
        const existingClass = yield ClassesModel_1.default.findById(classId).session(session);
        if (!existingClass) {
            return res.status(404).json({ message: "Class not found!" });
        }
        // Check if the user is enrolled in the class
        const isEnrolled = existingClass.enrolledStudents.includes(user._id);
        if (!isEnrolled) {
            return res.status(400).json({ message: "User is not enrolled in this class." });
        }
        // Remove user from class's enrolled students
        existingClass.enrolledStudents = existingClass.enrolledStudents.filter((studentId) => studentId.toString() !== user._id.toString());
        yield existingClass.save({ session });
        // Remove class from user's enrolled classes
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(user._id, {
            $pull: { "roleDetails.student.enrolledClasses": classId },
        }, { new: true, session });
        if (!updatedUser) {
            throw new Error("Failed to update user details");
        }
        // Send cancellation email to the user
        const mailOptions = {
            from: "your-email@example.com",
            to: updatedUser.email,
            subject: "Class Booking Cancellation",
            html: `
        <p>Dear ${updatedUser.name},</p>
        <p>Your booking for the class <strong>${existingClass.title}</strong> has been successfully canceled.</p>
        <p>If this was a mistake, feel free to book the class again at your convenience.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
      `,
        };
        yield nodemailerConfig_1.default.sendMail(mailOptions);
        yield session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Class booking canceled successfully and confirmation email sent.",
        });
    }
    catch (error) {
        console.error(error);
        yield session.abortTransaction();
        res.status(500).json({ success: false, message: "Failed to cancel class booking", error });
    }
    finally {
        session.endSession();
    }
});
exports.CancelUserClassBooking = CancelUserClassBooking;
