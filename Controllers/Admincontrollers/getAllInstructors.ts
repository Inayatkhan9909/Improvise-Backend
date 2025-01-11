import { Request, Response } from "express";
import User from "../../Models/UserModel"; 
import ConnectDb from "../../Config/db";

export const getAllInstructors = async (req: Request, res: Response) => {
    try {
        await ConnectDb();
        const instructors = await User.find({ role: "instructor" });

        if (instructors.length === 0) {
            return res.status(404).json({ message: "No instructors found." });
        }

        return res.status(200).json(instructors);
    } catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
