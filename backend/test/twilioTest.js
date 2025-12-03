import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('TWILIO_ACCOUNT_SID:', accountSid);
console.log('TWILIO_AUTH_TOKEN:', authToken);

const client = new twilio(accountSid, authToken);

const phoneNumbers = [
  '+918220335509',
  '+917200317690',
  '+917305549504',
  '+919566049060',
  '+918610315507',
  '+919789837493'
];

phoneNumbers.forEach(number => {
  client.messages
    .create({
      body: 'Hello this is Balaji Test for BIHER ERP OTP',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: number
    })
    .then(message => console.log(`Message sent to ${number} with SID: ${message.body}`))
    .catch(error => console.error(`Failed to send message to ${number}: ${error.message}`));
});
