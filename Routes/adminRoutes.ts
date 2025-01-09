import express from "express";
import {isAdminUser} from '../Middlewares/authorize';
import {getAllInstructors} from '../Controllers/Admincontrollers/getAllInstructors'


const router = express.Router();

router.get("/getallinstructors",isAdminUser,getAllInstructors)


export default router;