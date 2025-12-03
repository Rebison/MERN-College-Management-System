// workers/queue.js
import Queue from "bull";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
export const notificationQueue = new Queue("notifications", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  },
});
