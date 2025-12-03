// /sockets/handlers.js
import { Notification } from "../models/index.js";

const initSocketHandlers = (io, socket, connectedUsers) => {
  socket.on("notify_user", async ({ userId, message }) => {
    const socketId = connectedUsers.get(userId);
    await Notification.create({ userId, message });

    if (socketId) {
      io.to(socketId).emit("receive_notification", message);
    }
  });

  // Add more handlers as needed
};

export default initSocketHandlers;
