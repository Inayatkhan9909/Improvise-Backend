import { Request, Response } from "express";
import UserModel from "../../Models/UserModel";
import { firebaseAuth } from "../../Config/firebaseConfig";
import ConnectDb from "../../Config/db";
import jwt from 'jsonwebtoken'
require('dotenv').config();


export const Login = async (req: Request, res: Response) => {
    const secretKey = process.env.JWT_SECRET || "";
    const { token } = req.body;
    try {
        if (!token) {
            return res.status(400).json({ message: "Authentication token is required." });
        }

        const decodedToken = await firebaseAuth.verifyIdToken(token);
        const { uid } = decodedToken;

       await ConnectDb();
        const user = await UserModel.findOne({ firebaseUid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found in the database." });
        }

        const jwttoken = await jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            secretKey
        )
        
        return res.status(201).cookie("access_token", token, { sameSite: 'none' }).json({ message: "Login successful!", user });
    } catch (error) {
        console.error("Login Error:", error);
        const err = error as Error;
        return res.status(500).json({ message: "Login failed.", error: err.message });
    }
};
