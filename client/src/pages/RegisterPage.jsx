import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        ...(role === 'seller' && { businessName }),
      });
      navigate(role === 'seller' ? '/seller/dashboard' : '/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '480px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '2.25rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <ShoppingBag size={24} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Join MarketSphere</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Choose your account type and start today
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {/* Role Picker Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setRole('buyer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: role === 'buyer' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: role === 'buyer' ? 'var(--primary-light)' : '#fff',
              color: role === 'buyer' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            <User size={16} /> Buyer Account
          </button>

          <button
            type="button"
            onClick={() => setRole('seller')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: role === 'seller' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: role === 'seller' ? 'var(--primary-light)' : '#fff',
              color: role === 'seller' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            <Store size={16} /> Merchant Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Smith"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                outline: 'none',
              }}
            />
          </div>

          {role === 'seller' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Store / Business Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Artisans Store"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'seller' ? 'Seller' : 'Buyer'}`}{' '}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
