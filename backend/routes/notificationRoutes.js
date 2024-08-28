import express from "express";
import {
  getNotifications,
  deleteNotification,
  deleteNotificationById,
  markNotificationAsRead,
} from "../controller/notificationController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.use(protectRoute);
router.get("/", getNotifications);
router.patch("/mark-as-read", markNotificationAsRead);
router.delete("/", deleteNotification);
router.delete("/single/:id", deleteNotificationById);
export default router;
