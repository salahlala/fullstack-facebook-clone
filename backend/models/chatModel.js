import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || model("Chat", chatSchema);

export default Chat;
