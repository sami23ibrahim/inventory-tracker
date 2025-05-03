import React from "react";

const WebhookStatus = ({ webhookHealth }) => {
  if (webhookHealth.status === 'unknown') {
    return null;
  }

  const statusStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    zIndex: 1000,
    backgroundColor: webhookHealth.status === 'unhealthy' ? '#ff4444' : '#4CAF50',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <div style={statusStyle}>
      {webhookHealth.status === 'unhealthy' ? (
        <span>⚠️ Slack notifications are not working: {webhookHealth.error}</span>
      ) : (
        <span>✅ Slack notifications are working</span>
      )}
    </div>
  );
};

export default WebhookStatus; 