const Notification = require("../models/notification");

async function getNotifications(req, res) {
  try {
    const raw = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    const notifications = raw.map((n) => ({
      id: n._id,
      title: n.title,
      icon: n.icon,
      unread: n.unread,
      time: n.createdAt,
    }));
    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("Get notifications failed:", err);
    return res.status(500).json({ success: false, message: "Could not load notifications" });
  }
}

async function markRead(req, res) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { unread: false },
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mark read failed:", err);
    return res.status(500).json({ success: false, message: "Could not update notification" });
  }
}

module.exports = { getNotifications, markRead };