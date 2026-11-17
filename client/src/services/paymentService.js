import { request } from './api.js';

export const paymentService = {
  createRazorpayOrder: async (orderId) => {
    const res = await request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    return res.data;
  },

  verifyPayment: async ({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const res = await request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    });
    return res.data;
  },

  getPaymentByOrderId: async (orderId) => {
    const res = await request(`/payments/order/${orderId}`);
    return res.data;
  },
};
