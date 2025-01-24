import express from "express";
import {addInstructorDetails} from '../Controllers/instructorController'
import { isApprovedInstructor, isInstructor } from "../Middlewares/authorize";
import { getInstructorClasses,getInstructorCourses } from "../Controllers/instructorController";

const router = express.Router();

router.post("/addinstructordetails",isInstructor,addInstructorDetails);
router.get("/get-instructor-classes",isApprovedInstructor,getInstructorClasses);
router.get("/get-instructor-courses",isApprovedInstructor,getInstructorCourses);


export default router;