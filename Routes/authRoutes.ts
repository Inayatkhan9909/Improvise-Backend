import express from "express";
import { Signup } from "../Controllers/AuthConroller/signupController";
import {Login} from "../Controllers/AuthConroller/loginController"

import { getUser } from "../Controllers/AuthConroller/getUserController";

const router = express.Router();

// Signup Route
router.post("/signup", Signup);
router.post("/login",Login);
router.get("/getuser",getUser);


  

export default router;
