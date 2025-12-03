// backend/src/config/webpush.js
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

webpush.setVapidDetails(
    "mailto:rebison85@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default webpush;
