import { request } from './api.js';

export const orderService = {
  createOrder: async (orderPayload) => {
    const res = await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return res.data;
  },

  getMyOrders: async () => {
    const res = await request('/orders/my');
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await request(`/orders/${id}`);
    return res.data;
  },
};

