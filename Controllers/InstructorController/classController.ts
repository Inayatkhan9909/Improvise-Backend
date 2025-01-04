
import { Request, Response } from "express";
import mongoose, { connect } from "mongoose";
import User from "../../Models/UserModel";
import Class from "../../Models/ClassesModel";
import ConnectDb from "../../Config/db";

// Create a new class
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


// Fetch all classes
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const classes = await Class.find().populate('instructor', 'name profilePic');
    res.status(200).json({ success: true, classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
};

// Fetch classes by instructor
export const getInstructorClasses = async (req: Request, res: Response) => {
  try {
    // const classes = await Class.find({ instructor: req.user._id });
    // res.status(200).json({ success: true, classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructor classes' });
  }
};

// Delete a class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete class' });
  }
};

// Update a class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.status(200).json({ success: true, message: 'Class updated successfully', class: updatedClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update class' });
  }
};
