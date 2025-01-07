import { Request, Response } from "express";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import { firebaseAuth } from "../../Config/firebaseConfig";


export const getUser = async (req: Request, res: Response) => {
    const tokenBearer = req?.headers?.authorization;

    try {
        if (!tokenBearer) {
            return res.status(400).json({ message: "Authentication token is required." });
        }
        const token = tokenBearer.split(' ')[1];
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        const { uid } = decodedToken;

        if (!uid) {
            return res.status(404).json({ message: "UserId not found" });
        }
        await ConnectDb();
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found in the database." });
        }

        return res.status(201).json({ message: "User fetched successful!", user });
    } catch (error) {
        console.error("getUser Error:", error);
        const err = error as Error;
        return res.status(500).json({ message: "User fetching failed.", error: err.message });
    }
}