import express from "express";
import { Signup } from "../Controllers/authController";
import { Login } from "../Controllers/authController"
import { autheticate } from "../Middlewares/authenticate";
import { editUserEmail } from "../Controllers/authController";
import { editUserPassword } from "../Controllers/authController";
import { editUserProfilePic } from "../Controllers/authController";
import { deleteUser } from "../Controllers/authController";
import { editUserDetails } from "../Controllers/authController";


const router = express.Router();

// Signup Route
router.post("/signup", Signup);
router.post("/login", Login);
router.put("/edituserdetails", autheticate, editUserDetails);
router.put("/edituseremail", autheticate, editUserEmail);
router.put("/edituserpassword", autheticate, editUserPassword);
router.put("/edituserprofilepic", autheticate, editUserProfilePic);
router.delete("/deleteuser", autheticate, deleteUser);





export default router;
