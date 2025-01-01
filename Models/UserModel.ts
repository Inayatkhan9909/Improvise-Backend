import { Schema, model, Document } from "mongoose";

interface User extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  contact?: string;
  role: string[];
  dob?: Date;
  gender?: "male" | "female" | "other";
  profilePic?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  roleDetails?: {
    student?: {
      enrolledCourses?: Schema.Types.ObjectId[];
      bookings?: Schema.Types.ObjectId[];
    };
    instructor?: {
      subjects?: string[];
      bio?: string;
      availability?: {
        day: string;
        slots: string[];
      }[];
      approvedByAdmin?: boolean;
      coursesCreated?: Schema.Types.ObjectId[];
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<User>({
  firebaseUid: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String },
  role: { type: [String], enum: ["student", "instructor", "admin"], required: true },
  dob: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  profilePic: { 
    type: String,
    default: function (this: User) {
      if (this.gender === "male") {
        return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/677417160009f1f2f607/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
      } else if (this.gender === "female") {
        return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/677417530004c18adf84/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
      } else {
        return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/6774191d001f6dc31578/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
      }
    },
  },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
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

export default model<User>("User", userSchema);
