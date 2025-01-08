import { Request, Response } from "express";
import User from "../../Models/UserModel";


export const editUserDetails = async (req: Request, res: Response) => {
    try {
        const { name, dob, gender, contact } = await req.body;
        const user = await req?.body?.user;

        const userId = user[0]._id;
        if (!name || !dob || !gender || !contact) {
            return res.status(400).json({ message: "All Credentials Required" });
        }
        if (!userId) {
            return res.status(400).json({ message: "UserId not found" });
        }
        const isUser = await User.findById(userId);

        if (!isUser) {
            return res.status(400).json({ message: "User not found" });
        }
        isUser.name = name;
        isUser.dob = dob;
        isUser.gender = gender;
        isUser.contact = contact;

        await isUser.save();
        return res.status(201).json({ message: "User Updated", user: isUser })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Registration failed.", error });
    }
}