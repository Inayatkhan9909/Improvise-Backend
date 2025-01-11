import express from "express";
import {addInstructorDetails} from '../Controllers/InstructorController/instructorDetailsController'
import { isInstructor } from "../Middlewares/authorize";
import { getInstructorClasses } from "../Controllers/InstructorController/getInstructorClasses";

const router = express.Router();

router.post("/addinstructordetails",isInstructor,addInstructorDetails);
router.get("/get-instructor-classes",isInstructor,getInstructorClasses);


export default router;