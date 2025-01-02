const Class = require('../../Models/ClassesModel');
import { Request, Response } from "express";

// Create a new class
export const createClass = async (req:Request, res:Response) => {
  try {
    const {instructor, title, description, date,timing, duration, price, maxStudents, category, level, thumbnail } =
      req.body;

      if(!instructor || !title || !description || !date || !timing || !duration || !price || !maxStudents || !category || !level || !thumbnail ){
        return res.status(400).json({ message: 'All credentials are required!' });
      }

    const newClass = new Class({
      title,
      description,
      instructor, 
      date,
      timing,
      duration,
      price,
      maxStudents,
      category,
      level,
      thumbnail,
    });

    await newClass.save();
    res.status(201).json({ success: true, message: 'Class created successfully', class: newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create class' });
  }
};

// Fetch all classes
export const getAllClasses = async (req:Request, res:Response) => {
  try {
    const classes = await Class.find().populate('instructor', 'name profilePic');
    res.status(200).json({ success: true, classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
};

// Fetch classes by instructor
export const getInstructorClasses = async (req:Request, res:Response) => {
  try {
    // const classes = await Class.find({ instructor: req.user._id });
    // res.status(200).json({ success: true, classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructor classes' });
  }
};

// Delete a class
export const deleteClass = async (req:Request, res:Response) => {
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
export const updateClass = async (req:Request, res:Response) => {
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
