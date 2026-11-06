// Simulated External Payment Gateway (e.g., Stripe / Razorpay)
const processGatewayPayment = async ({ orderId, amount, paymentMethod, cardDetails, upiId }) => {
  // Simulate network latency of payment gateway
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Generate unique transaction reference
  const prefix = paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'TXN_CARD' : 'PAY';
  const transactionId = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // In COD, payment is marked pending till arrival, others succeed
  const status = paymentMethod === 'cod' ? 'pending' : 'success';

  return {
    success: true,
    transactionId,
    status,
    amount,
    currency: 'USD',
    paymentMethod,
    gateway: 'SecurePay-Gateway-v2',
    timestamp: new Date().toISOString(),
    receiptUrl: `https://payment-gateway.example/receipt/${transactionId}`,
  };
};

module.exports = { processGatewayPayment };
