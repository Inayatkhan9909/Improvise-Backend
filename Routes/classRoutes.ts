import express from "express";
import { getAllClasses, createClass } from '../Controllers/ClassesController/classController'
import { isApprovedInstructor } from "../Middlewares/authorize";
import { updateClass } from "../Controllers/ClassesController/updateClassController";
import { deleteClass } from "../Controllers/ClassesController/deleteClassController";

const router = express.Router();

router.post("/createclass", isApprovedInstructor, createClass);
router.post("/update-class", isApprovedInstructor, updateClass);
router.delete("/delete-class/:classId", isApprovedInstructor, deleteClass);
router.get("/getallclasses", getAllClasses);


export default router;