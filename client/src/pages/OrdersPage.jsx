import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar } from 'lucide-react';
import { orderService } from '../services/orderService.js';
import { useAuth } from '../context/AuthContext.jsx';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Sign In to View Orders</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Please sign in to track and view your order history.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '2rem' }}>
        My Orders ({orders.length})
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          backgroundColor: '#fff',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '5rem 2rem',
          textAlign: 'center',
        }}>
          <Package size={44} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            When you complete checkout on MarketSphere, your verified orders and merchant tracking codes will appear here.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order._id || order.orderNumber}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1.25rem',
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Order Number
                  </span>
                  <div style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '1rem' }}>
                    {order.orderNumber}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Calendar size={15} />
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total (INR)
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span className={`badge ${order.orderStatus === 'delivered' ? 'badge-success' : 'badge-primary'}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
