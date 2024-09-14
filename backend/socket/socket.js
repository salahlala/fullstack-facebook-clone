import { Server } from "socket.io";
import express from "express";
import Message from "../models/messageModel.js";
const app = express();
// const server = http.createServer(app);

let io;
export const userMap = new Map();
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:8000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userMap.set(userId, socket.id);
      console.log("a user connected", userId);
    }
    io.emit("getUsers", Array.from(userMap.keys()));

    socket.on("typing", (data) => {
      const receiverSocketId = userMap.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing");
      }
    });

    socket.on("stop-typing", (data) => {
      const receiverSocketId = userMap.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop-typing");
      }
    });

    socket.on("send-message", async (data) => {
      const receiverSocketId = userMap.get(data.receiver);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new-message", data);
        // data.chat is populated
        console.log(data.chat, "from socket");
        const messageUpdate = await Message.updateMany(
          {
            chat: data.chat,
            sender: data.sender._id,
            seen: false,
            $or: [{ status: "sent" }, { exists: false }],
          },
          { $set: { status: "delivered" } }
        );

        if (messageUpdate.modifiedCount > 0) {
          console.log("message is updated to delivered event sent");
          // the chat is not updated to the last message
          io.to(receiverSocketId).emit("message-delivered", data.chat);
        }
      }
    });
    socket.on("messageRead", async ({ chatId, receiver }) => {
      const socketId = userMap.get(receiver);
      // console.log({ chatId, reciver: receiver, socketId }, "message read");
      console.log({ receiver });
      try {
        // Find the messages that will be updated
        let messagesToUpdate = await Message.find({
          chat: chatId,
          sender: receiver,
          seen: false,
          status: { $in: ["sent", "delivered"] },
        }).populate("sender", "username fullName profileImg");
        // console.log({ messagesToUpdate }, "from message read ");
        // Check if there are messages to update
        if (messagesToUpdate.length === 0) {
          console.log("no messages to update");
          return; // No messages to update
        }
        console.log({ messagesToUpdate }, "from message read ");
        const data = await Message.updateMany(
          {
            _id: { $in: messagesToUpdate.map((msg) => msg._id) },
          },
          { $set: { status: "read", seen: true } }
        );

        if (data.modifiedCount > 0) {
          messagesToUpdate.forEach((message) => {
            message.seen = true;
            message.status = "read";
          });
          console.log({ messagesToUpdate }, "after update message to read");
          io.to(socketId).emit("readMessage", { chatId, messagesToUpdate });
        }
      } catch (error) {
        console.log(error, "from message read ");
      }
    });

    socket.on(
      "user-status",
      async ({ senderId, reciverId, messages, chatId }) => {
        // console.log({ senderId, messages, chatId });
        const senderSocketId = userMap.get(senderId);
        if (!messages || messages.length == 0) return;
        const data = await Message.updateMany(
          {
            _id: { $in: messages.map((message) => message._id) },
            chat: chatId,
            $or: [{ status: "sent" }, { exists: false }],
          },
          { $set: { status: "delivered" } }
        );
        // console.log({ data }, "from user status");
        if (data.modifiedCount > 0) {
          const messagesToUpdate = await Message.find({
            _id: { $in: messages.map((message) => message._id) },
          }).populate("sender", "username fullName profileImg");
          // console.log({ messagesToUpdate }, "from user status");
          io.to(senderSocketId).emit("messageDelivered", {
            messagesToUpdate,
            chatId,
          });
        }
        // io.to([senderSocketId, reciverSocketId]).emit("messageDelivered", {
        //   senderId,
        // });
      }
    );

    socket.on("disconnect", () => {
      const userId = Array.from(userMap.keys()).find(
        (key) => userMap.get(key) === socket.id
      );

      if (userId) {
        userMap.delete(userId);
        io.emit("getUsers", Array.from(userMap.keys()));
      }
      console.log("user disconnected");
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
export { app, initSocket, getIO };
