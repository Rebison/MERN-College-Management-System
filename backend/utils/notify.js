import fetch from "node-fetch";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

export async function slackAlert(text) {
  if (!SLACK_WEBHOOK) return;
  try {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  } catch (e) {
    logger.error("Slack alert failed", { message: e.message });
  }
}

export async function telegramAlert(text, options = {}) {
  if (!TG_TOKEN || !TG_CHAT_ID) {
    logger.warn("Telegram credentials not configured. Skipping alert.");
    return;
  }

  const payload = {
    chat_id: TG_CHAT_ID,
    text: text || "(No message provided)",
    parse_mode: options.parseMode || "Markdown",
    disable_web_page_preview: options.disablePreview ?? true
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error("Telegram API error", { status: res.status, body: errText });
    }
  } catch (e) {
    logger.error("Telegram alert failed", { message: e.message });
  }
}
