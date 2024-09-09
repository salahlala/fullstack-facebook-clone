import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

// Index for fast updates of unseen messages
messageSchema.index({ chat: 1, sender: 1, seen: 1, status: 1 });
const Message = mongoose.models.Message || model("Message", messageSchema);

export default Message;
