import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  firebaseUid: String;
  name: string;
  email: string;
  role: "student" | "instructor";
  dob: Date;
  gender: String;
  profilePic: string;
  isAdmin: Boolean;
  contact:Number;
  roleDetails: {
    instructor?: {
      bio?: string;
      qualifications: { type: String}, 
      resume: { type: String }, 
      skills: [{ type: String }],
      approvedByAdmin:  Boolean;
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
      courseCreated: {
        courseId: mongoose.Types.ObjectId;
        title: string;
        date: string;
        timing: string;
        price:Number;
        modules: 
          {
              title: String;
              content: String ;
              duration: Number ;
          }[];
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
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "instructor"], required: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    isAdmin: { type: Boolean, default: false },
    contact:{type:Number,required:true,unique:true},
    profilePic: {
      type: String,
      default: function (this: IUser) {
        if (this.gender === "male") {
          return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/677417160009f1f2f607/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
        } else if (this.gender === "female") {
          return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/677417530004c18adf84/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
        } else {
          return "https://cloud.appwrite.io/v1/storage/buckets/677416fc001f1378c00d/files/6774191d001f6dc31578/view?project=677416c4002f86bd0e17&project=677416c4002f86bd0e17&mode=admin";
        }
      },
    },
    roleDetails: {
      instructor: {
        bio: { type: String },
        qualifications: { type: String}, 
        resume: { type: String }, 
        skills: [{ type: String }],
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
        courseCreated: [
          {
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
            title: { type: String, required: true },
            date: { type: String, required: true },
            timing: { type: String, required: true },
            maxStudents: { type: Number, required: true },
            price: { type: Number, required: true },
            modules: [
              {
                  title: { type: String},
                  content: { type: String },
                  duration: { type: Number },
              },
          ],
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;

