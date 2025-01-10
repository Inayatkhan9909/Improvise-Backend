import express from "express";
import {isAdminUser} from '../Middlewares/authorize';
import {getAllInstructors} from '../Controllers/Admincontrollers/getAllInstructors'
import { approveInstructor } from "../Controllers/Admincontrollers/approveInstructor";
import {rejectInstructor} from '../Controllers/Admincontrollers/rejectInstructor'


const router = express.Router();

router.get("/getallinstructors",isAdminUser,getAllInstructors);
router.put("/approve-instructor",isAdminUser,approveInstructor);
router.put("/reject-instructor",isAdminUser,rejectInstructor);


export default router;