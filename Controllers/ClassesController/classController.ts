import { Request, Response } from "express";
import mongoose, { connect } from "mongoose";
import Class from "../../Models/ClassesModel";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";


export const createClass = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      date,
      timing,
      duration,
      maxStudents,
      category,
      level,
      thumbnail,
    } = req.body;
    const instructor = req.body.user._id;
    const instructorname = req.body.user.name;
    const instructorprofile = req.body.profilePic;

    if (
      !title ||
      !description ||
      !date ||
      !timing ||
      !duration ||
      !maxStudents ||
      !category ||
      !level ||
      !thumbnail
    ) {
      return res.status(400).json({ message: "All credentials are required!" });
    }

    if (!instructor) {
      return res.status(400).json({ message: "Invalid Instructor!" });
    }
    await ConnectDb();
    // Create new class document
    const newClass = new Class({
      title,
      description,
      instructor,
      instructorname,
      instructorprofile,
      date,
      timing,
      duration,
      maxStudents,
      category,
      level,
      thumbnail,
    });

    // Save the class in the database
    const savedClass = await newClass.save({ session });

    // Update instructor details in the User collection
    const updatedInstructor = await User.findByIdAndUpdate(
      instructor,
      {
        $push: {
          "roleDetails.instructor.classesCreated": {
            classId: savedClass._id,
            title: savedClass.title,
            date: savedClass.date,
            timing: savedClass.timing,
            maxStudents: savedClass.maxStudents,
            category: savedClass.category,
            level: savedClass.level,
            thumbnail: savedClass.thumbnail,
          },
        },
      },
      { new: true, session }
    );

    if (!updatedInstructor) {
      throw new Error("Failed to update instructor details");
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: savedClass,
      instructor: updatedInstructor,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create class" });
  }
};


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
