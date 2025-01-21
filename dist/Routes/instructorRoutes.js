"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const instructorController_1 = require("../Controllers/instructorController");
const authorize_1 = require("../Middlewares/authorize");
const instructorController_2 = require("../Controllers/instructorController");
const router = express_1.default.Router();
router.post("/addinstructordetails", authorize_1.isInstructor, instructorController_1.addInstructorDetails);
router.get("/get-instructor-classes", authorize_1.isInstructor, instructorController_2.getInstructorClasses);
router.get("/get-instructor-courses", authorize_1.isInstructor, instructorController_2.getInstructorCourses);
exports.default = router;
