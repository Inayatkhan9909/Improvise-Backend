import express from "express";
import { isApprovedInstructor } from "../Middlewares/authorize";
import {BookCourse, CancelUserCourseBooking, createCourse,getAllCourses, getUserBookedCourses} from '../Controllers/coursesController'
import { deleteCourse } from "../Controllers/coursesController";
import { updateCourse } from "../Controllers/coursesController";
import { isStudent } from "../Middlewares/authenticate";

const router = express.Router();

router.post("/create-course", isApprovedInstructor, createCourse);
 router.put("/update-course", isApprovedInstructor, updateCourse);
 router.delete("/delete-course/:courseId", isApprovedInstructor, deleteCourse);
 router.get("/getallcourses", getAllCourses);
 router.put('/bookcourse',isStudent,BookCourse);
 router.delete("/cancel-user-coursebooking/:courseId",isStudent,CancelUserCourseBooking);
 router.get("/get-userbooked-courses",isStudent,getUserBookedCourses );



export default router;