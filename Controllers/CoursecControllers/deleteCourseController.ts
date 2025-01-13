import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../Models/UserModel";
import ConnectDb from "../../Config/db";
import transporter from "../../Config/nodemailerConfig";
import Course from "../../Models/CourseModel";

export const deleteCourse = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseId } = req.params;
console.log(req.params)
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
        from: "your-email@gmail.com",
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
