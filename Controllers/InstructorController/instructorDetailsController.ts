import { Request, Response } from "express"
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import { sendNotifications } from '../../Config/sendNotifications'


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
        };

        await isUser.save();

        const adminUsers = await User.find({ isAdmin: true });
        const adminIds = adminUsers.map((admin: any) => admin._id.toString());

        await sendNotifications({
            recipientIds: adminIds,
            type: "new-signup",
            name: "Admin",
            email: adminUsers[0]?.email || "", // Send email to the first admin
            message: `${isUser.name} has signed up as an instructor. Approval is required.`,
            emailSubject: "Instructor Approval Needed",
            emailBody: `
          <p>A new instructor has submitted their details:</p>
          <p>Name: ${isUser.name}</p>
          <p>Email: ${isUser.email}</p>
          <p>Please review their profile and approve it in the admin panel.</p>`,
        });
        res.status(201).json({message: "Instructor details updated successfully.", isUser});
    } catch (error: any) {
        console.error("Error updating instructor details:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }

}