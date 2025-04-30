import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());

// Configure CORS to allow requests from your local network
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.100.31:3000'],
  methods: ['POST'],
  credentials: true
}));

const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

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
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' }
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send Slack notification' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Slack notify server running on port ${PORT}`);
}); 