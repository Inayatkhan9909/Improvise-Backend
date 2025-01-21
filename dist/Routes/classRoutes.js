"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classesController_1 = require("../Controllers/classesController");
const authorize_1 = require("../Middlewares/authorize");
const classesController_2 = require("../Controllers/classesController");
const classesController_3 = require("../Controllers/classesController");
const authenticate_1 = require("../Middlewares/authenticate");
const classesController_4 = require("../Controllers/classesController");
const router = express_1.default.Router();
router.post("/createclass", authorize_1.isApprovedInstructor, classesController_1.createClass);
router.post("/update-class", authorize_1.isApprovedInstructor, classesController_2.updateClass);
router.delete("/delete-class/:classId", authorize_1.isApprovedInstructor, classesController_3.deleteClass);
router.delete("/cancel-user-classbooking/:classId", authenticate_1.isStudent, classesController_1.CancelUserClassBooking);
router.put("/bookclass", authenticate_1.isStudent, classesController_4.BookClass);
router.get("/getallclasses", classesController_1.getAllClasses);
router.get("/get-userbooked-classes", authenticate_1.isStudent, classesController_1.getUserBookedClasses);
exports.default = router;
