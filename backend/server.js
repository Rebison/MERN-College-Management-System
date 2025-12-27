// server.js
import "./config/env.js";
import { createServer } from "http";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import passportSetup from "./config/passport.js";
import setupSocketIO from "./config/socket.js";
import agenda from "./queues/agenda.js";
import exportJobs from "./jobs/exportJob.js";
import logger from "./utils/logger.js";
import createApp from "./app.js";

const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

async function startServer() {
  try {
    await connectDB();

    const app = await createApp({
      isProduction,
      FRONTEND_URL,
      MONGO_URI: process.env.MONGO_URI,
      SESSION_SECRET: process.env.SESSION_SECRET,
    });

    const httpServer = createServer(app);
    const { io, connectedUsers } = setupSocketIO(httpServer, FRONTEND_URL);
    app.set("io", io);
    app.set("connectedUsers", connectedUsers);

    exportJobs(agenda);
    await agenda.start();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running at ${BACKEND_URL}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("🛑 SIGINT received, shutting down...");
      await agenda.stop();
      httpServer.close(() => process.exit(0));
    });

  } catch (error) {
    logger.error(error, {
      context: "server-startup",
      fatal: true
    });
    process.exit(1);
  }
}

startServer();
