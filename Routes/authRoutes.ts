import express from "express";
import { Signup } from "../Controllers/AuthConroller/signupController";
import {Login} from "../Controllers/AuthConroller/loginController"

const router = express.Router();

// Signup Route
router.post("/signup", Signup);
router.post("/login",Login);

export default router;
