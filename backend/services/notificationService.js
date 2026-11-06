// Simulated SMS & Email Notification Service (e.g., Twilio / SendGrid)
const sendOrderNotification = async ({ type, recipient, orderId, status, details }) => {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[Notification ${type.toUpperCase()}] To: ${recipient} | Order #${orderId} is ${status} at ${timestamp}`;
  console.log(logMessage);

  return {
    delivered: true,
    type,
    recipient,
    orderId,
    messageId: `NOTIF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: 'sent',
    details,
  };
};

module.exports = { sendOrderNotification };
