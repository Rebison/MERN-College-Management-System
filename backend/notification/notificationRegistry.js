// notification/notificationRegistry.js
import { getOtpTemplate, getPasswordChangeDetailsTemplate } from "../emails/templates/authTemplate.js";
import { getFeeVerificationTemplate } from "../emails/templates/feeVerificationTemplate.js";

/**
 * EMAIL templates
 */
const emailTemplates = {
  getOtpTemplate,
  getPasswordChangeDetailsTemplate,
  getFeeVerificationTemplate,
};

/**
 * SOCKET templates
 * - These define the payload shape sent via Socket.IO
 */
const socketTemplates = {
  userWelcome: (data) => ({
    type: "USER_WELCOME",
    title: "Welcome to SRISHTY!",
    body: `Hello ${data.recipientName}, glad to have you onboard.`,
    timestamp: new Date(),
  }),
  feeVerified: (data) => ({
    type: "FEE_VERIFIED",
    title: "Fee Verification Successful",
    body: `Your fee submission ${data.verificationId} has been verified.`,
    timestamp: new Date(),
    link: data.portalLink,
  }),
};

/**
 * PUSH templates
 * - Similar structure, but optimized for mobile/web push
 */
const pushTemplates = {
  passwordChanged: (data) => ({
    title: "Password Updated",
    body: `Your password was changed on ${data.timestamp}`,
    icon: "/icons/security.png",
    data,
  }),
  feeStatus: (data) => ({
    title: "Fee Status Update",
    body: `Your fee submission is now ${data.type}`,
    icon: "/icons/finance.png",
    data,
  }),
};

export const templateRegistry = {
  email: emailTemplates,
  socket: socketTemplates,
  push: pushTemplates,
};

/**
 * Utility to fetch template function safely
 * @param {string} channel - "email" | "socket" | "push"
 * @param {string} template - Template key
 */
export function getTemplate(channel, template) {
  const channelMap = templateRegistry[channel];
  if (!channelMap) throw new Error(`❌ Unknown channel: ${channel}`);

  const fn = channelMap[template];
  if (!fn) throw new Error(`❌ Unknown ${channel} template: ${template}`);

  return fn;
}
