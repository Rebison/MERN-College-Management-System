// sendTestPush.js
import mongoose from "mongoose";
import webpush from "web-push";
import dotenv from "dotenv";

// Load env vars
dotenv.config({path: "../.env"});

// --- Replace with your model import ---
import pushSubscription from "../models/pushSubscription.js";

// Setup VAPID keys (must match frontend)
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/linchpin";

async function sendTest() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch one subscription (adjust query as needed)
    const sub = await pushSubscription.findOne();
    if (!sub) {
      console.log("⚠️ No subscription found in DB");
      return;
    }

    console.log("📌 Using subscription:", sub.endpoint);

    const payload = JSON.stringify({
      title: "Hello 👋",
      body: "This is a test push notification",
    });

    const subscription = {
      endpoint: sub.endpoint,
      keys: sub.keys,
    };

    await webpush.sendNotification(subscription, payload);
    console.log("✅ Push notification sent successfully");

  } catch (err) {
    console.error("❌ Error sending notification:", err);
  } finally {
    mongoose.connection.close();
  }
}

sendTest();
