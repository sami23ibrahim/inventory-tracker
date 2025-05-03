const fetch = require('node-fetch');
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

(async () => {
  const message = { text: "Test from app notification" };
  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  const text = await response.text();
  console.log('Slack response:', text);
})();