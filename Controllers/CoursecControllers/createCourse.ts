
import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import Course from "../../Models/CourseModel";


export const createCourse = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      title,
      description,
      price,
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
      !price ||
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
    const newCourse = new Course({
      title,
      description,
      instructor,
      instructorname,
      instructorprofile,
      price,
      date,
      timing,
      duration,
      maxStudents,
      category,
      level,
      thumbnail,
    });

    // Save the class in the database
    const savedCourse = await newCourse.save({ session });

    // Update instructor details in the User collection
    const updatedInstructor = await User.findByIdAndUpdate(
      instructor,
      {
        $push: {
          "roleDetails.instructor.courseCreated": {
            classId: savedCourse._id,
            title: savedCourse.title,
            date: savedCourse.date,
            price: savedCourse.price,
            maxStudents: savedCourse.maxStudents,
            category: savedCourse.category,
            level: savedCourse.level,
            thumbnail: savedCourse.thumbnail,
          },
        },
      },
      { new: true, session }
    );

    if (!updatedInstructor) {
      throw new Error("Failed to update instructor details");
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      course: savedCourse,
      instructor: updatedInstructor,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create class" });
  }
};


export const getAllCourses = async (req: Request, res: Response) => {
  try {
    await ConnectDb();
    const courses = await Course.find()
      .sort({ createdAt: -1 }) 
      .limit(10); 

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch classes" });
  }
};
