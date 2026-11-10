import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'credit_card' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Verify all products, price, and stock
    const validatedItems = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.title}". Available: ${product.stock}`,
        });
      }

      const activePrice = product.discountPrice || product.price;
      itemsPrice += activePrice * item.quantity;

      validatedItems.push({
        productId: product._id,
        title: product.title,
        price: activePrice,
        quantity: item.quantity,
        image: product.images[0] || '',
        sellerId: product.sellerId,
      });

      // Decrement inventory stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping & tax
    const shippingPrice = itemsPrice > 50 ? 0 : 9.99;
    const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const orderNumber = `MS-${Date.now().toString().slice(-6)}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const order = await Order.create({
      orderNumber,
      buyerId: req.user._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'paid', // Simulated checkout payment success
      orderStatus: 'placed',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      paidAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email phone')
      .populate('items.productId', 'title images slug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify buyer owns order or is admin or is seller of items
    const isOwner = order.buyerId._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(
      (item) => item.sellerId.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      'items.sellerId': req.user._id,
    })
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
