import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId })
      .sort({
        createdAt: -1,
      })
      .populate("from", "username fullName profileImg")
      .populate("to", "username fullName profileImg");

    // await Notification.updateMany({ to: userId }, { read: true });
    const unreadCount = await Notification.countDocuments({
      to: userId,
      read: false,
    });
    res.status(200).json({
      data: {
        unreadCount: unreadCount,
        notifications,
      },
    });
  } catch (error) {
    console.log(error, "from get notifications");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { to: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "notification marked as read" });
  } catch (error) {
    console.log(error, "from mark notification as read");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId, read: true });
    res.status(204).json({ message: "notification deleted successfully" });
  } catch (error) {
    console.log(error, "from delete notification");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const notification = await Notification.findOne({ _id: id, to: userId });
    if (!notification) {
      return res.status(404).json({ error: "notification not found" });
    }
    await Notification.findByIdAndDelete(id);
    res.status(204).json({ message: "notification deleted successfully" });
  } catch (error) {
    console.log(error, "from delete notification");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
