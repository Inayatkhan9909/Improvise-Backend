import { Request, Response } from "express";
import mongoose from "mongoose";
import Class from "../../Models/ClassesModel";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import transporter from "../../Config/nodemailerConfig";

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
