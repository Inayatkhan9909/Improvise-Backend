import { Request, Response } from "express";
import User from "../Models/UserModel";
import ConnectDb from "../Config/db";
import transporter from "../Config/nodemailerConfig";


export const approveInstructor = async (req: Request, res: Response) => {
    const {instructorId} = req.body;
    try {
        if (!instructorId) {
            return res.status(400).json({ message: "InstructorId required" });
        }
        await ConnectDb();
        const user = await User.findById(instructorId);
        if (!user) {
            return res.status(400).json({ message: "Instructor not found" });
        }
        if (user.roleDetails && user.roleDetails.instructor) {
            user.roleDetails.instructor.approvedByAdmin = true;
            await user.save();

            const mailOptions = {
                from: process.env.EMAIL,  
                to: user?.email,
                subject: "Approval as Instructor at Improvise",
                html: `
                    <p>Congratulations ${user?.name},</p>
                    <p>You have been approved as a Instructor at Improvise. Now you can take class at our platform.</p>
                    <p>Thank You</p>
                    
                `,
            };   
            await transporter.sendMail(mailOptions);
            return res.status(201).json({ message: "Instructor approved successfully." });
        } else {
            return res.status(400).json({ message: "Instructor role details not found." });
        }

    } catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export const getAllInstructors = async (req: Request, res: Response) => {
    try {
        await ConnectDb();
        const instructors = await User.find({ role: "instructor" });

        if (instructors.length === 0) {
            return res.status(404).json({ message: "No instructors found." });
        }

        return res.status(201).json(instructors);
    } catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


export const rejectInstructor = async (req: Request, res: Response) => {
    const {instructorId,reason} = req.body;
    console.log(instructorId);
    console.log(reason);
    try {
        if (!instructorId || !reason) {
            return res.status(400).json({ message: "InstructorId required" });
        }
        await ConnectDb();
        
        const user = await User.findById(instructorId);
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: "Instructor not found" });
        }
        if (user.roleDetails && user.roleDetails.instructor) {
            user.roleDetails.instructor.approvedByAdmin = false;
            await user.save();

            const mailOptions = {
                from: process.env.EMAIL,  
                to: user?.email,
                subject: "Approval status as Instructor at Improvise",
                html: `
                    <p>Hii ${user?.name},</p>
                    <p>We have received you applicaiton to be an instructor at Improvise but we are sorry to say that you are not been seleted for this role.</p>
                    <p>Reason for rejecting you:</p>
                    <p>${reason}</p>
                    <p>Thank You</p>

   
                `,
            };   
            await transporter.sendMail(mailOptions);
            return res.status(201).json({ message: "Instructor approved successfully." });
        } else {
            return res.status(400).json({ message: "Instructor role details not found." });
        }

    } catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
