// backend/src/config/webpush.js
import webpush from "web-push";

webpush.setVapidDetails(
    "mailto:rebison85@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default webpush;
