import { Request, Response, NextFunction } from "express"
import User from "../Models/UserModel";
import ConnectDb from "../Config/db";
import { firebaseAuth } from "../Config/firebaseConfig";


export const isInstructor = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "InstructorId is required." });
    }
    try {
        const instructorToken = token.split(' ')[1];
        const decodedToken = await firebaseAuth.verifyIdToken(instructorToken);
        const { uid } = decodedToken;
        await ConnectDb();
        const isUser = await User.findOne({ firebaseUid: uid })
        if (!isUser) {
            return res.status(401).json({ message: "InstructorId is required." });
        }

        const isInstructor = isUser?.role?.includes('instructor');
        if (!isInstructor) {
            return res.status(403).json({ message: "User is not an instructor." });
        }

        req.body.user = isUser;
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const isApprovedInstructor = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    try {

        if (!token) {
            return res.status(401).json({ message: "InstructorId is required." });
        }
        const instructorToken = token.split(' ')[1];
        const decodedToken = await firebaseAuth.verifyIdToken(instructorToken);
        const { uid } = decodedToken;
        await ConnectDb();
        const isUser = await User.findOne({ firebaseUid: uid })
        if (!isUser) {
            return res.status(401).json({ message: "InstructorId is required." });
        }
        const isInstructor = isUser?.role?.includes('instructor');
        if (!isInstructor) {
            return res.status(403).json({ message: "User is not an instructor." });
        }

        if (!isUser.roleDetails?.instructor?.approvedByAdmin) {
            return res.status(403).json({ message: "Instructor is not approved by admin." });
        }

        req.body.user = isUser;
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
}


export const isAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Admin id" });
    }
    try {
        const adminId = token.split(' ')[1];
        const decodedToken = await firebaseAuth.verifyIdToken(adminId);
        const { uid } = decodedToken;
        await ConnectDb();

        const isUser = await User.findOne({ firebaseUid: uid })
        if (!isUser) {
            return res.status(401).json({ message: "adminId is required." });
        }
        if (!isUser.isAdmin) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error." });
    }
}