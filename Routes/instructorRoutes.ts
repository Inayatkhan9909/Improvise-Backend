import express from "express";

import { createClass } from "../Controllers/InstructorController/classController";
import { authorized } from "../Middlewares/authorize";

const router = express.Router();


router.post("/createclass/:instructorId",authorized, createClass);


export default router;