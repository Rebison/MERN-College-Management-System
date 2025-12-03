// /config/socket.js
import { Server } from "socket.io";
import initSocketHandlers from "../sockets/handlers.js";

let ioInstance = null;
let connectedUsersInstance = null;

function setupSocketIO(httpServer, frontendURL) {
  const io = new Server(httpServer, {
    cors: {
      origin: frontendURL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Register user to socket
    socket.on("register_user", (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Attach additional socket handlers
    initSocketHandlers(io, socket, connectedUsers);

    // Clean up on disconnect
    socket.on("disconnect", () => {
      for (const [userId, sid] of connectedUsers.entries()) {
        if (sid === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });

  // Save singletons
  ioInstance = io;
  connectedUsersInstance = connectedUsers;

  return { io, connectedUsers };
}

// ✅ getters for other files (like workers)
export function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized!");
  return ioInstance;
}

export function getConnectedUsers() {
  if (!connectedUsersInstance) throw new Error("ConnectedUsers not initialized!");
  return connectedUsersInstance;
}

export default setupSocketIO;
