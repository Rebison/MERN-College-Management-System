// backend/src/routes/push.js
import express from "express";
import webpush from "#config/webpush.js";
import pushSubscription from "#models/pushSubscription.js";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
    const { subscription } = req.body;
    const { id: userId, userType } = req.user;

    if (!userId || !userType || !subscription?.endpoint) {
        return res.status(400).json({ error: "Invalid subscription data" });
    }

    try {
        await pushSubscription.findOneAndUpdate(
            { userId, endpoint: subscription.endpoint }, // match unique index
            {
                userId,
                userType, // still update this if it changes
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "Subscription saved" });
    } catch (err) {
        console.error("Error saving subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// Trigger notification
router.post("/notify", async (req, res) => {
    const { title, body } = req.body;

    const payload = JSON.stringify({ title, body });

    try {
        await Promise.all(
            subscriptions.map(sub => webpush.sendNotification(sub, payload))
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send notification" });
    }
});

export default router;
