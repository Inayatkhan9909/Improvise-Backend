import { Request, Response } from "express";
import mongoose from "mongoose";
import Class from "../../Models/ClassesModel";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import nodemailer from "nodemailer";
import transporter from "../../Config/nodemailerConfig";

export const updateClass = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      classId,
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

    if (!classId) {
      return res.status(400).json({ message: "Class ID is required!" });
    }

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

    await ConnectDb();

    // Check if the class exists
    const existingClass = await Class.findById(classId).session(session);
    if (!existingClass) {
      return res.status(404).json({ message: "Class not found!" });
    }

    const originalClass = { ...existingClass._doc };

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        title,
        description,
        date,
        timing,
        duration,
        maxStudents,
        category,
        level,
        thumbnail,
      },
      { new: true, session }
    );

    if (!updatedClass) {
      throw new Error("Failed to update class details");
    }

    // Update instructor's class details
    const instructorId = updatedClass.instructor;
    const updatedInstructor = await User.findByIdAndUpdate(
      instructorId,
      {
        $set: {
          "roleDetails.instructor.classesCreated.$[class]": {
            classId: updatedClass._id,
            title: updatedClass.title,
            date: updatedClass.date,
            timing: updatedClass.timing,
            maxStudents: updatedClass.maxStudents,
            category: updatedClass.category,
            level: updatedClass.level,
            thumbnail: updatedClass.thumbnail,
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ "class.classId": classId }],
        session,
      }
    );

    if (!updatedInstructor) {
      throw new Error("Failed to update instructor details");
    }

    if (originalClass.bookedStudents && originalClass.bookedStudents.length > 0) {

      const mailOptions = {
        from: "your-email@gmail.com",
        to: originalClass.bookedStudents.map((student: any) => student.email), // Get emails of all booked students
        subject: `Class Update: ${title}`,
        html: `
          <p>Dear Student,</p>
          <p>The class you booked has been updated. Below are the updated details:</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Description:</strong> ${description}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Timing:</strong> ${timing}</li>
            <li><strong>Duration:</strong> ${duration} minutes</li>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Level:</strong> ${level}</li>
          </ul>
          <p>Please check the updated details in your dashboard.</p>
          <p>Best regards,<br>Your Team</p>
        `,
      }; 

      await transporter.sendMail(mailOptions);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      updatedClass,
    });
   
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update class" });
  }
};
