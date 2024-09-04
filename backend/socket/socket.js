import { Server } from "socket.io";
import http from "http";
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

    socket.on("messageRead", async ({ chatId, user }) => {
      const socketId = userMap.get(user);

      try {
        // Find the messages that will be updated
        let messagesToUpdate = await Message.find({
          chat: chatId,
          sender: { $ne: user._id },
          seen: false,
          status: { $in: ["sent", "delivered"] },
        }).populate("sender", "username fullName profileImg");

        // const data = await Message.updateMany(
        //   {
        //     chat: chatId,
        //     sender: { $ne: user._id },
        //     seen: false,
        //     status: { $in: ["sent", "delivered"] },
        //   },
        //   { $set: { status: "read", seen: true } }
        // );
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

          io.to(socketId).emit("readMessage", { chatId, messagesToUpdate });
        }
      } catch (error) {
        console.log(error, "from message read ");
      }
    });

    socket.on(
      "user-status",
      async ({ senderId, reciverId, messages, status, chatId }) => {
        const senderSocketId = userMap.get(senderId);
        const reciverSocketId = userMap.get(reciverId);
        if (!messages || messages.length == 0) return;
        const data = await Message.updateMany(
          {
            _id: { $in: messages.map((message) => message._id) },
            status: "sent",
          },
          { $set: { status: "delivered" } }
        );
        if (data.modifiedCount > 0) {
          const messagesToUpdate = await Message.find({
            _id: { $in: messages.map((message) => message._id) },
          }).populate("sender", "username fullName profileImg");

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
