import { Request, Response } from "express";
import { firebaseAuth } from "../../Config/firebaseConfig";

export const editUserPassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const user = req?.body?.user; 
    const userUid = user[0].firebaseUid;
    try {
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required." });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "New password cannot be the same as old password." });
        }
             

        const firebaseUser = await firebaseAuth.getUser(userUid);

        // Update password
        await firebaseAuth.updateUser(firebaseUser.uid, { password: newPassword });

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Password update failed.", error });
    }
};
