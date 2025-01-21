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
exports.isStudent = exports.autheticate = void 0;
const db_1 = __importDefault(require("../Config/db"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const firebaseConfig_1 = require("../Config/firebaseConfig");
const autheticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "InstructorId is required." });
    }
    try {
        const userId = token.split(' ')[1];
        const decodedToken = yield firebaseConfig_1.firebaseAuth.verifyIdToken(userId);
        const { uid } = decodedToken;
        yield (0, db_1.default)();
        const isUser = yield UserModel_1.default.find({ firebaseUid: uid });
        if (!isUser) {
            return res.status(401).json({ message: "User not found" });
        }
        req.body.user = isUser;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
exports.autheticate = autheticate;
const isStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "userId is required." });
    }
    try {
        const userId = token.split(' ')[1];
        const decodedToken = yield firebaseConfig_1.firebaseAuth.verifyIdToken(userId);
        const { uid } = decodedToken;
        yield (0, db_1.default)();
        const isUser = yield UserModel_1.default.findOne({ firebaseUid: uid });
        if (!isUser) {
            return res.status(401).json({ message: "User not found" });
        }
        const student = (_a = isUser === null || isUser === void 0 ? void 0 : isUser.role) === null || _a === void 0 ? void 0 : _a.includes('student');
        if (!student) {
            return res.status(403).json({ message: "User is not an student." });
        }
        req.body.user = isUser;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
exports.isStudent = isStudent;
