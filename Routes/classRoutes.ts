import express from "express";
import { getAllClasses, createClass, getUserBookedClasses, CancelUserClassBooking } from '../Controllers/classesController'
import { isApprovedInstructor } from "../Middlewares/authorize";
import { updateClass } from "../Controllers/classesController";
import { deleteClass } from "../Controllers/classesController";
import { isStudent } from "../Middlewares/authenticate";
import { BookClass } from "../Controllers/classesController";

const router = express.Router();

router.post("/createclass", isApprovedInstructor, createClass);
router.post("/update-class", isApprovedInstructor, updateClass);
router.delete("/delete-class/:classId", isApprovedInstructor, deleteClass);
router.delete("/cancel-user-classbooking/:classId",isStudent,CancelUserClassBooking);

router.put("/bookclass",isStudent,BookClass)
router.get("/getallclasses", getAllClasses);
router.get("/get-userbooked-classes",isStudent, getUserBookedClasses);


export default router;