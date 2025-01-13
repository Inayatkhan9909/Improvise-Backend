import express from "express";
import { isApprovedInstructor } from "../Middlewares/authorize";
import {createCourse,getAllCourses} from '../Controllers/coursesController'
import { deleteCourse } from "../Controllers/coursesController";
import { updateCourse } from "../Controllers/coursesController";

const router = express.Router();

router.post("/create-course", isApprovedInstructor, createCourse);
 router.put("/update-course", isApprovedInstructor, updateCourse);
 router.delete("/delete-course/:courseId", isApprovedInstructor, deleteCourse);
 router.get("/getallcourses", getAllCourses);


export default router;