// services/notificationService.js
import webpush from "web-push";
import pushSubscription from "../models/pushSubscription.js";
import Notification from "../models/notification.js";
import { notificationQueue } from "../../workers/queue.js";

/**
 * Create a notification and enqueue it for delivery
 * @param {string} userId 
 * @param {string} userType 
 * @param {object} channels - { message, email, socket, push }
 * @returns {Promise<Notification>}
 */
export async function createNotification(userId, userType, { message, email, socket, push }) {
    const deliveries = [];

    // ✅ Normalize email payload
    if (email) {
        if (!email.to) {
            throw new Error("❌ Email notifications require a 'to' field (recipient address).");
        }
        deliveries.push({ channel: "email", status: "pending", attempts: 0 });
    }

    // ✅ Normalize socket payload
    if (socket) {
        deliveries.push({ channel: "socket", status: "pending", attempts: 0 });
    }

    // ✅ Normalize push payload
    if (push) {
        deliveries.push({ channel: "push", status: "pending", attempts: 0 });
    }

    // ✅ Create notification doc
    const notif = await Notification.create({
        userId,
        userType,
        message,
        deliveries,
        payload: { email, socket, push },
    });

    // ✅ Queue async processing
    await notificationQueue.add(
        { notificationId: notif._id },
        {
            attempts: 3,                // retry 3 times
            backoff: 5000,              // wait 5s before retry
            timeout: 30000,             // fail if running >30s
            removeOnComplete: 3600,     // remove completed job after 1 hour
            removeOnFail: 86400,        // remove failed job after 24 hours
        }
    );

    return notif;
}

export async function sendNotification(payload) {
    try {
        const subscriptions = await pushSubscription.find();
        if (!subscriptions.length) {
            return { success: false, message: "No subscriptions found", results: [] };
        }

        const stringifiedPayload = JSON.stringify(payload);

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: sub.keys,
                        },
                        stringifiedPayload
                    );
                    return { endpoint: sub.endpoint, status: "success" };
                } catch (err) {
                    // Auto-remove expired/invalid subscriptions
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await pushSubscription.deleteOne({ endpoint: sub.endpoint });
                        console.log(`🗑 Removed expired subscription: ${sub.endpoint}`);
                    }
                    return { endpoint: sub.endpoint, status: "failed", error: err.message };
                }
            })
        );

        const successes = results
            .filter(r => r.status === "fulfilled" && r.value.status === "success")
            .map(r => r.value);

        const failures = results
            .filter(r => r.status === "fulfilled" && r.value.status === "failed")
            .map(r => r.value);

        return {
            success: true,
            message: `Sent: ${successes.length}, Failed: ${failures.length}`,
            successes,
            failures
        };

    } catch (err) {
        console.error("Notification error:", err);
        return { success: false, message: err.message, results: [] };
    }
}


export async function sendUserPushNotification(userId, payload) {
    try {
        const subscriptions = await pushSubscription.find({ userId });
        if (!subscriptions.length) {
            return { success: false, message: "No subscriptions found for user", results: [] };
        }

        const stringifiedPayload = JSON.stringify(payload);

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: sub.keys,
                        },
                        stringifiedPayload
                    );
                    return { endpoint: sub.endpoint, status: "success" };
                } catch (err) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await pushSubscription.deleteOne({ endpoint: sub.endpoint });
                        console.log(`🗑 Removed expired subscription: ${sub.endpoint}`);
                    }
                    return { endpoint: sub.endpoint, status: "failed", error: err.message };
                }
            })
        );

        return results;
    } catch (err) {
        console.error("Push error:", err);
        return { success: false, message: err.message };
    }
}
