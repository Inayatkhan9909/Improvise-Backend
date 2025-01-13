import express from "express";
import {isAdminUser} from '../Middlewares/authorize';
import {getAllInstructors} from '../Controllers/adminController'
import { approveInstructor } from "../Controllers/adminController";
import {rejectInstructor} from '../Controllers/adminController'


const router = express.Router();

router.get("/getallinstructors",isAdminUser,getAllInstructors);
router.put("/approve-instructor",isAdminUser,approveInstructor);
router.put("/reject-instructor",isAdminUser,rejectInstructor);
router.put("/remove-instructor",isAdminUser,rejectInstructor);


export default router;