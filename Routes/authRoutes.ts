import express from "express";
import { Signup } from "../Controllers/AuthConroller/signupController";
import {Login} from "../Controllers/AuthConroller/loginController"
import {upload} from "../Config/multerConfig";

const router = express.Router();

// Signup Route
router.post("/signup",upload.single("profilePic"), Signup);
router.post("/login",Login);

export default router;
