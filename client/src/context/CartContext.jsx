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

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('marketsphere_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === (product._id || product.productId));
      const activePrice = product.discountPrice || product.price;

      if (existing) {
        return prev.map((item) =>
          item.productId === (product._id || product.productId)
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
          productId: product._id || product.productId,
          title: product.title,
          price: activePrice,
          originalPrice: product.discountPrice ? product.price : null,
          image: product.images?.[0] || product.image || '',
          stock: product.stock ?? 99,
          slug: product.slug,
          sellerId: product.sellerId?._id || product.sellerId,
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
  };

  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        subtotal,
        shipping,
        tax,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
