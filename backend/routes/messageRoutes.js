import express from "express";
import {
  sendMessage,
  getMessages,
  getMessagesNotSeen,
  deleteMessage,
} from "../controller/messageController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

router.use(protectRoute);
router.post("/", sendMessage);
router.get("/:chatId", getMessages);
router.get("/unseen/:chatId", getMessagesNotSeen);

router.delete("/:chatId/:messageId", deleteMessage);
export default router;
