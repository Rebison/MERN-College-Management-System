import express from "express";
import { Notification } from "#models/index.js";


const notificationRouter = express.Router();

// GET /notifications/unread
notificationRouter.get("/unread", async (req, res) => {
  try {
    const notifications = await notification.find({ userId: req.user.id, read: false }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /notifications/:id/mark-read
notificationRouter.patch("/:id/mark-read", async (req, res) => {
  try {
    const { id } = req.params;
    await notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default notificationRouter;