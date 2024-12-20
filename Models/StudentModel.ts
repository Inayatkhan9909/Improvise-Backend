import { Schema, model } from "mongoose";

const studentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
});

export default model("Student", studentSchema);
