import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";

import { getIO } from "../socket/socket.js";
import { userMap } from "../socket/socket.js";
export const sendMessage = async (req, res) => {
  const { senderId, content, chatId } = req.body;
  try {
    const io = getIO();
    if (!senderId || !chatId) {
      throw new Error("Please provide senderId and chatId");
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    // check if user in chat
    const checkUserInChat = chat.members.includes(senderId);
    if (!checkUserInChat) {
      throw new Error("User not in chat");
    }
    const message = await Message.create({
      sender: senderId,
      content,
      chat: chatId,
    });

    // add last message to chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });
    // console.log({ chatUpdate, message });
    const reciverId = chat.members.find(
      (member) => member.toString() !== senderId
    );
    const reciverSocketId = userMap.get(reciverId.toString());
    const senderSocketId = userMap.get(senderId.toString());

    if (reciverSocketId) {
      io.to(reciverSocketId).emit("new-message", message);

      const messageUpdate = await Message.updateMany(
        {
          chat: chatId,
          sender: senderId,
          seen: false,
          $or: [{ status: "sent" }, { exists: false }],
        },
        { $set: { status: "delivered" } }
      );
      if (messageUpdate.modifiedCount > 0) {
        console.log("message is updated to delivered");
        // console.log(messageUpdate, "update message to delivered");
        io.to(reciverSocketId).emit("message-delivered", chatId);
      } else {
        console.log("no message updating", chatId);
      }
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("message-sent", message);
    }
    // update message to delivered status

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username fullName email profileImg"
    );
    res.status(200).json({ data: populatedMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// get messages by chat id
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "fullName profileImg email")
      .sort();
    res.status(200).json({ data: messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getMessagesNotSeen = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  try {
    const messages = await Message.find({
      chat: chatId,
      seen: false,
      sender: { $ne: userId },
    })
      .populate("sender", "fullName profileImg ")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const io = getIO();

    const message = await Message.findById(messageId).populate("chat");
    // console.log(message, "from delete");
    if (!message) {
      throw new Error("Message not found");
    }

    // check if user in chat
    const checkUserInChat = message.chat.members.includes(req.user._id);
    if (!checkUserInChat) {
      throw new Error("User not in chat");
    }
    // check if user is sender
    if (message.sender.toString() !== req.user._id.toString()) {
      throw new Error("You are not authorized to delete this message");
    }

    console.log(message.chat, "message chat");
    // delete the message
    await Message.findByIdAndDelete(messageId);
    if (message.chat.lastMessage?.toString() === messageId.toString()) {
      await Chat.findByIdAndUpdate(message.chat._id, {
        lastMessage: null,
      });
    }
    // get the reciver socket id
    const reciverId = message.chat.members.find(
      (member) => member.toString() !== message.sender.toString()
    );
    const reciverSocketId = userMap.get(reciverId.toString());
    const senderSocketId = userMap.get(message.sender.toString());
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("message-deleted", {
        messageId,
        chatId: message.chat._id,
      });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
