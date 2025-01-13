import { Request, Response } from "express";
import Clsss from '../../Models/ClassesModel'
import ConnectDb from "../../Config/db";
import Course from "../../Models/CourseModel";

export const getInstructorClasses = async (req: Request, res: Response) => {
    try {
        const instructorId = await req.body.user._id;
        if (!instructorId) {
            res.status(400).json({ message: "Id not found" });
        }
        await ConnectDb();
        const classes = await Clsss.find({ instructor: instructorId });
        if (!classes) {
            res.status(400).json({ message: "Classes not found" });
        }
        res.status(200).json({ message: "classes found", classes });
    } catch (error: any) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}
export const getInstructorCourses = async (req: Request, res: Response) => {
    try {
        const instructorId = await req.body.user._id;
        if (!instructorId) {
            res.status(400).json({ message: "Id not found" });
        }
        await ConnectDb();
        const courses = await Course.find({ instructor: instructorId });
        if (!courses) {
            res.status(400).json({ message: "Courses not found" });
        }
        res.status(200).json({ message: "Courses found", courses });
    } catch (error: any) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}