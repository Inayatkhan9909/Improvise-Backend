import express from "express";
import { getAllClasses, createClass } from '../Controllers/classesController'
import { isApprovedInstructor } from "../Middlewares/authorize";
import { updateClass } from "../Controllers/classesController";
import { deleteClass } from "../Controllers/classesController";
import { isStudent } from "../Middlewares/authenticate";
import { BookClass } from "../Controllers/classesController";

const router = express.Router();

router.post("/createclass", isApprovedInstructor, createClass);
router.post("/update-class", isApprovedInstructor, updateClass);
router.delete("/delete-class/:classId", isApprovedInstructor, deleteClass);

router.put("/bookclass",isStudent,BookClass)
router.get("/getallclasses", getAllClasses);


export default router;