require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const app = express();
const fetch = require('node-fetch');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Get Slack webhook URL from environment variables
const SLACK_WEBHOOK_URL = process.env.REACT_APP_SLACK_WEBHOOK_URL;

app.use(cors());
app.use(express.json());

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

console.log('Starting server with webhook URL:', SLACK_WEBHOOK_URL);

if (!SLACK_WEBHOOK_URL) {
  console.error('Error: SLACK_WEBHOOK_URL environment variable is not set');
  process.exit(1);
}

async function sendSlackMessage(message, retryCount = 0) {
  try {
    console.log('Attempting to send message to Slack:', message);
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Slack response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY * (retryCount + 1)}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return sendSlackMessage(message, retryCount + 1);
    }
    
    return false;
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', lastError: null });
});

app.post('/api/notify-slack', async (req, res) => {
  console.log('Received request:', req.body);
  const { itemName, roomName, quantity, minQuantity } = req.body;
  
  if (!itemName || !roomName || quantity === undefined) {
    console.log('Missing required fields:', { itemName, roomName, quantity });
    return res.status(400).json({ error: 'Missing itemName, roomName, or quantity' });
  }

  const message = {
    text: `:rotating_light: *LOW STOCK ALERT*\n\n` +
          `<@U08P9GAUV6Y> <@U08P8G8S6TD>\n\n` +
          `*Room:* ${roomName}\n` +
          `*Item:* ${itemName}\n` +
          `*Current Quantity:* ${quantity}/${minQuantity}`
  };

  console.log('Sending message to Slack:', message);
  const success = await sendSlackMessage(message);
  
  if (success) {
    console.log('Message sent successfully');
    res.sendStatus(200);
  } else {
    console.log('Failed to send message after retries');
    res.status(500).json({ error: 'Failed to send Slack notification after multiple retries' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Slack notification server running on http://${HOST}:${PORT}`);
}); 