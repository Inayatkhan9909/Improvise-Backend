"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorize_1 = require("../Middlewares/authorize");
const adminController_1 = require("../Controllers/adminController");
const adminController_2 = require("../Controllers/adminController");
const adminController_3 = require("../Controllers/adminController");
const router = express_1.default.Router();
router.get("/getallinstructors", authorize_1.isAdminUser, adminController_1.getAllInstructors);
router.put("/approve-instructor", authorize_1.isAdminUser, adminController_2.approveInstructor);
router.put("/reject-instructor", authorize_1.isAdminUser, adminController_3.rejectInstructor);
router.put("/remove-instructor", authorize_1.isAdminUser, adminController_3.rejectInstructor);
exports.default = router;
