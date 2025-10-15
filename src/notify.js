const axios = require('axios');

async function sendNotification(evaluationUrl, payload) {
  let delay = 1000; // Start with a 1-second delay
  for (let i = 0; i < 5; i++) { // Retry up to 5 times
    try {
      console.log(`Sending notification to ${evaluationUrl}`);
      const response = await axios.post(evaluationUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        console.log('Notification sent successfully.');
        return;
      }
    } catch (error) {
      console.error(`Attempt ${i + 1}: Failed to send notification.`, error.message);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2; // Exponential backoff
  }

  console.error('Failed to send notification after multiple retries.');
}

module.exports = sendNotification;