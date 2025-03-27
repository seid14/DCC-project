const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendAlert = async (message) => {
  try {
    const phoneNumber = process.env.ADMIN_PHONE_NUMBER;
    if (!phoneNumber) {
      console.log('No admin phone number configured. Skipping SMS alert.');
      return;
    }

    const response = await client.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    console.log('SMS Alert sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS alert:', error);
    throw error;
  }
};

module.exports = {
  sendAlert
}; 