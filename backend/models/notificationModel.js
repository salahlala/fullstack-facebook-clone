import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like", "comment"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  { timestamps: true }
);

const Notification =
  mongoose.models.Notification || model("Notification", notificationSchema);

export default Notification;
