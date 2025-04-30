import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { config } from './config.js';

const app = express();
app.use(express.json());

// Configure CORS to allow requests from your local network
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.100.31:3000'],
  methods: ['POST'],
  credentials: true
}));

app.post('/api/notify-slack', async (req, res) => {
  console.log('Received notification request:', req.body);
  console.log('Request headers:', req.headers);
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
  
  try {
    const response = await fetch(config.slackWebhookUrl, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Slack response status:', response.status);
    if (!response.ok) {
      throw new Error(`Slack API returned ${response.status}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Failed to send Slack notification:', err);
    res.status(500).json({ 
      error: 'Failed to send Slack notification',
      details: err.message
    });
  }
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Slack notify server running on port ${PORT}`);
}); 