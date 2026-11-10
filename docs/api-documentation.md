# MarketSphere REST API Specification (India E-Commerce)

## 1. General Standards

- **Base URL:** `http://localhost:5000/api/v1`
- **Currency:** Indian Rupee (`INR` / `₹`)
- **Default Tax:** 18% GST (Calculated backend-side)
- **Authentication:** `Authorization: Bearer <token>`
- **Response Format:** Standard JSON envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2026-11-10T12:00:00.000Z"
}
```

---

## 2. API Groups Directory

### 2.1 `/api/v1/auth` (Authentication)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register customer or vendor account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user, issue access & refresh tokens |
| `POST` | `/api/v1/auth/refresh-token` | Public | Issue fresh access token using valid refresh token |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke refresh token and invalidate session |
| `GET` | `/api/v1/auth/me` | Authenticated | Get currently authenticated profile |
| `PUT` | `/api/v1/auth/profile` | Authenticated | Update name, phone, or avatar |
| `GET` | `/api/v1/auth/wishlist` | Authenticated | Get populated customer wishlist |
| `POST` | `/api/v1/auth/wishlist/:productId` | Authenticated | Add/remove item in customer wishlist |

### 2.2 `/api/v1/users` (Users & Addresses)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | Admin | List all registered users with pagination & search |
| `GET` | `/api/v1/users/:id` | Admin | Get user profile details |
| `PUT` | `/api/v1/users/:id/status`| Admin | Update user role (`customer`, `vendor`, `admin`) or active state |
| `GET` | `/api/v1/users/addresses` | Authenticated | Get customer saved Indian addresses |
| `POST` | `/api/v1/users/addresses` | Authenticated | Add new address with PIN code validation |
| `PUT` | `/api/v1/users/addresses/:id`| Authenticated | Update existing address |
| `DELETE`| `/api/v1/users/addresses/:id`| Authenticated | Delete address |

### 2.3 `/api/v1/vendors` (Vendor Stores)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/vendors` | Public | List verified vendor storefronts |
| `GET` | `/api/v1/vendors/:identifier`| Public | Get vendor store details & product listings |
| `PUT` | `/api/v1/vendors/profile` | Vendor/Admin | Update business details, GSTIN, PAN, bank account |
| `GET` | `/api/v1/vendors/dashboard/metrics` | Vendor/Admin | Get vendor sales, order count, payout balances |

### 2.4 `/api/v1/products` (Catalog & Search)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Public | Filtered catalog search (ES with Mongo fallback) |
| `GET` | `/api/v1/products/featured`| Public | High-speed cached featured products (Redis) |
| `GET` | `/api/v1/products/:identifier`| Public | Single product details with populated category & reviews |
| `POST` | `/api/v1/products` | Vendor/Admin | Create product listing in INR with stock & SKU |
| `PUT` | `/api/v1/products/:id` | Vendor/Admin | Update product details (owner vendor only) |
| `DELETE`| `/api/v1/products/:id` | Vendor/Admin | Delete product listing |

### 2.5 `/api/v1/categories` (Taxonomy)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Public | List active categories (Redis cached) |
| `GET` | `/api/v1/categories/:slug`| Public | Get category details |
| `POST` | `/api/v1/categories` | Admin | Create category with display order |

### 2.6 `/api/v1/cart` (Cart Validation)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/cart/validate` | Public | Validate stock & recalculate subtotal, shipping & GST |

### 2.7 `/api/v1/orders` (Parent & Suborders)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders` | Customer | Create parent order & partition into vendor suborders |
| `GET` | `/api/v1/orders/my` | Customer | Get customer order history |
| `GET` | `/api/v1/orders/vendor` | Vendor/Admin | Get vendor-specific assigned suborders |
| `GET` | `/api/v1/orders/:id` | Authenticated | Get full order details (authorized actors only) |
| `PUT` | `/api/v1/orders/vendor/:id/status` | Vendor/Admin | Update suborder status (shipped, delivered, tracking) |

### 2.8 `/api/v1/payments` (Razorpay Transactions)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payments/create-order` | Customer | Generate Razorpay order ID in paise |
| `POST` | `/api/v1/payments/verify` | Customer | Verify HMAC SHA256 payment signature |
| `GET` | `/api/v1/payments/order/:orderId` | Authenticated | Retrieve transaction receipt & status |

### 2.9 `/api/v1/reviews` (Ratings)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reviews/product/:productId` | Public | List reviews for product |
| `POST` | `/api/v1/reviews/product/:productId` | Customer | Post customer review (1 per customer per product) |
| `DELETE`| `/api/v1/reviews/:id` | Customer/Admin| Delete review and update average rating |

### 2.10 `/api/v1/coupons` (Discounts)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/coupons` | Public | List currently active promo coupons |
| `POST` | `/api/v1/coupons/validate` | Public | Validate coupon code against subtotal |
| `POST` | `/api/v1/coupons` | Vendor/Admin | Create new discount coupon |

### 2.11 `/api/v1/admin` (Platform Moderation)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard` | Admin | Total GMV, platform commission, user & order metrics |
| `GET` | `/api/v1/admin/commissions`| Admin | Breakdown of vendor commission earnings |
| `PUT` | `/api/v1/admin/vendors/:id/status` | Admin | Approve, verify or suspend vendor |

### 2.12 `/api/v1/notifications` (In-App Messaging)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Authenticated | Get unread and recent in-app notifications |
| `PUT` | `/api/v1/notifications/:id/read` | Authenticated | Mark notification as read |
| `PUT` | `/api/v1/notifications/read-all` | Authenticated | Mark all notifications as read |
