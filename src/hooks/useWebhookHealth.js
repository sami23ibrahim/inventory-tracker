import { useState, useEffect, useCallback } from "react";

export default function useWebhookHealth() {
  const [webhookHealth, setWebhookHealth] = useState({ status: 'unknown', error: null });

  const checkWebhookHealth = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/api/health');
      const data = await response.json();
      setWebhookHealth({
        status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
        error: data.lastError
      });
    } catch (error) {
      setWebhookHealth({
        status: 'unhealthy',
        error: 'Failed to connect to notification server'
      });
      console.error('Failed to check webhook health:', error);
    }
  }, []);

  useEffect(() => {
    checkWebhookHealth();
    const interval = setInterval(checkWebhookHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkWebhookHealth]);

  return { webhookHealth, checkWebhookHealth };
} 