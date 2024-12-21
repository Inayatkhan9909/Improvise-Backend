import { Request, Response } from "express";
import UserModel from "../../Models/UserModel";
import { firebaseAuth } from "../../Config/firebaseConfig";
import ConnectDb from "../../Config/db";


export const Login = async (req: Request, res: Response) => {
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

        
        return res.status(200).json({ message: "Login successful!", user });
    } catch (error) {
        console.error("Login Error:", error);
        const err = error as Error;
        return res.status(500).json({ message: "Login failed.", error: err.message });
    }
};
