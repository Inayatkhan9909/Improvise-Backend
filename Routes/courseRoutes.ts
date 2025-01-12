import express from "express";
import { isApprovedInstructor } from "../Middlewares/authorize";
import {createCourse,getAllCourses} from '../Controllers/CoursecControllers/CreateCourse'

const router = express.Router();

router.post("/create-course", isApprovedInstructor, createCourse);
// router.post("/update-class", isApprovedInstructor, updateClass);
// router.delete("/delete-class/:classId", isApprovedInstructor, deleteClass);
 router.get("/getallcourses", getAllCourses);


export default router;