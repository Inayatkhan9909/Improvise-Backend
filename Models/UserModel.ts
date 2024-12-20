import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String },
  role: { type: [String], enum: ["student", "instructor", "admin"], required: true },
  dob: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  profilePic: { type: String },
  roleDetails: {
    student: {
      enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
      bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    },
    instructor: {
      subjects: [String],
      bio: String,
      availability: {
        type: [
          {
            day: String,
            slots: [String],
          },
        ],
        default: [],
      },
      approvedByAdmin: { type: Boolean, default: false },
      coursesCreated: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model("User", userSchema);


