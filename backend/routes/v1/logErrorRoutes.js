// routes/logError.js
import { telegramAlert } from "../../utils/notify.js";
import { Log } from "#models/index.js";
import logger from "../../utils/logger.js";
import express from "express";

const router = express.Router();

function escapeHTML(text) {
    if (text === undefined || text === null) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Helper: truncate safely
function truncateText(str, maxLength = 3500) {
    if (!str) return "";
    return str.length > maxLength ? str.slice(0, maxLength) + "\n... [truncated]" : str;
}

router.post("/createLog", async (req, res) => {
    try {
        const body = req.body || {};
        const timestamp = new Date().toISOString();

        const clientIp =
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket?.remoteAddress ||
            "Unknown IP";

        // Save full payload to DB
        const doc = await Log.create({
            level: body.level || "error",
            message: body.message,
            stack: body.stack,
            error: body.error || {},
            meta: body.meta || {},
            userId: body.userId || req.user?.id || null,
            route: body.route || req.headers.referer,
            method: body.method || "CLIENT",
            requestId: req.requestId || null
        });

        logger.error("Frontend error captured", { id: doc._id, requestId: req.requestId });

        if (process.env.ALERT_UI_ERRORS === "true") {
            // --- Compact summary (always sent) ---
            let summaryMessage = `
🚨 <b>Frontend Error</b>
<b>Message:</b> ${escapeHTML(body.message || "No message")}
<b>Route:</b> ${escapeHTML(body.route || "N/A")}
<b>Method:</b> ${escapeHTML(body.method || req.method || "CLIENT")}
<b>Request ID:</b> ${escapeHTML(req.requestId || "N/A")}
<b>User ID:</b> ${escapeHTML(body?.userId || req.user?.id || "N/A")}
<b>User Type:</b> ${escapeHTML(body?.userType || req.user?.userType || "N/A")}
<b>Timestamp:</b> ${escapeHTML(timestamp)}
<b>IP:</b> ${escapeHTML(clientIp)}
      `.trim();

            await telegramAlert(summaryMessage, { parseMode: "HTML" });

            // --- Detailed info (truncated) ---
            const rawError = body.error || {};
            let detailsMessage = `
<b>Stack Trace:</b>
<pre>${escapeHTML(truncateText(body.stack || "No stack trace"))}</pre>

<b>Raw Error Object:</b>
<pre>${escapeHTML(truncateText(JSON.stringify(rawError, null, 2)))}</pre>
      `.trim();

            await telegramAlert(detailsMessage, { parseMode: "HTML" });
        }

        res.status(201).json({ ok: true });
    } catch (err) {
        logger.error("Failed to save frontend log", { message: err.message, stack: err.stack });
        res.status(500).json({ ok: false });
    }
});

export default router;
