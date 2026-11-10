import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const CartPage = () => {
  const {
    cartItems,
    itemsCount,
    subtotal,
    shipping,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <ShoppingBag size={34} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Bag is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Explore our marketplace to discover curated items and deals.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Explore Products <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Shopping Bag ({itemsCount})</h1>
        <button
          onClick={clearCart}
          style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}
        >
          Clear All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Items List */}
        <div>
          {/* Free Shipping Progress Indicator */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem' }}>
              <Truck size={18} color="var(--primary)" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong style={{ color: 'var(--primary)' }}>${remainingForFreeShipping.toFixed(2)}</strong> more to unlock <strong>FREE Express Shipping</strong>!
                </span>
              ) : (
                <span style={{ color: 'var(--success)' }}>
                  🎉 You have unlocked <strong>FREE Express Shipping</strong>!
                </span>
              )}
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-alt)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.productId}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-alt)',
                  flexShrink: 0,
                }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/products/${item.slug || item.productId}`}
                    style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: 'var(--text-main)',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {item.title}
                  </Link>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Unit: ${item.price.toFixed(2)}
                  </div>

                  {/* Quantity modifier */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#fff',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{ padding: '0.25rem 0.6rem', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0.25rem 0.6rem', fontWeight: 700, fontSize: '0.85rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{ padding: '0.25rem 0.6rem', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{ color: 'var(--text-light)', transition: 'color 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-light)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.925rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal ({itemsCount} items)</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sales Tax (8%)</span>
              <span style={{ fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total</span>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1rem' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--success)" /> 256-Bit SSL Encrypted Checkout
          </div>
        </div>
      </div>
    </div>
  );
};
