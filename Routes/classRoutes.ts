import express from "express";
import {getAllClasses,createClass} from '../Controllers/ClassesController/classController'
import { isApprovedInstructor } from "../Middlewares/authorize";

const router = express.Router();

router.post("/createclass",isApprovedInstructor, createClass);
router.get("/getallclasses", getAllClasses);


export default router;