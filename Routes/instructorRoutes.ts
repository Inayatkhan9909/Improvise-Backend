import express from "express";
import {addInstructorDetails} from '../Controllers/InstructorController/instructorDetailsController'
import { isInstructor } from "../Middlewares/authorize";

const router = express.Router();

router.post("/addinstructordetails",isInstructor,addInstructorDetails)


export default router;