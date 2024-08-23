import { Server } from "socket.io";
import http from "http";
import express from "express";
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
    socket.on("disconnect", () => {
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
