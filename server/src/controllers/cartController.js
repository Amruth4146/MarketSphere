import { Product } from '../models/Product.js';
import { config } from '../config/env.js';

export const validateCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    const validatedItems = [];
    let itemsPrice = 0;
    const warnings = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'published') {
        warnings.push(`Item "${item.title || item.productId}" is no longer available.`);
        continue;
      }

      const availableStock = product.stock;
      const requestedQty = Math.max(1, parseInt(item.quantity, 10));
      const adjustedQty = Math.min(requestedQty, availableStock);

      if (adjustedQty < requestedQty) {
        warnings.push(`Only ${availableStock} units of "${product.title}" are in stock.`);
      }

      if (availableStock === 0) {
        warnings.push(`"${product.title}" is currently out of stock.`);
        continue;
      }

      const activePrice = product.discountPrice || product.price;
      itemsPrice += activePrice * adjustedQty;

      validatedItems.push({
        productId: product._id,
        title: product.title,
        price: activePrice,
        originalPrice: product.discountPrice ? product.price : null,
        image: product.images[0] || '',
        stock: product.stock,
        slug: product.slug,
        vendorId: product.vendorId,
        quantity: adjustedQty,
      });
    }

    const freeShippingThreshold = config.currency.freeShippingThreshold;
    const shippingPrice = itemsPrice >= freeShippingThreshold || itemsPrice === 0 ? 0 : config.currency.defaultShippingFee;
    const gstRate = config.currency.defaultGstPercent / 100;
    const taxPrice = Math.round(itemsPrice * gstRate * 100) / 100;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        items: validatedItems,
        warnings,
        subtotal: Math.round(itemsPrice * 100) / 100,
        shippingPrice,
        taxPrice,
        totalPrice,
        freeShippingThreshold,
        currency: 'INR',
      },
    });
  } catch (error) {
    next(error);
  }
};
