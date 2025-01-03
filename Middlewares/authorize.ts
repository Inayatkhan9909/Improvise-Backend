import { Request, Response, NextFunction } from "express"

import User from "../Models/UserModel";
import ConnectDb from "../Config/db";


export const authorized = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "InstructorId is required." });
    }
    try {
        const instructorId = token.split(' ')[1];
        await ConnectDb();

        const isUser = await User.findById(instructorId)
        if (!isUser) {
            return res.status(401).json({ message: "InstructorId is required." });
        }

        const isInstructor = isUser?.role?.includes('instructor');
        if (!isInstructor) {
            return res.status(403).json({ message: "User is not an instructor." });
        }
        console.log(isUser)
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