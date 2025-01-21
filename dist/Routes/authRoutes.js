"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../Controllers/authController");
const authController_2 = require("../Controllers/authController");
const authenticate_1 = require("../Middlewares/authenticate");
const authController_3 = require("../Controllers/authController");
const authController_4 = require("../Controllers/authController");
const authController_5 = require("../Controllers/authController");
const authController_6 = require("../Controllers/authController");
const authController_7 = require("../Controllers/authController");
const router = express_1.default.Router();
// Signup Route
router.post("/signup", authController_1.Signup);
router.post("/login", authController_2.Login);
router.put("/edituserdetails", authenticate_1.autheticate, authController_7.editUserDetails);
router.put("/edituseremail", authenticate_1.autheticate, authController_3.editUserEmail);
router.put("/edituserpassword", authenticate_1.autheticate, authController_4.editUserPassword);
router.put("/edituserprofilepic", authenticate_1.autheticate, authController_5.editUserProfilePic);
router.delete("/deleteuser", authenticate_1.autheticate, authController_6.deleteUser);
exports.default = router;
