import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '600px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#dcfce7',
        color: '#15803d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
      }}>
        <CheckCircle2 size={44} />
      </div>

      <span className="badge badge-success" style={{ marginBottom: '1rem' }}>
        Order Confirmed
      </span>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        Thank You for Your Order!
      </h1>

      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
        We have received your order and notified the merchant sellers. Your tracking code and order invoice have been dispatched to your email.
      </p>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'left',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order Reference:</span>
          <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{orderId || 'MS-CONFIRMED'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Estimated Delivery:</span>
          <strong>3-5 Business Days (Express)</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Payment Status:</span>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>PAID / CONFIRMED</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn btn-secondary">
          <Package size={16} /> View My Orders
        </Link>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

