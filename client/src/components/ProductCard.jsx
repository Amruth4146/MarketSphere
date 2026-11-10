import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const activePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const imageSrc =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Product Image */}
      <Link
        to={`/products/${product.slug || product._id}`}
        style={{
          position: 'relative',
          paddingTop: '80%',
          backgroundColor: '#f8fafc',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        <img
          src={imageSrc}
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {hasDiscount && (
          <span
            className="badge badge-discount"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 2,
              fontWeight: 800,
            }}
          >
            -{discountPercent}%
          </span>
        )}

        {product.isFeatured && !hasDiscount && (
          <span
            className="badge badge-primary"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 2,
            }}
          >
            Featured
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            {product.categoryId?.name || 'Item'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
            <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>({product.reviewCount || 0})</span>
          </div>
        </div>

        <Link
          to={`/products/${product.slug || product._id}`}
          style={{
            fontWeight: 700,
            fontSize: '0.975rem',
            lineHeight: 1.35,
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.7rem',
          }}
        >
          {product.title}
        </Link>

        {/* Pricing and Action */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ${activePrice.toFixed(2)}
            </div>
            {hasDiscount && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                ${product.price.toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}
          >
            {added ? (
              <>
                <Check size={16} color="var(--success)" /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
