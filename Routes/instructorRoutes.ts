import express from "express";
import {addInstructorDetails} from '../Controllers/instructorController'
import { isInstructor } from "../Middlewares/authorize";
import { getInstructorClasses,getInstructorCourses } from "../Controllers/instructorController";

const router = express.Router();

router.post("/addinstructordetails",isInstructor,addInstructorDetails);
router.get("/get-instructor-classes",isInstructor,getInstructorClasses);
router.get("/get-instructor-courses",isInstructor,getInstructorCourses);


export default router;