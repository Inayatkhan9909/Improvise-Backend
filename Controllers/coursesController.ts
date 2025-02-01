import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../Models/UserModel";
import ConnectDb from "../Config/db";
import Course from "../Models/CourseModel";
import transporter from "../Config/nodemailerConfig";
require('dotenv').config();


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
            courseId: savedCourse._id,
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

    res.status(201).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch classes" });
  }
};


export const getTopCourses = async (req: Request, res: Response) => {
  try {
    await ConnectDb();
    const courses = await Course.find().sort({ createdAt: -1 }).limit(3);
    res.status(201).json({ success: true, courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


export const deleteCourse = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required!" });
    }

    await ConnectDb();

    // Find the class
    const courseToDelete = await Course.findById(courseId).session(session);
    if (!courseToDelete) {
      return res.status(404).json({ message: "Class not found!" });
    }

    // Remove class reference from instructor's details
    const instructorId = courseToDelete.instructor;
    const updatedInstructor = await User.findByIdAndUpdate(
      instructorId,
      {
        $pull: { "roleDetails.instructor.classesCreated": { courseId } },
      },
      { session, new: true }
    );

    if (!updatedInstructor) {
      throw new Error("Failed to update instructor details");
    }

    // Get the list of enrolled students
    const enrolledStudents = courseToDelete.studentsEnrolled || [];

    // Send email notifications to students
    if (enrolledStudents.length > 0) {
      const studentEmails = enrolledStudents.map((student: any) => student.email);
      const mailOptions = {
        from: process.env.EMAIL,
        to: studentEmails,
        subject: `Class Cancellation Notification: ${courseToDelete.title}`,
        html: `
            <p>Dear Student,</p>
            <p>We regret to inform you that the class <strong>${courseToDelete.title}</strong> has been canceled.</p>
            <p>If you have any questions or concerns, please contact us.</p>
            <p>Best regards,<br>Your Team</p>
          `,
      };

      await transporter.sendMail(mailOptions);
    }

    // Delete the class
    await Course.findByIdAndDelete(courseId).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete class",
    });
  }
};

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
        from: process.env.EMAIL,
        to: originalCourse.studentsEnrolled.map((student: any) => student.email), // Get emails of all booked students
        subject: `Course Update: ${title}`,
        html: `
            <p>Dear Student,</p>
            <p>The corse you booked has been updated. Below are the updated details:</p>
            <ul>
              <li><strong>Title:</strong> ${title}</li>
              <li><strong>Description:</strong> ${description}</li>
              <li><strong>Date:</strong> ${date}</li>
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

    res.status(201).json({
      success: true,
      message: "Course updated successfully",
      updatedCourse,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update class" });
  }
};


export const BookCourse = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { courseId } = req.body;
    const user = req.body?.user;

    if (!courseId || !user) {
      return res.status(400).json({ message: "Course ID and user details are required!" });
    }

    await ConnectDb();

    session.startTransaction();

    const existingCourse = await Course.findById(courseId).session(session);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found!" });
    }

    if (existingCourse.studentsEnrolled.includes(user._id)) {
      return res.status(400).json({ message: "User is already enrolled in this course." });
    }

    existingCourse.studentsEnrolled.push(user._id);
    await existingCourse.save({ session });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { "roleDetails.student.enrolledCourses": courseId },
      },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user details");
    }

    await session.commitTransaction();

    const mailOptions = {
      from: process.env.EMAIL,
      to: updatedUser.email,
      subject: "Course Booking Confirmation",
      html: `
          <p>Dear ${updatedUser.name},</p>
          <p>Thank you for booking a class!</p>
          <p>Here are the details of your booking:</p>
          <ul>
            <li><strong>Course:</strong> ${existingCourse.title}</li>
            <li><strong>Date:</strong> ${existingCourse.date.toDateString()}<ourse
          </ul>
          <p>We look forward to seeing you there!</p>
          <p>Best regards,</p>
          <p>Your Team</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Course booked successfully and confirmation email sent.",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    res.status(500).json({ success: false, message: "Failed to book course", error: error });
  } finally {
    session.endSession();
  }
};


export const getUserBookedCourses = async (req: Request, res: Response) => {
  try {
    const userId = await req.body.user._id;
    if (!userId) {
      res.status(400).json({ message: "Id not found" });
    }
    await ConnectDb();
    const courses = await Course.find({ studentsEnrolled: userId });
    if (!courses) {
      res.status(400).json({ message: "Courses not found" });
    }
    res.status(201).json({ message: "courses found", courses });
  } catch (error: any) {
    console.error("Error updating instructor details:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};


export const CancelUserCourseBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { courseId } = req.params;
    const user = req.body?.user;
    if (!courseId || !user) {
      return res.status(400).json({ message: "Course ID and user details are required!" });
    }

    await ConnectDb();

    session.startTransaction();

    // Check if the class exists
    const existingCourse = await Course.findById(courseId).session(session);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found!" });
    }

    // Check if the user is enrolled in the class
    const isEnrolled = existingCourse.studentsEnrolled.includes(user._id);
    if (!isEnrolled) {
      return res.status(400).json({ message: "User is not enrolled in this class." });
    }

    // Remove user from class's enrolled students
    existingCourse.studentsEnrolled = existingCourse.studentsEnrolled.filter(
      (studentId: mongoose.Schema.Types.ObjectId) => studentId.toString() !== user._id.toString()
    );
    await existingCourse.save({ session });

    // Remove class from user's enrolled classes
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $pull: { "roleDetails.student.enrolledClasses": courseId },
      },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user details");
    }

    // Send cancellation email to the user
    const mailOptions = {
      from: process.env.EMAIL,
      to: updatedUser.email,
      subject: "Course Booking Cancellation",
      html: `
        <p>Dear ${updatedUser.name},</p>
        <p>Your booking for the course <strong>${existingCourse.title}</strong> has been successfully canceled.</p>
        <p>If this was a mistake, feel free to book the course again at your convenience.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Course booking canceled successfully and confirmation email sent.",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    res.status(500).json({ success: false, message: "Failed to cancel course booking", error });
  } finally {
    session.endSession();
  }
};
