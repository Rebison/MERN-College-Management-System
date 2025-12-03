import twilioClient from "#config/twilioConfig.js";

// Generate SMS Message
const generateSMSBody = (recipientName, bodyContent, permissionType, permissionTime, instituteName, address) => {
  const currentYear = new Date().getFullYear();

  const footer = `© ${currentYear} ${instituteName}. All rights reserved.${address}`;

  return `Hello ${recipientName},${bodyContent}Permission Type: ${permissionType}Permission Time: ${permissionTime}${footer}`;
};

// Validate phone number
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

// Send SMS Function
const sendSMS = async (to, recipientName, bodyContent, permissionType, permissionTime) => {
  try {
    // Ensure the phone number includes the country code +91
    if (!to.startsWith("+91")) {
      to = `+91${to}`;
    }

    if (!isValidPhoneNumber(to)) {
      throw new Error(`Invalid 'To' Phone Number: ${to}`);
    }

    const instituteName = "BIHER";
    const address = "Chennai, Tamil Nadu";

    // const message = generateSMSBody(recipientName, bodyContent, permissionType, permissionTime, instituteName, address);
    const message = `Test: Hello ${recipientName}, your request is pending.`;

    const smsResponse = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log('SMS sent: ' + to + ' ' + smsResponse.sid);
  } catch (error) {
    if (error.code === 21608) {
      console.error('Error sending SMS: The number is unverified. Verify the number at twilio.com/user/account/phone-numbers/verified or purchase a Twilio number to send messages to unverified numbers.');
    } else {
      console.error('Error sending SMS: ', error);
    }
  }
};

export { sendSMS, generateSMSBody };