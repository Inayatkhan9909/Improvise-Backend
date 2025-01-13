import { Request, Response } from "express";
import mongoose from "mongoose";
import Class from "../../Models/ClassesModel";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import transporter from "../../Config/nodemailerConfig";

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
