// utils/notifyUser.js
import notification from "../models/notification.js";

export const notifyUser = async (userId, message, io, connectedUsers) => {
  if (!userId || !message) return;

  // Save to DB
  await notification.create({ userId, message });

  // Send via socket if user is online
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("receive_notification", message);
  }
};

export const notifyUsers = async (userIds, message, io, connectedUsers) => {
  if (!userIds || !message) return;

  // Save to DB
  await notification.insertMany(userIds.map(userId => ({ userId, message })));

  // Send via socket if user is online
  userIds.forEach(userId => {
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit("receive_notification", message);
    }
  });
};