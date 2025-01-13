import express from "express";
import { isApprovedInstructor } from "../Middlewares/authorize";
import {createCourse,getAllCourses} from '../Controllers/CoursecControllers/CreateCourse'
import { deleteCourse } from "../Controllers/CoursecControllers/deleteCourseController";
import { updateCourse } from "../Controllers/CoursecControllers/updateCourseController";

const router = express.Router();

router.post("/create-course", isApprovedInstructor, createCourse);
 router.put("/update-course", isApprovedInstructor, updateCourse);
 router.delete("/delete-course/:courseId", isApprovedInstructor, deleteCourse);
 router.get("/getallcourses", getAllCourses);


export default router;