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
exports.deleteUser = exports.editUserDetails = exports.editUserEmail = exports.editUserPassword = exports.editUserProfilePic = exports.Login = exports.Signup = void 0;
const auth_1 = require("firebase-admin/auth");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const firebaseConfig_1 = require("../Config/firebaseConfig");
const db_1 = __importDefault(require("../Config/db"));
const nodemailerConfig_1 = __importDefault(require("../Config/nodemailerConfig"));
require('dotenv').config();
const Signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, contact, role, dob, gender } = req.body;
    try {
        if (!email || !password || !name || !contact || !role || !dob || !gender) {
            return res.status(400).json({ message: 'All credentials are required!' });
        }
        yield (0, db_1.default)();
        const existingUserDb = yield UserModel_1.default.findOne({ email });
        if (existingUserDb) {
            return res.status(400).json({ message: 'Email is already registered!' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters containing mix characters.' });
        }
        const firebaseUser = yield firebaseConfig_1.firebaseAuth.createUser({
            email,
            password,
            displayName: name,
        });
        if (!firebaseUser) {
            return res.status(400).json({ message: 'Signup failed! Try again.' });
        }
        const emailVerificationLink = yield firebaseConfig_1.firebaseAuth.generateEmailVerificationLink(email);
        if (!emailVerificationLink) {
            return res.status(400).json({ message: 'Email not found' });
        }
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Your Email Address",
            html: `
                <p>Hi ${name},</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${emailVerificationLink}">Verify Email</a>
            `,
        };
        yield nodemailerConfig_1.default.sendMail(mailOptions);
        yield firebaseConfig_1.firebaseAuth.setCustomUserClaims(firebaseUser.uid, { role });
        const user = new UserModel_1.default({
            firebaseUid: firebaseUser.uid,
            email,
            name,
            contact,
            role,
            dob,
            gender,
        });
        yield user.save();
        return res.status(201).json({ message: "User registered successfully!", user });
    }
    catch (error) {
        console.error(error);
        const err = error;
        return res.status(500).json({ message: "Registration failed.", error: err.message });
    }
});
exports.Signup = Signup;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        if (!token) {
            return res.status(400).json({ message: "Authentication token is required." });
        }
        const decodedToken = yield firebaseConfig_1.firebaseAuth.verifyIdToken(token);
        const { uid } = decodedToken;
        yield (0, db_1.default)();
        const user = yield UserModel_1.default.findOne({ firebaseUid: uid });
        if (!user) {
            return res.status(404).json({ message: "User not found in the database." });
        }
        return res.status(200).json({ message: "Login successful!", user });
    }
    catch (error) {
        console.error("Login Error:", error);
        const err = error;
        return res.status(500).json({ message: "Login failed.", error: err.message });
    }
});
exports.Login = Login;
const editUserProfilePic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { profilePic } = yield req.body;
    try {
        if (!profilePic) {
            return res.status(400).json({ message: "Profile image required" });
        }
        const user = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user;
        const userId = user[0]._id;
        yield (0, db_1.default)();
        const isUser = yield UserModel_1.default.findById(userId);
        if (!isUser) {
            return res.status(400).json({ message: "User not found" });
        }
        isUser.profilePic = profilePic;
        yield isUser.save();
        return res.status(201).json({ message: "User Updated", user: isUser });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.editUserProfilePic = editUserProfilePic;
const editUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { oldPassword, newPassword } = req.body;
    const user = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user;
    const userUid = user[0].firebaseUid;
    try {
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required." });
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "New password cannot be the same as old password." });
        }
        const firebaseUser = yield firebaseConfig_1.firebaseAuth.getUser(userUid);
        // Update password
        yield firebaseConfig_1.firebaseAuth.updateUser(firebaseUser.uid, { password: newPassword });
        return res.status(200).json({ message: "Password updated successfully." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Password update failed.", error });
    }
});
exports.editUserPassword = editUserPassword;
const editUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { oldEmail, newEmail } = req.body;
    const user = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user;
    try {
        const userId = user[0]._id;
        if (!oldEmail || !newEmail) {
            return res.status(400).json({ message: "Both old and new emails are required." });
        }
        if (!userId) {
            return res.status(400).json({ message: "UserId not found." });
        }
        if (oldEmail === newEmail) {
            return res.status(400).json({ message: "New email cannot be the same as old email." });
        }
        yield (0, db_1.default)();
        const isUser = yield UserModel_1.default.findById(userId);
        if (!isUser) {
            return res.status(400).json({ message: "User not found." });
        }
        if (isUser.email !== oldEmail) {
            return res.status(400).json({ message: "Old email is incorrect." });
        }
        // Update email in Firebase Authentication
        const firebaseUser = yield firebaseConfig_1.firebaseAuth.getUserByEmail(oldEmail);
        if (!firebaseUser) {
            return res.status(404).json({ message: "User not found in Firebase Auth." });
        }
        yield firebaseConfig_1.firebaseAuth.updateUser(firebaseUser.uid, { email: newEmail });
        // Update email in MongoDB
        isUser.email = newEmail;
        yield isUser.save();
        // Generate verification link for new email
        const emailVerificationLink = yield firebaseConfig_1.firebaseAuth.generateEmailVerificationLink(newEmail);
        if (!emailVerificationLink) {
            return res.status(400).json({ message: "Failed to generate email verification link." });
        }
        // Send verification email
        const mailOptions = {
            from: process.env.EMAIL,
            to: newEmail,
            subject: "Verify Your Email Address",
            html: `
                <p>Hi ${isUser.name},</p>
                <p>Please verify your new email address by clicking the link below:</p>
                <a href="${emailVerificationLink}">Verify Email</a>
            `,
        };
        yield nodemailerConfig_1.default.sendMail(mailOptions);
        return res.status(201).json({ message: "Email updated successfully. Verification email sent.", user: isUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Email update failed.", error });
    }
});
exports.editUserEmail = editUserEmail;
const editUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, dob, gender, contact } = yield req.body;
        const user = yield ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user);
        const userId = user[0]._id;
        if (!name || !dob || !gender || !contact) {
            return res.status(400).json({ message: "All Credentials Required" });
        }
        if (!userId) {
            return res.status(400).json({ message: "UserId not found" });
        }
        yield (0, db_1.default)();
        const isUser = yield UserModel_1.default.findById(userId);
        if (!isUser) {
            return res.status(400).json({ message: "User not found" });
        }
        isUser.name = name;
        isUser.dob = dob;
        isUser.gender = gender;
        isUser.contact = contact;
        yield isUser.save();
        return res.status(201).json({ message: "User Updated", user: isUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Update failed.", error });
    }
});
exports.editUserDetails = editUserDetails;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user;
        if (!user || user.length === 0) {
            return res.status(400).json({ message: "User details are required" });
        }
        const userUid = user[0].firebaseUid;
        yield (0, auth_1.getAuth)().deleteUser(userUid);
        const result = yield UserModel_1.default.findOneAndDelete({ firebaseUid: userUid });
        if (!result) {
            return res.status(404).json({ message: "User not found in MongoDB" });
        }
        return res.status(201).json({ message: "User successfully deleted from both Firebase and MongoDB" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});
exports.deleteUser = deleteUser;
