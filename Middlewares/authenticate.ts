import { Request, Response, NextFunction } from "express"
import ConnectDb from "../Config/db";
import User from "../Models/UserModel";
import { firebaseAuth } from "../Config/firebaseConfig";


export const autheticate = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "InstructorId is required." });
    }
    try {
        const userId = token.split(' ')[1];
        const decodedToken = await firebaseAuth.verifyIdToken(userId);
        const { uid } = decodedToken;
        await ConnectDb();

        const isUser = await User.find({firebaseUid:uid})
        if (!isUser) {
            return res.status(401).json({ message: "User not found" });
        }

        req.body.user = isUser;
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }


}