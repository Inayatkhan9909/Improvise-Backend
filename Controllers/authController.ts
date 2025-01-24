import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import User from "../Models/UserModel";
import { firebaseAuth } from "../Config/firebaseConfig";
import ConnectDb from "../Config/db";
import transporter from "../Config/nodemailerConfig";
require('dotenv').config();

export const Signup = async (req: Request, res: Response) => {
    const { email, password, name, contact, role, dob, gender } = req.body;
    try {
        if (!email || !password || !name || !contact || !role || !dob || !gender) {
            return res.status(400).json({ message: 'All credentials are required!' });
        }

        await ConnectDb();
        const existingUserDb = await User.findOne({ email });

        if (existingUserDb) {
            return res.status(400).json({ message: 'Email is already registered!' });
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

        const user = new User({
            firebaseUid: firebaseUser.uid,
            email,
            name,
            contact,
            role,
            dob,
            gender,
        });

        await user.save();
        return res.status(200).json({ message: "User registered successfully!", user });
    } catch (error) {
        console.error(error);
        const err = error as Error;
        return res.status(500).json({ message: "Registration failed.", error: err.message });
    }
}



export const Login = async (req: Request, res: Response) => {
    const { token } = req.body;
    try {
        if (!token) {
            return res.status(400).json({ message: "Authentication token is required." });
        }

        const decodedToken = await firebaseAuth.verifyIdToken(token);
        const { uid } = decodedToken;

        await ConnectDb();
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            return res.status(404).json({ message: "User not found in the database." });
        }

        return res.status(200).json({ message: "Login successful!", user });
    } catch (error) {
        console.error("Login Error:", error);
        const err = error as Error;
        return res.status(500).json({ message: "Login failed.", error: err.message });
    }
};


export const editUserProfilePic = async(req:Request,res:Response)=>{
    const {profilePic} = await req.body;
 
     try {
         if(!profilePic){
             return res.status(400).json({message:"Profile image required"});
         }
         const user = req?.body?.user; 
         const userId = user[0]._id;
          
         await ConnectDb(); 
         const isUser = await User.findById(userId);
 
         if (!isUser) {
             return res.status(400).json({ message: "User not found" });
         }
         isUser.profilePic = profilePic;
 
         await isUser.save();
         return res.status(200).json({ message: "User Updated", user: isUser })
 
     } catch (error) {
         console.log(error);
         return res.status(500).json({message:"Internal server error"});
     }
 }

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
        await ConnectDb();
        const isUser = await User.findById(userId);

        if (!isUser) {
            return res.status(400).json({ message: "User not found" });
        }
        isUser.name = name;
        isUser.dob = dob;
        isUser.gender = gender;
        isUser.contact = contact;

        await isUser.save();
        return res.status(200).json({ message: "User Updated", user: isUser })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Update failed.", error });
    }
}


export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = req?.body?.user;

        if (!user || user.length === 0) {
            return res.status(400).json({ message: "User details are required" });
        }

        const userUid = user[0].firebaseUid;
        await getAuth().deleteUser(userUid); 
        const result = await User.findOneAndDelete({ firebaseUid: userUid });

        if (!result) {
            return res.status(404).json({ message: "User not found in MongoDB" });
        }

        return res.status(200).json({ message: "User successfully deleted from both Firebase and MongoDB" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};