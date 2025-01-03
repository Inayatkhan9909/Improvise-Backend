import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "instructor" | "admin";
  roleDetails: {
    instructor?: {
      profilePic?: string;
      bio?: string;
      approvedByAdmin: { type: Boolean, default: false };
      classesCreated: {
        classId: mongoose.Types.ObjectId;
        title: string;
        date: string;
        timing: string;
        maxStudents: number;
        category: string;
        level: string;
        thumbnail: string;
      }[];
    };
    student?: {
      enrolledClasses: mongoose.Types.ObjectId[];
    };
  };
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor", "admin"], required: true },
    roleDetails: {
      instructor: {
        profilePic: { type: String },
        bio: { type: String },
        approvedByAdmin: { type: Boolean, default: false },
        classesCreated: [
          {
            classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
            title: { type: String, required: true },
            date: { type: String, required: true },
            timing: { type: String, required: true },
            maxStudents: { type: Number, required: true },
            category: { type: String, required: true },
            level: { type: String, required: true },
            thumbnail: { type: String, required: true },
          },
        ],
        
      },
      student: {
        enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;

 