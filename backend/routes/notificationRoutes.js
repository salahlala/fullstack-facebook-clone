import express from "express";
import {
  getNotifications,
  deleteNotification,
  deleteNotificationById,
} from "../controller/notificationController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.use(protectRoute);
router.get("/", getNotifications);
router.delete("/", deleteNotification);
router.delete("/single/:id", deleteNotificationById);
export default router;
