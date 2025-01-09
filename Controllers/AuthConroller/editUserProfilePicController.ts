import { Request,Response } from "express";
import ConnectDb from "../../Config/db";
import User from "../../Models/UserModel";


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
        return res.status(201).json({ message: "User Updated", user: isUser })

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal server error"});
    }
}