import express from "express";
import { Signup } from "../Controllers/AuthConroller/signupController";
import {Login} from "../Controllers/AuthConroller/loginController"
import { autheticate } from "../Middlewares/authenticate";
import { editUserDetails } from "../Controllers/AuthConroller/EditUserDetailsController";


const router = express.Router();

// Signup Route
router.post("/signup", Signup);
router.post("/login",Login);
router.put("/edituserdetails",autheticate,editUserDetails);



  

export default router;
