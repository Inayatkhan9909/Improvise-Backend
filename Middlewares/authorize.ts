import { Request, Response, NextFunction } from "express"

import User from "../Models/UserModel";


export const authorized = async (req: Request, res: Response, next: NextFunction) => {
    const instructorId = req.headers.authorization;
    if (!instructorId) {
        return res.status(401).json({ message: "InstructorId is required." });
    }
    try {

        const isUser = await User.findById(instructorId)
        if (!isUser) {
            return res.status(401).json({ message: "InstructorId is required." });
        }

        const isInstructor = isUser.role.includes('instructor');
        if (!isInstructor) {
            return res.status(403).json({ message: "User is not an instructor." });
        }

        next();

    } catch (error) {
        console.error(error); 
        return res.status(500).json({ message: "Internal server error." });
    }
}