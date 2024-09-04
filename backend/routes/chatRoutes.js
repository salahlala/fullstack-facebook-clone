import express from "express";
import {
  createChat,
  getChats,
  getChatOfTwoUsers,
  getChatById,
} from "../controller/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();
router.use(protectRoute);
router.post("/", createChat);
router.get("/user", getChats);
router.get("/:chatId", getChatById);
router.get("/user/:firstId/:secondId", getChatOfTwoUsers);

export default router;
