import { Request, Response } from "express";
import mongoose, { connect } from "mongoose";
import Class from "../Models/ClassesModel";
import User from "../Models/UserModel";
import ConnectDb from "../Config/db";
import transporter from "../Config/nodemailerConfig";


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
    const instructorprofile = req.body.user.profilePic;

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


export const deleteClass = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ message: "Class ID is required!" });
    }

    await ConnectDb();

    // Find the class
    const classToDelete = await Class.findById(classId).session(session);
    if (!classToDelete) {
      return res.status(404).json({ message: "Class not found!" });
    }

    // Remove class reference from instructor's details
    const instructorId = classToDelete.instructor;
    const updatedInstructor = await User.findByIdAndUpdate(
      instructorId,
      {
        $pull: { "roleDetails.instructor.classesCreated": { classId } },
      },
      { session, new: true }
    );

    if (!updatedInstructor) {
      throw new Error("Failed to update instructor details");
    }

    // Get the list of enrolled students
    const enrolledStudents = classToDelete.bookedStudents || [];

    // Send email notifications to students
    if (enrolledStudents.length > 0) {
      const studentEmails = enrolledStudents.map((student: any) => student.email);
      const mailOptions = {
        from: "your-email@gmail.com",
        to: studentEmails,
        subject: `Class Cancellation Notification: ${classToDelete.title}`,
        html: `
          <p>Dear Student,</p>
          <p>We regret to inform you that the class <strong>${classToDelete.title}</strong> has been canceled.</p>
          <p>If you have any questions or concerns, please contact us.</p>
          <p>Best regards,<br>Your Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    // Delete the class
    await Class.findByIdAndDelete(classId).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
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

  export const BookClass = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
  
    try {
      const { classId } = req.body;
      const user = req.body?.user;
  
      if (!classId || !user) {
        return res.status(400).json({ message: "Class ID and user details are required!" });
      }
  
      await ConnectDb();
  
      session.startTransaction();
  
      const existingClass = await Class.findById(classId).session(session);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found!" });
      }
  
      if (existingClass.enrolledStudents.includes(user._id)) {
        return res.status(400).json({ message: "User is already enrolled in this class." });
      }
  
      existingClass.enrolledStudents.push(user._id);
      await existingClass.save({ session });
  
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $push: { "roleDetails.student.enrolledClasses": classId },
        },
        { new: true, session }
      );
  
      if (!updatedUser) {
        throw new Error("Failed to update user details");
      }
  
      await session.commitTransaction();
  
      const mailOptions = {
        from: "your-email@example.com", 
        to: updatedUser.email,
        subject: "Class Booking Confirmation",
        html: `
          <p>Dear ${updatedUser.name},</p>
          <p>Thank you for booking a class!</p>
          <p>Here are the details of your booking:</p>
          <ul>
            <li><strong>Class:</strong> ${existingClass.title}</li>
            <li><strong>Date:</strong> ${existingClass.date.toDateString()}</li>
            <li><strong>Time:</strong> ${existingClass.timing}</li>
          </ul>
          <p>We look forward to seeing you there!</p>
          <p>Best regards,</p>
          <p>Your Team</p>
        `,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({
        success: true,
        message: "Class booked successfully and confirmation email sent.",
      });
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      res.status(500).json({ success: false, message: "Failed to book class", error: error});
    } finally {
      session.endSession();
    }
  };