import mongoose, { Schema, Document } from "mongoose";

interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId; // User receiving the notification
  type: "approval" | "new-signup" | "info";
  message: string;
  isRead: boolean;
  createdAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["approval", "new-signup", "info"], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
