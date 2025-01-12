import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
    title: string;
    description: string;
    instructor: mongoose.Schema.Types.ObjectId;
    category: string;
    thumbnail: string;
    date: Date;
    maxStudents:Number;
    modules: {
        title: string;
        content: string;
        duration: number;
    }[];
    studentsEnrolled: mongoose.Schema.Types.ObjectId[];
    price: number;
    duration:  number;
    level: "Beginner" | "Intermediate" | "Advanced";
    rating: {
        average: number;
        reviews: {
            studentId: mongoose.Schema.Types.ObjectId;
            review: string;
            rating: number;
        }[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema: Schema = new Schema<ICourse>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        category: { type: String, required: true },
        thumbnail: { type: String, required: true },
        date: {type: Date, required: true},
        maxStudents: {type: Number,required: true},
        modules: [
            {
                title: { type: String, required: true },
                content: { type: String, required: true },
                duration: { type: Number, required: true },
            },
        ],
        studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        price: { type: Number, required: true },
        duration: { type: Number, required: true },
        level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
        rating: {
            average: { type: Number, default: 0 },
            reviews: [
                {
                    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                    review: { type: String },
                    rating: { type: Number, min: 1, max: 5 },
                },
            ],
        },
    },
    { timestamps: true }
);

export default mongoose.model<ICourse>("Course", CourseSchema);
