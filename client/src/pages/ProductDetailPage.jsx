import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingCart,
  Zap,
  Store,
  User as UserIcon,
} from 'lucide-react';
import { productService } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const ProductDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await productService.getProduct(identifier);
        setProductData(data);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [identifier]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading product information...
      </div>
    );
  }

  if (!productData?.product) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The product listing may have been moved or removed.</p>
        <Link to="/products" className="btn btn-primary">Browse Catalog</Link>
      </div>
    );
  }

  const { product, reviews = [] } = productData;
  const activePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await productService.addReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewMessage('Thank you! Your review was recorded.');
      setReviewComment('');
      // Refresh details
      const refreshed = await productService.getProduct(identifier);
      setProductData(refreshed);
    } catch (err) {
      setReviewMessage(err.message || 'Error submitting review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{' '}
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Images Gallery */}
        <div>
          <div style={{
            aspectRatio: '1',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1rem',
          }}>
            <img
              src={product.images?.[selectedImage] || product.images?.[0]}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: selectedImage === idx ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: '#fff',
                  }}
                >
                  <img src={img} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Meta & Actions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-primary">{product.categoryId?.name || 'General'}</span>
            {product.brand && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>by {product.brand}</span>}
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            {product.title}
          </h1>

          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700 }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ({product.reviewCount || 0} customer reviews)
            </span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Pricing */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ${activePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="badge badge-discount">Save {discountPercent}%</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fff',
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.6rem 0.9rem', fontWeight: 700, fontSize: '1.1rem' }}
              >
                -
              </button>
              <span style={{ padding: '0.6rem 0.9rem', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                style={{ padding: '0.6rem 0.9rem', fontWeight: 700, fontSize: '1.1rem' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`}
              style={{ flex: 1, padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              {added ? (
                <>
                  <Check size={18} color="var(--success)" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#0f172a', color: '#fff' }}
            >
              <Zap size={18} color="#fbbf24" /> Buy Now
            </button>
          </div>

          {/* Trust Guarantees */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-alt)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600 }}>
              <Truck size={16} color="var(--primary)" /> Free shipping over $50
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600 }}>
              <ShieldCheck size={16} color="var(--success)" /> 1-Year Guarantee
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600 }}>
              <RotateCcw size={16} color="var(--secondary)" /> 30-Day Returns
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Feedback Section */}
      <section style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
          Customer Reviews ({reviews.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Reviews List */}
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review this product!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}>
                          {r.buyerId?.name ? r.buyerId.name[0] : 'U'}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.buyerId?.name || 'Verified Buyer'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.1rem', color: '#f59e0b' }}>
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            fill={idx < r.rating ? '#f59e0b' : 'none'}
                            color={idx < r.rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Box */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            alignSelf: 'start',
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Write a Review</h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit}>
                {reviewMessage && (
                  <div style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                  }}>
                    {reviewMessage}
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Rating Score:
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Exceptional</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value="3">⭐⭐⭐ 3 - Average</option>
                    <option value="2">⭐⭐ 2 - Poor</option>
                    <option value="1">⭐ 1 - Terrible</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Your Experience:
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe product quality, shipping experience, and durability..."
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {reviewSubmitting ? 'Posting Review...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Please sign in to share your purchase review.
                </p>
                <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
