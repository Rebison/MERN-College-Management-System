import TelegramBot from "node-telegram-bot-api";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import {
  getStatus,
  enableMaintenance as enableService,
  disableMaintenance as disableService,
  scheduleMaintenance as scheduleService,
  refreshStatus as refreshService
} from "./maintenanceService.js";
import dayjs from "dayjs";
import { sendNotification } from "./notificationService.js";

const isProduction = process.env.NODE_ENV === "production";

const token = isProduction ? process.env.BOT_TOKEN_PROD : process.env.BOT_TOKEN_DEV;
const bot = new TelegramBot(token, { polling: true });

const ADMIN_CHAT_IDS = process.env.ADMIN_CHAT_IDS.split(",").map(id => id.trim());
const BOT_USERNAME = isProduction ? "Server_touch_bot" : "Server_Admin_Dev_Bot";

function isAuthorized(chatId) {
  return ADMIN_CHAT_IDS.includes(chatId.toString());
}

function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}


async function sendTestNotification(chatId, message = "This is a test notification!") {
  const payload = {
    title: "🚀 Notification",
    body: message,
    icon: "/icons/notification.png",
    data: { url: "/" } // optional link
  };

  const result = await sendNotification(payload);

  if (result.success) {
    let responseMsg = `🔔 *Notification Results*\n\n✅ Sent: ${result.successes.length}\n❌ Failed: ${result.failures.length}`;

    if (result.failures.length > 0) {
      responseMsg += `\n\n⚠️ *Failed Endpoints*:\n${result.failures
        .map(f => `\\- ${escapeMarkdownV2(f.endpoint)} (${escapeMarkdownV2(f.error)})`)
        .join("\n")}`;
    }

    bot.sendMessage(chatId, responseMsg, { parse_mode: "MarkdownV2" });
  } else {
    bot.sendMessage(chatId, `❌ Notification error: ${result.message}`);
  }
}

const execAsync = promisify(exec);

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2); // MB
}

function escapeMarkdown(text) {
  // escape characters for Telegram Markdown
  return text.replace(/([_\*\[\]\(\)~`>#+\-=|{}\.!])/g, "\\$1");
}

function getNetworkInfo() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.family === "IPv4") {
        results.push(`${name}: ${net.address}`);
      }
    }
  }
  return results.join("\n") || "No external IPs";
}

async function getDiskUsage() {
  try {
    const platform = os.platform();
    if (platform === "win32") {
      const { stdout } = await execAsync("wmic logicaldisk get size,freespace,caption");
      const lines = stdout.trim().split("\n").slice(1);
      const disks = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 3) return null;
        const free = parseInt(parts[1]);
        const total = parseInt(parts[2]);
        const used = total - free;
        const percent = ((used / total) * 100).toFixed(2);
        return `${parts[0]}: ${formatBytes(used)}MB / ${formatBytes(total)}MB (${percent}%)`;
      }).filter(Boolean);
      return disks.join("\n");
    } else {
      const { stdout } = await execAsync("df -k /");
      const lines = stdout.trim().split("\n");
      const [_, size, used] = lines[1].split(/\s+/);
      const percent = ((used / size) * 100).toFixed(2);
      return `${(used / 1024).toFixed(2)}MB / ${(size / 1024).toFixed(2)}MB (${percent}%)`;
    }
  } catch {
    return "Disk info unavailable";
  }
}

async function getProcessCount() {
  try {
    const platform = os.platform();
    if (platform === "win32") {
      const { stdout } = await execAsync("wmic process get name");
      return stdout.trim().split("\n").length - 1;
    } else {
      const { stdout } = await execAsync("ps -e --no-headers | wc -l");
      return stdout.trim();
    }
  } catch {
    return "N/A";
  }
}

async function getSwapUsage() {
  try {
    const platform = os.platform();
    if (platform === "win32") {
      const { stdout } = await execAsync("wmic pagefile get AllocatedBaseSize,CurrentUsage");
      const lines = stdout.trim().split("\n").slice(1);
      const total = parseInt(lines[0].split(/\s+/)[0]) * 1024 * 1024;
      const used = parseInt(lines[0].split(/\s+/)[1]) * 1024 * 1024;
      const percent = ((used / total) * 100).toFixed(2);
      return `${formatBytes(used)}MB / ${formatBytes(total)}MB (${percent}%)`;
    } else {
      const { stdout } = await execAsync("free -b | grep Swap");
      const parts = stdout.trim().split(/\s+/);
      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const percent = ((used / total) * 100).toFixed(2);
      return `${formatBytes(used)}MB / ${formatBytes(total)}MB (${percent}%)`;
    }
  } catch {
    return "Swap info unavailable";
  }
}

async function getTopProcesses() {
  try {
    const platform = os.platform();
    if (platform === "win32") {
      // Use PowerShell for accurate memory usage
      const { stdout } = await execAsync(
        "powershell -Command \"Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 Name,WorkingSet | ConvertTo-Json\""
      );
      const procs = JSON.parse(stdout);
      return procs
        .map(p => `${escapeMarkdown(p.Name)}: ${(p.WorkingSet / 1024 / 1024).toFixed(2)}MB`)
        .join("\n");
    } else {
      // Linux/macOS
      const { stdout } = await execAsync('ps -eo comm,rss --sort=-rss | head -n 6');
      const lines = stdout.trim().split("\n").slice(1);
      return lines.map(line => {
        const [name, rss] = line.trim().split(/\s+/);
        return `${escapeMarkdown(name)}: ${(parseInt(rss) / 1024).toFixed(2)}MB`;
      }).join("\n");
    }
  } catch (err) {
    console.error("Top process error:", err);
    return "Top processes unavailable";
  }
}

async function getCpuUsage() {
  try {
    if (os.platform() === "win32") {
      // Try WMIC first
      const { stdout } = await execAsync("wmic cpu get LoadPercentage /value");
      const match = stdout.replace(/\r|\n/g, "").match(/LoadPercentage=(\d+)/);
      if (match) {
        return `${match[1]}%`;
      }

      // Fallback to PowerShell Get-CimInstance
      const { stdout: psOut } = await execAsync(
        "powershell -Command \"(Get-CimInstance Win32_Processor).LoadPercentage\""
      );
      if (psOut && psOut.trim().length) {
        return `${psOut.trim()}%`;
      }

      return "CPU usage unavailable";
    } else {
      // Linux/macOS → loadavg
      const load = os.loadavg();
      return load.map(l => l.toFixed(2)).join(" / ") + " (1/5/15 min)";
    }
  } catch (err) {
    console.error("CPU usage error:", err);
    return "CPU usage unavailable";
  }
}

// Track current alert states
const alertState = {
  cpu: false,
  memory: false,
  disks: {} // per drive
};

function addAlerts({ cpuUsage, memPercent, disks }) {
  const alerts = [];
  const recoveries = [];

  // CPU check
  if (cpuUsage !== "CPU usage unavailable") {
    const cpuVal = parseFloat(cpuUsage.replace("%", ""));
    if (cpuVal > 85 && !alertState.cpu) {
      alerts.push(`⚠️ *High CPU Load*: ${cpuVal}%`);
      alertState.cpu = true;
    } else if (cpuVal <= 75 && alertState.cpu) {
      recoveries.push(`✅ *CPU Load Normalized*: ${cpuVal}%`);
      alertState.cpu = false;
    }
  }

  // Memory check
  if (parseFloat(memPercent) > 90 && !alertState.memory) {
    alerts.push(`🛑 *Critical Memory Usage*: ${memPercent}%`);
    alertState.memory = true;
  } else if (parseFloat(memPercent) <= 80 && alertState.memory) {
    recoveries.push(`✅ *Memory Normalized*: ${memPercent}%`);
    alertState.memory = false;
  }

  // Disk check
  disks.split("\n").forEach(line => {
    const match = line.match(/^(.+?): .* \(([\d.]+)%\)/);
    if (match) {
      const drive = match[1];
      const percent = parseFloat(match[2]);

      if (percent > 80 && !alertState.disks[drive]) {
        alerts.push(`💽 *Disk Critical*: ${line}`);
        alertState.disks[drive] = true;
      } else if (percent <= 75 && alertState.disks[drive]) {
        recoveries.push(`✅ *Disk Normalized*: ${line}`);
        alertState.disks[drive] = false;
      }
    }
  });

  return { alerts, recoveries };
}


export async function sendServerStatus(chatId) {
  try {
    const uptime = formatUptime(os.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = ((usedMem / totalMem) * 100).toFixed(2);

    const cpuLoad = os.loadavg();
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const cpuModel = cpus[0].model;
    const cpuSpeed = cpus[0].speed;

    const platform = os.platform();
    const arch = os.arch();
    const release = os.release();
    const hostname = os.hostname();
    const nodeVersion = process.version;
    const networkInfo = getNetworkInfo();

    const [diskUsage, processCount, swapUsage, topProcesses, cpuUsage] = await Promise.all([
      getDiskUsage(),
      getProcessCount(),
      getSwapUsage(),
      getTopProcesses(),
      getCpuUsage()
    ]);

    const message = `
📊 *Server Status*

🕒 *Uptime:* ${uptime}
💾 *Memory:* ${formatBytes(usedMem)}MB / ${formatBytes(totalMem)}MB used (${memPercent}%)
💽 *Swap Usage:* ${swapUsage}
⚙ *CPU:* ${cpuModel} @ ${cpuSpeed}MHz, ${cpuCount} cores
📊 *CPU Usage:* ${cpuUsage}
💽 *Disk Usage:* ${diskUsage}
🌐 *Network:* 
${networkInfo}
📄 *Processes:* ${processCount}
🔥 *Top 5 Memory Processes:*
${topProcesses}
🖥 *OS:* ${platform} ${arch}, Release: ${release}, Host: ${hostname}
🟢 *Node.js Version:* ${nodeVersion}
`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Failed to fetch server status:", err);
    await bot.sendMessage(chatId, "⚠️ Failed to fetch server status", { parse_mode: "Markdown" });
  }
}

async function checkMaintenance(chatId) {
  try {
    const data = await getStatus();
    if (data.maintenance) {
      bot.sendMessage(
        chatId,
        `⚠ *Maintenance Mode Active*\n📝 Message: ${data.message || "No message"}`,
        { parse_mode: "Markdown" }
      );
    } else {
      bot.sendMessage(chatId, "✅ *Server is Online*", { parse_mode: "Markdown" });
    }
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error checking maintenance: ${err.message}`);
  }
}

async function enableMaintenance(chatId, message = "The system is under maintenance.") {
  try {
    await enableService(message);
    bot.sendMessage(chatId, "✅ Maintenance mode ENABLED 🛠");
  } catch (err) {
    bot.sendMessage(chatId, `❌ Failed to enable maintenance: ${err.message}`);
  }
}

async function disableMaintenance(chatId) {
  try {
    await disableService();
    bot.sendMessage(chatId, "✅ Maintenance mode DISABLED ✅");
  } catch (err) {
    bot.sendMessage(chatId, `❌ Failed to disable maintenance: ${err.message}`);
  }
}

async function scheduleMaintenance(chatId, startTime, endTime, message) {
  try {
    const start = dayjs(startTime, "YYYY-MM-DD HH:mm", true);
    const end = dayjs(endTime, "YYYY-MM-DD HH:mm", true);

    if (!start.isValid() || !end.isValid()) {
      return bot.sendMessage(chatId, "❌ Invalid date format. Use `YYYY-MM-DD HH:mm`.");
    }

    if (end.isBefore(start)) {
      return bot.sendMessage(chatId, "❌ End time must be after start time.");
    }

    await scheduleService(start.toISOString(), end.toISOString(), message);
    bot.sendMessage(
      chatId,
      `📅 Maintenance scheduled:\nFrom: ${start.format("YYYY-MM-DD HH:mm")}\nTo: ${end.format("YYYY-MM-DD HH:mm")}`
    );
  } catch (err) {
    bot.sendMessage(chatId, `❌ Failed to schedule maintenance: ${err.message}`);
  }
}

async function refreshMaintenance(chatId) {
  try {
    await refreshService();
    bot.sendMessage(chatId, "🔄 Maintenance status refreshed successfully.");
  } catch (err) {
    bot.sendMessage(chatId, `❌ Failed to refresh maintenance: ${err.message}`);
  }
}

bot.onText(new RegExp(`^/start(?:@${BOT_USERNAME})?$`), (msg) => {
  const chatId = msg.chat.id;
  if (!isAuthorized(chatId)) {
    return bot.sendMessage(chatId, "❌ You are not authorized to use this bot.");
  }
  const userName = msg.from.first_name || "User";

  bot.sendMessage(chatId, `Welcome ${userName} to the Server Status Bot! 🚀`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📊 Check Server Status", callback_data: "check_status" }],
        [{ text: "🛠 Maintenance Status", callback_data: "check_maintenance" }],
        [{ text: "🔒 Enable Maintenance", callback_data: "enable_maintenance" }],
        [{ text: "🔓 Disable Maintenance", callback_data: "disable_maintenance" }],
        [{ text: "🗓 Schedule Maintenance", callback_data: "schedule_maintenance" }],
        [{ text: "🔄 Refresh Maintenance", callback_data: "refresh_maintenance" }],
        [{ text: "🔔 Send Test Notification", callback_data: "test_notification" }],
      ]
    }
  });
});

bot.onText(new RegExp(`^/status(?:@${BOT_USERNAME})?$`), (msg) => {
  if (isAuthorized(msg.chat.id)) sendServerStatus(msg.chat.id);
});

bot.onText(new RegExp(`^/maintenance(?:@${BOT_USERNAME})?$`), (msg) => {
  if (isAuthorized(msg.chat.id)) checkMaintenance(msg.chat.id);
});

bot.onText(new RegExp(`^/maintenance_on(?:@${BOT_USERNAME})?(?: (.+))?$`), (msg, match) => {
  if (isAuthorized(msg.chat.id)) {
    const message = match?.[1]?.trim() || "The system is under maintenance.";
    enableMaintenance(msg.chat.id, message);
  }
});

bot.onText(new RegExp(`^/maintenance_off(?:@${BOT_USERNAME})?$`), (msg) => {
  if (isAuthorized(msg.chat.id)) disableMaintenance(msg.chat.id);
});

bot.onText(new RegExp(`^/sh(?:@${BOT_USERNAME})?\\s+(.+)$`), (msg, match) => {
  const command = match[1];

  exec(command, (err, stdout, stderr) => {
    bot.sendMessage(msg.chat.id, `Echo: ${command}\n${stdout || stderr || err?.toString()}`);
  });
});

bot.onText(new RegExp(`^/notify(?:@${BOT_USERNAME})?(?: (.+))?$`), (msg, match) => {
  if (!isAuthorized(msg.chat.id)) return;

  const customMessage = match?.[1]?.trim() || "Hello from your server!";
  sendTestNotification(msg.chat.id, customMessage);
});

bot.onText(new RegExp(`^/schedule(?:@${BOT_USERNAME})? (\\S+) (\\S+) (.+)?$`), (msg, match) => {
  if (isAuthorized(msg.chat.id)) {
    scheduleMaintenance(msg.chat.id, match[1], match[2], match[3]);
  }
});

bot.onText(new RegExp(`^/refresh(?:@${BOT_USERNAME})?$`), (msg) => {
  if (isAuthorized(msg.chat.id)) refreshMaintenance(msg.chat.id);
});

bot.onText(new RegExp(`^/help(?:@${BOT_USERNAME})?$`), (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `
📌 *Server Bot Commands*

/status \\- Get current server status \\(uptime, memory, CPU load\\)
/maintenance \\- Check if maintenance mode is active
/maintenance\\_on \\[message\\] \\- Enable maintenance mode with an optional message
/maintenance\\_off \\- Disable maintenance mode
/schedule \\<start\\> \\<end\\> \\<message\\> \\- Schedule maintenance with start\\/end time and message
/refresh \\- Refresh maintenance status cache
/help \\- Show this help message

💡 *Inline Buttons*:
📊 Check Server Status \\- Shows server stats
🛠 Maintenance Status \\- Shows maintenance info
🔒 Enable Maintenance \\- Enable maintenance mode
🔓 Disable Maintenance \\- Disable maintenance mode
🗓 Schedule Maintenance \\- Instructions to schedule maintenance
🔄 Refresh Maintenance \\- Refresh the maintenance status cache
`;
  bot.sendMessage(chatId, helpMessage, { parse_mode: "MarkdownV2" });
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  if (!isAuthorized(chatId)) return bot.answerCallbackQuery(query.id, { text: "Unauthorized" });

  switch (query.data) {
    case "check_status": sendServerStatus(chatId); break;
    case "check_maintenance": checkMaintenance(chatId); break;
    case "enable_maintenance": enableMaintenance(chatId); break;
    case "disable_maintenance": disableMaintenance(chatId); break;
    case "schedule_maintenance":
      bot.sendMessage(chatId, "Usage:\n/schedule 2025-08-15T10:00 2025-08-15T12:00 Optional message");
      break;
    case "test_notification":
      sendTestNotification(chatId);
      break;
    case "refresh_maintenance": refreshMaintenance(chatId); break;
  }
  bot.answerCallbackQuery(query.id);
});

setInterval(async () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = ((usedMem / totalMem) * 100).toFixed(2);

  const cpuUsage = await getCpuUsage();
  const diskUsage = await getDiskUsage();

  const { alerts, recoveries } = addAlerts({ cpuUsage, memPercent, disks: diskUsage });

  if (alerts.length) {
    bot.sendMessage(
      ADMIN_CHAT_IDS[0],
      `🚨 *Server Alert* 🚨\n\n${alerts.join("\n")}`,
      { parse_mode: "Markdown" }
    );
  }

  if (recoveries.length) {
    bot.sendMessage(
      ADMIN_CHAT_IDS,
      `✅ *Recovery Notice* ✅\n\n${recoveries.join("\n")}`,
      { parse_mode: "Markdown" }
    );
  }
}, 5 * 60 * 1000); // every 5 minutes


export default bot;
