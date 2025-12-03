// workers/notificationWorker.js
import mongoose from "mongoose";
import dotenv from "dotenv";
// dotenv.config();
dotenv.config({ path: "../.env" });

import { notificationQueue } from "./queue.js";
import Notification from "../models/Notification.js";
import { sendCustomEmail } from "../emails/emailService.js";
import { getTemplate } from "../notification/notificationRegistry.js";
import { getIO, getConnectedUsers } from "../config/socket.js";
import { sendUserPushNotification } from "../services/notificationService.js";

// ✅ Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Worker connected to MongoDB");
    } catch (err) {
        console.error("❌ Worker DB connection failed:", err);
        process.exit(1);
    }
}

await connectDB(); // ensure DB connection before processing jobs

notificationQueue.process(async (job) => {
    const { notificationId } = job.data;
    console.log(`Processing notification: ${notificationId}`);

    const notif = await Notification.findById(notificationId);
    if (!notif) {
        console.warn(`❌ Notification not found: ${notificationId}`);
        return;
    }

    console.log("Notification payload:", notif.payload);

    let io, connectedUsers;
    try {
        io = getIO();
        connectedUsers = getConnectedUsers();
    } catch (err) {
        console.warn("❌ Socket.io not initialized, skipping socket notifications");
    }

    for (const delivery of notif.deliveries) {
        // ✅ Skip already sent deliveries
        if (delivery.status === "sent") continue;

        try {
            switch (delivery.channel) {
                case "email":
                    if (notif.payload.email) {
                        const { to, template, data } = notif.payload.email;

                        // ✅ Validate template
                        let templateFn;
                        try {
                            templateFn = getTemplate("email", template);
                        } catch (err) {
                            console.warn(`⚠ Invalid email template "${template}", using default template.`);
                            templateFn = ({ recipientName = "User" }) => ({
                                subject: "Notification from SRISHTY",
                                bodyContent: `<p>Hello ${recipientName},</p><p>You have a new notification. Please check the ERP portal for details.</p>`
                            });
                        }

                        console.log("Sending email:", { to, template: template || "default", data });
                        await sendCustomEmail(to, templateFn, data);
                    }
                    break;

                case "socket":
                    if (notif.payload.socket && io) {
                        const { event, data } = notif.payload.socket;
                        const socketId = connectedUsers.get(String(notif.userId));
                        if (socketId) {
                            io.to(socketId).emit(event || "notification", data);
                        }
                    }
                    break;

                case "push":
                    if (notif.payload.push) {
                        const { template, data } = notif.payload.push;
                        const templateFn = getTemplate("push", template);
                        const content = templateFn(data);
                        await sendUserPushNotification(notif.userId, content);
                    }
                    break;
            }

            // ✅ Mark delivery as sent
            await Notification.updateOne(
                { _id: notif._id, "deliveries.channel": delivery.channel },
                { $set: { "deliveries.$.status": "sent", "deliveries.$.lastTriedAt": new Date() } }
            );
        } catch (err) {
            console.error(`❌ Delivery failed for ${delivery.channel}:`, err.message);

            // ❌ Mark delivery as failed but continue with other channels
            await Notification.updateOne(
                { _id: notif._id, "deliveries.channel": delivery.channel },
                {
                    $set: { "deliveries.$.status": "failed", "deliveries.$.lastError": err.message, "deliveries.$.lastTriedAt": new Date() },
                    $inc: { "deliveries.$.attempts": 1 },
                }
            );
        }
    }
});
