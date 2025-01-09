import express from "express";
import { Signup } from "../Controllers/AuthConroller/signupController";
import {Login} from "../Controllers/AuthConroller/loginController"
import { autheticate } from "../Middlewares/authenticate";
import { editUserDetails } from "../Controllers/AuthConroller/EditUserDetailsController";
import { editUserEmail } from "../Controllers/AuthConroller/editUserEmailController";
import { editUserPassword } from "../Controllers/AuthConroller/editUserPasswordController";
import { editUserProfilePic } from "../Controllers/AuthConroller/editUserProfilePicController";


const router = express.Router();

// Signup Route
router.post("/signup", Signup);
router.post("/login",Login);
router.put("/edituserdetails",autheticate,editUserDetails);
router.put("/edituseremail",autheticate,editUserEmail);
router.put("/edituserpassword",autheticate,editUserPassword);
router.put("/edituserprofilepic",autheticate,editUserProfilePic);



  

export default router;
