import { Request, Response } from "express"
import User from "../Models/UserModel";
import ConnectDb from "../Config/db";
import Clsss from '../Models/ClassesModel'
import Course from "../Models/CourseModel";



export const addInstructorDetails = async (req: Request, res: Response) => {

    try {
        const { bio, qualifications, resume, skills } = req.body;
        const instructorId = req.body.user._id;

        if (!bio || !qualifications || !resume || !skills) {
            return res.status(400).json({ message: "All credentials are required!" });
        }

        if (!instructorId) {
            return res.status(400).json({ message: "User not found try again" });
        }
        const parsedSkills = Array.isArray(skills)
            ? skills
            : skills.split(",").map((skill: string) => skill.trim());

        await ConnectDb();
        const isUser = await User.findById(instructorId);


        if (!isUser) {
            return res.status(404).json({ message: "User not found." });
        }

        isUser.roleDetails.instructor = {
            ...isUser.roleDetails.instructor,
            bio,
            qualifications,
            resume,
            skills: parsedSkills,
            approvedByAdmin: isUser.roleDetails?.instructor?.approvedByAdmin || false,
            classesCreated: isUser.roleDetails?.instructor?.classesCreated || [],
            courseCreated: isUser.roleDetails?.instructor?.courseCreated|| [],
        };

        await isUser.save();

        res.status(201).json({message: "Instructor details updated successfully.", isUser});
    } catch (error: any) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }

}

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