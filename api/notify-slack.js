import dotenv from 'dotenv';
dotenv.config();
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Parse service account from env variable (as JSON string)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}
const db = getFirestore();

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

  const { itemId, roomId, itemName, roomName, quantity, minQuantity } = req.body;
  const webhookUrl = process.env.REACT_APP_SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'Slack webhook URL not configured' });
  }
  if (!itemId || !roomId) return res.status(400).json({ error: 'Missing itemId or roomId' });

  // Get item from Firestore
  const itemRef = db.collection('rooms').doc(roomId).collection('items').doc(itemId);
  const itemSnap = await itemRef.get();
  if (!itemSnap.exists) return res.status(404).json({ error: 'Item not found' });

  const itemData = itemSnap.data();
  const lastNotifiedQuantity = itemData.lastNotifiedQuantity;

  // Only notify if below min and different from lastNotifiedQuantity
  if (
    typeof minQuantity === 'number' &&
    typeof quantity === 'number' &&
    quantity < minQuantity &&
    quantity !== lastNotifiedQuantity
  ) {
    // Send Slack notification
    const message = {
      text: `:rotating_light: *LOW STOCK ALERT* :rotating_light: \n\n` +
        `<@U08P9GAUV6Y> <@U08P8G8S6TD>\n\n` +
        `*Shelf:* ${roomName}\n` +
        `*Item:* ${itemName}\n` +
        `*Current Quantity:* ${quantity} (Min: ${minQuantity})`
    };
    try {
      const slackRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      if (!slackRes.ok) throw new Error('Slack webhook failed');

      // Update lastNotifiedQuantity in Firestore
      await itemRef.update({ lastNotifiedQuantity: quantity });

      return res.status(200).json({ success: true, notified: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // No notification needed
    return res.status(200).json({ success: true, notified: false });
  }
}