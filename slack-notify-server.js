require('dotenv').config();
const express = require('express');
const app = express();
const fetch = require('node-fetch');

app.use(express.json());

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

if (!SLACK_WEBHOOK_URL) {
  console.error('Error: SLACK_WEBHOOK_URL environment variable is not set');
  process.exit(1);
}

async function sendSlackMessage(message, retryCount = 0) {
  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return sendSlackMessage(message, retryCount + 1);
    }
    
    return false;
  }
}

app.post('/api/notify-slack', async (req, res) => {
  const { itemName, roomName, quantity, minQuantity } = req.body;
  
  if (!itemName || !roomName || quantity === undefined) {
    return res.status(400).json({ error: 'Missing itemName, roomName, or quantity' });
  }

  const message = {
    text: `:rotating_light: *LOW STOCK ALERT*\n\n` +
          `<@U08P9GAUV6Y> <@U08P8G8S6TD>\n\n` +
          `*Room:* ${roomName}\n` +
          `*Item:* ${itemName}\n` +
          `*Current Quantity:* ${quantity}/${minQuantity}`
  };

  const success = await sendSlackMessage(message);
  
  if (success) {
    res.sendStatus(200);
  } else {
    res.status(500).json({ error: 'Failed to send Slack notification after multiple retries' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Slack notification server running on port ${PORT}`);
}); 