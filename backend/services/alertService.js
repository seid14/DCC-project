const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendAlert = async (report) => {
  try {
    const message = `New report received: ${report.title}\nCategory: ${report.category}\nDescription: ${report.description}`;
    
    await client.messages.create({
      body: message,
      to: process.env.ADMIN_PHONE_NUMBER, // We'll add this to .env
      from: process.env.TWILIO_PHONE_NUMBER
    });

    console.log('Alert sent successfully');
  } catch (error) {
    console.error('Error sending alert:', error);
  }
};

module.exports = { sendAlert }; 