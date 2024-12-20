import { Schema, model } from "mongoose";

const instructorSchema = new Schema({
  instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subjects: { type: [String], required: true },
  bio: { type: String },
  availability: { type: Object },
  approvedByAdmin: { type: Boolean, default: false },
  coursesCreated: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

export default model("Instructor", instructorSchema);
