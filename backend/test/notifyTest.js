import { sendCustomEmail } from '../emails/emailService.js';
import { getTemplate } from '../notification/notificationRegistry.js';
import { config } from 'dotenv';

config({ path: "../.env" });

const templateFn = getTemplate('email', 'getFeeVerificationTemplate');

if (typeof templateFn !== 'function') {
  throw new Error("❌ Template function is invalid!");
}

const html = templateFn({ type: 'submitted', recipientName: 'TEST STUDENT' });
console.log('Generated HTML:', html); // check the output

await sendCustomEmail('rebison2@gmail.com', templateFn, { type: 'submitted', recipientName: 'TEST STUDENT' });
console.log('Email sent!');
