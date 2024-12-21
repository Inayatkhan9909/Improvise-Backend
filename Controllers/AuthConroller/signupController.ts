import { Request, Response } from "express";
import UserModel from "../../Models/UserModel";
import { firebaseAuth } from "../../Config/firebaseConfig";
import ConnectDb from "../../Config/db";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import transporter from "../../Config/nodemailerConfig";

export const Signup = async (req: Request, res: Response) => {
    const { email, password, name, contact, role, dob, gender, profilePic } = req.body;
    try {
        if (!email || !password || !name || !contact || !role || !dob || !gender) {
            return res.status(400).json({ message: 'All credentials are required!' });
        }

        await ConnectDb();
        const existingUserDb = await UserModel.findOne({ email });

        if (existingUserDb) {
            return res.status(400).json({ message: 'Email is already registered!' });
        }
        let profilePicUrl = null;

        if (profilePic) {
            const storage = getStorage();
            const storageRef = ref(storage, `profilePics/${Date.now()}_${profilePic.originalname}`);
            await uploadBytes(storageRef, profilePic.buffer);
            profilePicUrl = await getDownloadURL(storageRef);
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters containing mix characters.' });
        }

        const firebaseUser = await firebaseAuth.createUser({
            email,
            password,
            displayName: name,
        });
        if (!firebaseUser) {
            return res.status(400).json({ message: 'Signup failed! Try again.' });
        }

        const emailVerificationLink = await firebaseAuth.generateEmailVerificationLink(email);

        if (!emailVerificationLink) {
            return res.status(400).json({ message: 'Email not found' });
        }

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Your Email Address",
            html: `
                <p>Hi ${name},</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${emailVerificationLink}">Verify Email</a>
            `,
        };
        await transporter.sendMail(mailOptions);
        await firebaseAuth.setCustomUserClaims(firebaseUser.uid, { role });

        const user = new UserModel({
            firebaseUid: firebaseUser.uid,
            email,
            name,
            contact,
            role,
            dob,
            gender,
            profileimage: profilePicUrl,
        });

        await user.save();
        return res.status(201).json({ message: "User registered successfully!", user });
    } catch (error) {
        console.error(error);
        const err = error as Error;
        return res.status(500).json({ message: "Registration failed.", error: err.message });
    }
}



