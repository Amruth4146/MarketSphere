import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { getRazorpayClient, verifyRazorpaySignature } from '../config/razorpay.js';
import { config } from '../config/env.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const amountInPaise = Math.round(order.totalPrice * 100);
    const razorpay = getRazorpayClient();

    let razorpayOrder;
    if (razorpay) {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${order.orderNumber}`,
        notes: {
          orderId: order._id.toString(),
          customerId: req.user._id.toString(),
        },
      });
    } else {
      // Mock / Test order creation when credentials not set
      razorpayOrder = {
        id: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created',
      };
    }

    // Save initial Payment record
    const payment = await Payment.create({
      orderId: order._id,
      customerId: req.user._id,
      paymentGateway: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalPrice,
      currency: 'INR',
      status: 'created',
      receipt: `receipt_${order.orderNumber}`,
    });

    res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: config.razorpay.keyId || 'rzp_test_mock',
        paymentId: payment._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'captured',
      },
      { new: true }
    );

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      paidAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentByOrderId = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
