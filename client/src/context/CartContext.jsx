import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('marketsphere_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('marketsphere_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const pId = product._id || product.productId;
      const existing = prev.find((item) => item.productId === pId);
      const activePrice = product.discountPrice || product.price;

      if (existing) {
        return prev.map((item) =>
          item.productId === pId
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, item.stock || 99),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: pId,
          title: product.title,
          price: activePrice,
          originalPrice: product.discountPrice ? product.price : null,
          image: product.images?.[0] || product.image || '',
          stock: product.stock ?? 99,
          slug: product.slug,
          vendorId: product.vendorId?._id || product.vendorId || product.sellerId,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = (couponData) => {
    setCoupon(couponData);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const FREE_SHIPPING_THRESHOLD_INR = 999;
  const DEFAULT_SHIPPING_FEE_INR = 99;
  const GST_RATE = 0.18; // 18% GST

  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = coupon?.discountAmount || 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD_INR || subtotal === 0 ? 0 : DEFAULT_SHIPPING_FEE_INR;
  const tax = Math.round(taxableSubtotal * GST_RATE * 100) / 100;
  const total = Math.round((taxableSubtotal + shipping + tax) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        subtotal,
        discountAmount,
        coupon,
        shipping,
        tax,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD_INR,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
