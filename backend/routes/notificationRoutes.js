import express from "express";
import {
  getNotifications,
  deleteNotification,
} from "../controller/notificationController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.use(protectRoute);
router.get("/", getNotifications);
router.delete("/", deleteNotification);
export default router;
