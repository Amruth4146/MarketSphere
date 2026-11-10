import { Order } from '../models/Order.js';
import { VendorOrder } from '../models/VendorOrder.js';
import { Commission } from '../models/Commission.js';
import { Product } from '../models/Product.js';
import { Vendor } from '../models/Vendor.js';
import { Coupon } from '../models/Coupon.js';
import { config } from '../config/env.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'razorpay', couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required' });
    }

    // Validate products, active INR prices, and inventory stock
    const validatedItems = [];
    const vendorGroupMap = new Map();
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
      const itemSubtotal = activePrice * item.quantity;
      itemsPrice += itemSubtotal;

      const orderItem = {
        productId: product._id,
        title: product.title,
        price: activePrice,
        quantity: item.quantity,
        image: product.images[0] || '',
        sku: product.sku || '',
        vendorId: product.vendorId,
      };

      validatedItems.push(orderItem);

      // Group by vendor
      const vId = product.vendorId.toString();
      if (!vendorGroupMap.has(vId)) {
        vendorGroupMap.set(vId, []);
      }
      vendorGroupMap.get(vId).push(orderItem);

      // Decrement inventory stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Coupon discount calculation
    let discountAmount = 0;
    let couponMeta = { code: '', discount: 0 };
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const check = coupon.isValidForOrder(itemsPrice);
        if (check.valid) {
          discountAmount = coupon.calculateDiscount(itemsPrice);
          couponMeta = { code: coupon.code, discount: discountAmount };
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Indian E-Commerce Shipping & GST calculation (configured on backend)
    const freeShippingThreshold = config.currency.freeShippingThreshold;
    const shippingPrice = itemsPrice >= freeShippingThreshold ? 0 : config.currency.defaultShippingFee;
    const gstRate = config.currency.defaultGstPercent / 100;
    const taxableSubtotal = Math.max(0, itemsPrice - discountAmount);
    const taxPrice = Math.round(taxableSubtotal * gstRate * 100) / 100;
    const totalPrice = Math.round((taxableSubtotal + shippingPrice + taxPrice) * 100) / 100;

    const orderNumber = `MS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create parent Order
    const parentOrder = await Order.create({
      orderNumber,
      customerId: req.user._id,
      items: validatedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || req.user.name,
        phone: shippingAddress.phone || req.user.phone || '',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || 'Maharashtra',
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India',
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'placed',
      currency: 'INR',
      itemsPrice: Math.round(itemsPrice * 100) / 100,
      shippingPrice: Math.round(shippingPrice * 100) / 100,
      taxPrice,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalPrice,
      couponApplied: couponMeta,
      paidAt: paymentMethod === 'cod' ? null : new Date(),
    });

    // Create Vendor-specific suborders (VendorOrder) & Commission records
    const vendorOrderIds = [];
    let subOrderIndex = 1;

    for (const [vendorUserId, vendorItems] of vendorGroupMap.entries()) {
      const vendorRecord = await Vendor.findOne({ userId: vendorUserId });
      const commissionRate = vendorRecord?.commissionRate || config.currency.defaultCommissionPercent;

      const vendorSubtotal = vendorItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
      const commissionAmount = Math.round(vendorSubtotal * (commissionRate / 100) * 100) / 100;
      const gstOnCommission = Math.round(commissionAmount * 0.18 * 100) / 100;
      const vendorPayoutAmount = Math.round((vendorSubtotal - commissionAmount - gstOnCommission) * 100) / 100;

      const vendorOrderNumber = `${orderNumber}-V${subOrderIndex++}`;

      const vendorSuborder = await VendorOrder.create({
        vendorOrderNumber,
        parentOrderId: parentOrder._id,
        vendorId: vendorUserId,
        customerId: req.user._id,
        items: vendorItems,
        subtotal: Math.round(vendorSubtotal * 100) / 100,
        shippingFee: 0,
        taxAmount: Math.round(vendorSubtotal * gstRate * 100) / 100,
        vendorTotal: Math.round(vendorSubtotal * 100) / 100,
        commissionRate,
        commissionAmount,
        vendorPayoutAmount,
        orderStatus: 'placed',
        paymentStatus: parentOrder.paymentStatus,
      });

      vendorOrderIds.push(vendorSuborder._id);

      // Record platform commission
      await Commission.create({
        orderId: parentOrder._id,
        vendorOrderId: vendorSuborder._id,
        vendorId: vendorUserId,
        grossAmount: Math.round(vendorSubtotal * 100) / 100,
        commissionRate,
        commissionAmount,
        gstOnCommission,
        netVendorPayout: vendorPayoutAmount,
        status: 'pending',
      });
    }

    // Attach suborders to parent order
    parentOrder.vendorOrders = vendorOrderIds;
    await parentOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: parentOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('vendorOrders')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('vendorOrders')
      .populate('items.productId', 'title images slug sku');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomerOwner = order.customerId._id.toString() === req.user._id.toString();
    const isVendorForOrder = order.items.some(
      (item) => item.vendorId.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isCustomerOwner && !isVendorForOrder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Not authorized to view this order',
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getVendorOrders = async (req, res, next) => {
  try {
    const vendorSuborders = await VendorOrder.find({ vendorId: req.user._id })
      .populate('customerId', 'name email phone')
      .populate('parentOrderId', 'orderNumber shippingAddress paymentMethod paymentStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: vendorSuborders });
  } catch (error) {
    next(error);
  }
};

export const updateVendorOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const vendorOrder = await VendorOrder.findById(req.params.id);

    if (!vendorOrder) {
      return res.status(404).json({ success: false, message: 'Vendor suborder not found' });
    }

    if (vendorOrder.vendorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Not authorized for this suborder' });
    }

    if (status) vendorOrder.orderStatus = status;
    if (trackingNumber) vendorOrder.trackingNumber = trackingNumber;
    if (status === 'delivered') vendorOrder.deliveredAt = new Date();

    await vendorOrder.save();

    res.status(200).json({
      success: true,
      message: 'Suborder status updated successfully',
      data: vendorOrder,
    });
  } catch (error) {
    next(error);
  }
};
