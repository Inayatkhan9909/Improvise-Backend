import express from "express";
import {getAllClasses} from '../Controllers/ClassesController/classController'


const router = express.Router();


router.get("/getallclasses", getAllClasses);


export default router;