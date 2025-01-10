import { Request, Response } from "express";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import transporter from "../../Config/nodemailerConfig";


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
            return res.status(200).json({ message: "Instructor approved successfully." });
        } else {
            return res.status(400).json({ message: "Instructor role details not found." });
        }

    } catch (error) {
        console.error("Error fetching instructors:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}