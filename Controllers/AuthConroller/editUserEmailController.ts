import { Request, Response } from "express";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import transporter from "../../Config/nodemailerConfig";
import { firebaseAuth } from "../../Config/firebaseConfig";

export const editUserEmail = async (req: Request, res: Response) => {
    const { oldEmail, newEmail } = req.body;
    const user = req?.body?.user;

    try {
        const userId = user[0]._id;

        if (!oldEmail || !newEmail) {
            return res.status(400).json({ message: "Both old and new emails are required." });
        }
        if (!userId) {
            return res.status(400).json({ message: "UserId not found." });
        }
        if (oldEmail === newEmail) {
            return res.status(400).json({ message: "New email cannot be the same as old email." });
        }

        await ConnectDb();
        const isUser = await User.findById(userId);

        if (!isUser) {
            return res.status(400).json({ message: "User not found." });
        }
        if (isUser.email !== oldEmail) {
            return res.status(400).json({ message: "Old email is incorrect." });
        }

        // Update email in Firebase Authentication
        const firebaseUser = await firebaseAuth.getUserByEmail(oldEmail);
        if (!firebaseUser) {
            return res.status(404).json({ message: "User not found in Firebase Auth." });
        }

        await firebaseAuth.updateUser(firebaseUser.uid, { email: newEmail });

        // Update email in MongoDB
        isUser.email = newEmail;
        await isUser.save();

        // Generate verification link for new email
        const emailVerificationLink = await firebaseAuth.generateEmailVerificationLink(newEmail);
        if (!emailVerificationLink) {
            return res.status(400).json({ message: "Failed to generate email verification link." });
        }

        // Send verification email
        const mailOptions = {
            from: process.env.EMAIL,
            to: newEmail,
            subject: "Verify Your Email Address",
            html: `
                <p>Hi ${isUser.name},</p>
                <p>Please verify your new email address by clicking the link below:</p>
                <a href="${emailVerificationLink}">Verify Email</a>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ message: "Email updated successfully. Verification email sent.", user: isUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Email update failed.", error });
    }
};
