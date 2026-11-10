import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Store, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { productService } from '../services/productService.js';

export const VendorDashboardPage = () => {
  const { user, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    discountPrice: '',
    stock: '',
    sku: '',
    brand: '',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/vendor/dashboard');
      return;
    }

    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          setFormData((prev) => ({ ...prev, categoryId: cats[0]._id }));
        }
      } catch (err) {}
    };

    fetchCategories();
  }, [isAuthenticated, isVendor, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock, 10),
        sku: formData.sku.toUpperCase(),
        brand: formData.brand,
        images: [formData.imageUrl],
        isFeatured: formData.isFeatured,
      };

      await productService.createProduct(payload);
      setStatusMessage({
        type: 'success',
        text: 'Product listed successfully in Indian Marketplace! It is now live.',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0]?._id || '',
        price: '',
        discountPrice: '',
        stock: '',
        sku: '',
        brand: '',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        isFeatured: false,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to create product listing.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Store size={18} /> MERCHANT VENDOR PORTAL
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {user?.vendor?.businessName || user?.name || 'Vendor'} Dashboard
          </h1>
        </div>

        <Link to="/products" className="btn btn-secondary">
          View Live Marketplace
        </Link>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Vendor Rating
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: '#f59e0b' }}>
            ★ {user?.vendor?.rating || '4.8'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            GST Verified Indian Merchant
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Platform Commission
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>
            {user?.vendor?.commissionRate || 10}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Standard electronics & apparel rate
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Payout Currency
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--success)' }}>
            INR (₹)
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Direct NEFT/RTGS Indian Bank Transfer
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
        maxWidth: '800px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <PlusCircle size={22} color="var(--primary)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Create New Product Listing</h2>
        </div>

        {statusMessage.text && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
            marginBottom: '1.5rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            {statusMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff' }}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Brand
              </label>
              <input
                type="text"
                placeholder="e.g. Sony, Apple, Nike"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Unique SKU *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SONY-XM5-BLK"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Regular Price (₹ INR) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="29990"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Discount Price (₹ INR) (Optional)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="26990"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Inventory Units in Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Product Image URL *
            </label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Full Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Highlight technical specifications, warranty terms, and unique selling points..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Feature this product on marketplace showcase</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Submitting Listing...' : 'Publish Listing to MarketSphere'}
          </button>
        </form>
      </div>
    </div>
  );
};
