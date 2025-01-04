import { Request, Response } from "express";
import Class from "../../Models/ClassesModel";
import ConnectDb from "../../Config/db";

export const getAllClasses = async (req: Request, res: Response) => {
  try {
    await ConnectDb();
    const classes = await Class.find()
      .sort({ createdAt: -1 }) 
      .limit(10); 

    res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch classes" });
  }
};
