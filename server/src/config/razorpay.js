import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from './env.js';

let razorpayInstance = null;

export const getRazorpayClient = () => {
  if (!razorpayInstance) {
    if (config.razorpay.keyId && config.razorpay.keySecret) {
      razorpayInstance = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
      console.log('[Razorpay] Client initialized with credentials');
    } else {
      console.warn('[Razorpay] Keys not configured. Operating in mock/test mode.');
    }
  }
  return razorpayInstance;
};

/**
 * Verifies Razorpay payment signature using HMAC SHA256
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  if (!config.razorpay.keySecret) {
    // In local development test mode without credentials
    return true;
  }
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};
