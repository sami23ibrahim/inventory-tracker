export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemName, roomName, quantity, minQuantity } = req.body;
  const webhookUrl = process.env.REACT_APP_SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'Slack webhook URL not configured' });
  }

  // Match the message format from slack-notify-server.js
  const message = {
    text: `:rotating_light: *LOW STOCK ALERT* :rotating_light: \n\n` +
          `<@U08P9GAUV6Y> <@U08P8G8S6TD>\n\n` +
          `*Room:* ${roomName}\n` +
          `*Item:* ${itemName}\n` +
          `*Current Quantity:* ${quantity}(Min: ${minQuantity})`
  };

  try {
    const slackRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!slackRes.ok) throw new Error('Slack webhook failed');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}