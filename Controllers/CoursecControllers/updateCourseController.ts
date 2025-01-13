import { Request, Response } from "express";
import mongoose from "mongoose";
import ConnectDb from "../../Config/db";
import transporter from "../../Config/nodemailerConfig";
import Course from "../../Models/CourseModel";
import User from "../../Models/UserModel";

export const updateCourse = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      courseId,
      title,
      description,
      date,
      timing,
      duration,
      price,
      maxStudents,
      category,
      level,
      thumbnail,
    } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required!" });
    }

    if (
      !title ||
      !description ||
      !date ||
      !timing ||
      !duration ||
      !price ||
      !maxStudents ||
      !category ||
      !level ||
      !thumbnail
    ) {
      return res.status(400).json({ message: "All credentials are required!" });
    }

    await ConnectDb();

    // Check if the class exists
    const existingCourse = await Course.findById(courseId).session(session);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found!" });
    }

    const originalCourse = existingCourse.toObject();


    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        date,
        timing,
        duration,
        price,
        maxStudents,
        category,
        level,
        thumbnail,
      },
      { new: true, session }
    );

    if (!updatedCourse) {
      throw new Error("Failed to update class details");
    }

    // Update instructor's class details
    const instructorId = updatedCourse.instructor;
    const updatedInstructor = await User.findByIdAndUpdate( 
      instructorId,
      {
        $set: {
          "roleDetails.instructor.classesCreated.$[class]": {
            courseId: updatedCourse._id,
            title: updatedCourse.title,
            date: updatedCourse.date,
            timing: updatedCourse.price,
            maxStudents: updatedCourse.maxStudents,
            category: updatedCourse.category,
            level: updatedCourse.level,
            thumbnail: updatedCourse.thumbnail,
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ "class.classId": courseId }],
        session,
      }
    );

    if (!updatedInstructor) {
      throw new Error("Failed to update instructor details");
    }

    if (originalCourse.studentsEnrolled && originalCourse.studentsEnrolled.length > 0) {

      const mailOptions = {
        from: "your-email@gmail.com",
        to: originalCourse.studentsEnrolled.map((student: any) => student.email), // Get emails of all booked students
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
      updatedCourse,
    });
   
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update class" });
  }
};
