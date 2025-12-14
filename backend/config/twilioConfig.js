import twilio from 'twilio';

// Twilio Configuration
const twilioClient = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default twilioClient;
