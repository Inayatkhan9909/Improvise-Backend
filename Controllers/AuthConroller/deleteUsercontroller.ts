import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth"; // Import Firebase Admin SDK
import User from "../../Models/UserModel"; // Assuming you have a Mongoose model for MongoDB

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = req?.body?.user;

        if (!user || user.length === 0) {
            return res.status(400).json({ message: "User details are required" });
        }

        const userUid = user[0].firebaseUid;
        await getAuth().deleteUser(userUid);
        const result = await User.findOneAndDelete({ firebaseUid: userUid });

        if (!result) {
            return res.status(404).json({ message: "User not found in MongoDB" });
        }

        return res.status(201).json({ message: "User successfully deleted from both Firebase and MongoDB" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};
