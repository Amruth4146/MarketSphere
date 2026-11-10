import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { orderService } from '../services/orderService.js';

export const CheckoutPage = () => {
  const { cartItems, subtotal, shipping, tax, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '123 Market Boulevard',
    city: user?.addresses?.[0]?.city || 'San Francisco',
    state: user?.addresses?.[0]?.state || 'CA',
    postalCode: user?.addresses?.[0]?.postalCode || '94105',
    country: user?.addresses?.[0]?.country || 'US',
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Your bag is empty</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
      };

      const res = await orderService.createOrder(orderPayload);
      clearCart();
      navigate(`/order-success/${res._id || res.orderNumber}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please check your inventory or credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Return to Shopping Bag
      </Link>

      <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '2rem' }}>Complete Your Order</h1>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Shipping & Payment Form */}
        <div>
          {/* Shipping Address */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.75rem',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>1. Shipping Address</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    State / Province
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Country
                  </label>
                  <select
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.75rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>2. Payment Selection</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem',
                border: paymentMethod === 'credit_card' ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => setPaymentMethod('credit_card')}
                />
                <CreditCard size={18} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Credit / Debit Card (Instant Approval)</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem',
                border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cash on Delivery</span>
              </label>
            </div>

            {paymentMethod === 'credit_card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      defaultValue="888"
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items & Place CTA */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Review Items</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '240px', overflowY: 'auto' }}>
            {cartItems.map((item) => (
              <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.quantity}x {item.title}
                </span>
                <span style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
              <span>Total Payable</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1rem' }}
          >
            {loading ? 'Processing Transaction...' : `Pay $${total.toFixed(2)} Now`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Lock size={14} color="var(--success)" /> Guaranteed Safe & Encrypted Checkout
          </div>
        </div>
      </form>
    </div>
  );
};
