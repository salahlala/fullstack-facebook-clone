import redis from "../redis.js";

import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";

import { getIO } from "../socket/socket.js";
import { userMap } from "../socket/socket.js";

// export const sendMessage = async (req, res) => {
//   const { content, chatId } = req.body;
//   const currentUser = req.user._id;
//   if (!currentUser || !chatId) {
//     throw new Error("Please provide senderId and chatId");
//   }
//   try {
//     const io = getIO();

//     const chat = await Chat.findById(chatId);

//     if (!chat) {
//       throw new Error("Chat not found");
//     }
//     // Check if the sender is part of the chat
//     const isSenderInChat = chat.members.some((member) => {
//       return member._id.toString() === currentUser.toString();
//     });
//     if (!isSenderInChat) {
//       throw new Error("User not in chat");
//     }
//     const message = await Message.create({
//       sender: currentUser,
//       content,
//       chat: chatId,
//     });

//     // add last message to chat
//     // const updatedChat = await Chat.findByIdAndUpdate(
//     //   chatId,
//     //   {
//     //     lastMessage: message._id,
//     //   },
//     //   {
//     //     new: true,
//     //   }
//     // )
//     //   .populate("lastMessage", "content createdAt ")
//     //   .populate("members", "fullName profileImg email");

//     const reciverId = chat.members.find(
//       (member) => member._id.toString() !== currentUser.toString()
//     );

//     const reciverSocketId = userMap.get(reciverId._id.toString());
//     const senderSocketId = userMap.get(currentUser.toString());
//     if (reciverSocketId) {
//       io.to(reciverSocketId).emit("new-message", {
//         message,
//         chat: chatId,
//       });
//       process.nextTick(async () => {
//         const messageUpdate = await Message.updateMany(
//           {
//             chat: chatId,
//             sender: currentUser,
//             seen: false,
//             $or: [{ status: "sent" }, { exists: false }],
//           },
//           { $set: { status: "delivered" } }
//         );
//         if (messageUpdate.modifiedCount > 0) {
//           console.log("message is updated to delivered");
//           // console.log(messageUpdate, "update message to delivered");
//           io.to(reciverSocketId).emit("message-delivered", chatId);
//         }
//       });
//     }

//     // update message to delivered status

//     const populatedMessage = await Message.findById(message._id).populate(
//       "sender",
//       "username fullName email profileImg"
//     );
//     // .populate({
//     //   path: "chat",
//     //   select: "lastMessage members",
//     //   populate: [
//     //     {
//     //       path: "lastMessage",
//     //       select: "content createdAt",
//     //     },
//     //     {
//     //       path: "members",
//     //       select: "fullName profileImg email",
//     //     },
//     //   ],
//     // });

//     // console.log({ populatedMessage }, "from send message");
//     res.status(200).json({ data: populatedMessage });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// };
export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;
  const currentUser = req.user._id;
  if (!currentUser || !chatId) {
    throw new Error("Please provide senderId and chatId");
  }
  try {
    // get chat from the cache
    let chat = await redis.get(`chat:${chatId}`);

    if (chat) {
      chat = JSON.parse(chat);
      console.log(chat, "from cache");
    } else {
      chat = await Chat.findById(chatId);
      console.log(chat, "from db");
      if (!chat) {
        throw new Error("Chat not found");
      }
      await redis.set(`chat:${chatId}`, JSON.stringify(chat), "EX", 1800);
    }
    // Check if the sender is part of the chat
    const isSenderInChat = chat.members.includes(currentUser.toString());
    if (!isSenderInChat) {
      throw new Error("User not in chat");
    }

    const message = await Message.create({
      sender: currentUser,
      content,
      chat: chatId,
    });

    await message.populate("sender", "profileImg");

    res.status(201).json({ data: message });
    // add last message to chat
    await Chat.updateOne(
      { _id: chatId },
      {
        lastMessage: message._id,
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
// get messages by chat id
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  try {
    // check if user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    const isSenderInChat = chat.members.includes(userId.toString());
    if (!isSenderInChat) {
      throw new Error("User not in chat");
    }
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "fullName profileImg")
      .sort({ createdAt: 1 });

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

export const getAllMessagesNotSeen = async (req, res) => {
  const userId = req.user._id;
  try {
    const messages = await Message.countDocuments({
      sender: { $ne: userId },
      seen: false,
      chat: {
        $in: await Chat.find({ members: userId }).distinct("_id"),
      },
    });

    res.status(200).json({ data: messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// export const deleteMessage = async (req, res) => {
//   const { messageId } = req.params;
//   try {
//     const io = getIO();

//     const message = await Message.findById(messageId).populate("chat");
//     // console.log(message, "from delete");
//     if (!message) {
//       throw new Error("Message not found");
//     }

//     // check if user in chat
//     const checkUserInChat = message.chat.members.includes(req.user._id);
//     if (!checkUserInChat) {
//       throw new Error("User not in chat");
//     }
//     // check if user is sender
//     if (message.sender.toString() !== req.user._id.toString()) {
//       throw new Error("You are not authorized to delete this message");
//     }

//     console.log(message.chat, "message chat");
//     // delete the message
//     await Message.findByIdAndDelete(messageId);
//     if (message.chat.lastMessage?.toString() === messageId.toString()) {
//       await Chat.findByIdAndUpdate(message.chat._id, {
//         lastMessage: null,
//       });
//     }
//     // get the reciver socket id
//     const reciverId = message.chat.members.find(
//       (member) => member.toString() !== message.sender.toString()
//     );
//     const reciverSocketId = userMap.get(reciverId.toString());
//     const senderSocketId = userMap.get(message.sender.toString());
//     if (reciverSocketId) {
//       io.to(reciverSocketId).emit("message-deleted", {
//         messageId,
//         chatId: message.chat._id,
//       });
//     }

//     res.status(200).json({ message: "Message deleted successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const io = getIO();

    const message = await Message.findById(messageId).populate({
      path: "chat",
      select: "lastMessage members",
      populate: [
        {
          path: "lastMessage",
          select: "content createdAt",
        },
        {
          path: "members",
          select: "fullName profileImg email",
        },
      ],
    });
    // console.log(message, "from delete");
    if (!message) {
      throw new Error("Message not found");
    }

    // check if user in chat
    const checkUserInChat = message.chat.members.some((member) => {
      return member._id.toString() === req.user._id.toString();
    });
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
    if (message.chat.lastMessage?._id.toString() === messageId.toString()) {
      console.log("this is last message");
      await Chat.findByIdAndUpdate(message.chat._id, {
        lastMessage: null,
      });
      message.chat.lastMessage = null;
    }
    // get the reciver socket id
    const reciverId = message.chat.members.find(
      (member) => member._id.toString() !== message.sender.toString()
    );
    const reciverSocketId = userMap.get(reciverId._id.toString());
    const senderSocketId = userMap.get(message.sender.toString());
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("message-deleted", {
        messageId,
        chat: message.chat,
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("message-deleted", {
        messageId,
        chat: message.chat,
      });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
