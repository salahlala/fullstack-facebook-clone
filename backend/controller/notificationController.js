import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId })
      .sort({
        createdAt: -1,
      })
      .populate("from", "username profileImg")
      .populate("to", "username profileImg");

    await Notification.updateMany({ to: userId }, { read: true });
    // delete all notifications where read is true
    // delete notification after 30 days

    // await Notification.deleteMany({ to: userId, read: true });
    res.status(200).json({
      data: {
        length: notifications?.length,
        notifications,
      },
    });
  } catch (error) {
    console.log(error, "from get notifications");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId, read: true });
    res.status(200).json({ message: "notification deleted successfully" });
  } catch (error) {
    console.log(error, "from delete notification");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
