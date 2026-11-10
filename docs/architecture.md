# MarketSphere System Architecture (Indian E-Commerce Specification)

## 1. System Overview

**MarketSphere** is an enterprise-grade multi-vendor e-commerce marketplace platform tailored for the Indian retail ecosystem. The platform enforces strict Role-Based Access Control (RBAC) across three primary actors:
- **`customer`**: Browses catalog, adds products to cart/wishlist, places parent orders, tracks delivery, and writes verified reviews.
- **`vendor`**: Manages GST-registered store profile, lists products in INR (₹), fulfills vendor-specific suborders, and tracks payouts.
- **`admin`**: Moderates platform accounts, oversees multi-vendor commissions, approves vendor stores, and manages catalog categories.

The platform architecture implements a parent-order / vendor-suborder split, ensuring multi-merchant transactions are cleanly segmented into separate fulfillment streams with automated platform commission and GST calculations.

---

## 2. High-Level Architecture Diagram

```
+-------------------------------------------------------------------+
|                        Client Layer                               |
|            (React 19 + Vite SPA, Tailwind CSS / Custom CSS)        |
|  - Role-Aware Navigation (Customer / Vendor / Admin)              |
|  - Currency Formatter (INR ₹) & Dynamic Cart Calculations         |
+---------------------------------+---------------------------------+
                                  |
                                  | HTTPS / REST JSON APIs
                                  v
+-------------------------------------------------------------------+
|                       API Gateway / Server                        |
|            (Node.js + Express.js - Modular Monolith)              |
|  - Auth Middleware (JWT Bearer Token + DB Role Verification)      |
|  - Request Validation (Express-Validator)                         |
|  - Centralized Error & Exception Handler                          |
|  - Currency Engine (INR, 18% GST, Configurable Shipping)          |
+-----------+---------------------+---------------------+-----------+
            |                     |                     |
            v                     v                     v
+---------------------+ +-----------------+ +-----------------------+
|   Database Layer    | |   Cache Layer   | |     Search Layer      |
|    (MongoDB 7.0)    | |  (Redis 7.0)    | | (Elasticsearch 8.17)  |
| - Users, Vendors    | | - Category &    | | - Fuzzy Search        |
| - Products, Orders  | |   Product Read  | | - Catalog Aggregation |
| - Vendor Orders     | |   Cache         | | - Fallback to MongoDB |
| - Payments, Coupons | |                 | |                       |
| - Commissions       | |                 | |                       |
+---------------------+ +-----------------+ +-----------------------+
            |                                           |
            v                                           v
+-----------------------------------+   +---------------------------+
|          Payment Gateway          |   |       Cloud Storage       |
|    (Razorpay - UPI/Cards/Net)     |   |    (AWS S3 - ap-south-1)  |
|  - HMAC SHA256 Signature Verify   |   |  - Media & Product Assets |
+-----------------------------------+   +---------------------------+
```

---

## 3. Technology Stack & External Services Status

| Layer | Service / Technology | Status | Integration Scope |
| :--- | :--- | :--- | :--- |
| **Runtime & Framework** | Node.js v24 + Express 4.21 | **Active Integration** | Full server implementation with 12 modular route controllers |
| **Client** | React 19 + Vite 6 | **Active Integration** | Full SPA with Auth, Cart, Catalog, Checkout, and Dashboards |
| **Primary Database** | MongoDB 7.0 + Mongoose 8.10 | **Active Integration** | 12 dedicated models with indexes, hooks, and virtuals |
| **Caching Layer** | Redis 7.0 (Alpine) + ioredis | **Active Integration** | Cache-aside pattern for catalog read paths with silent fallback |
| **Search Engine** | Elasticsearch 8.17.0 | **Active Integration** | `products_index` mapping, fuzzy multi-match query with Mongo fallback |
| **Payment Gateway** | Razorpay SDK | **Configured & Scaffolded** | Order creation and HMAC SHA256 signature verification handler |
| **Object Storage** | AWS S3 (`ap-south-1`) | **Configured & Scaffolded** | Mumbai region storage configuration stub with presigned contract |

---

## 4. Multi-Vendor Suborder Architecture

When a customer checks out with items from multiple vendors:
1. **Parent Order (`Order`)**: Contains the overall order summary, aggregate totals, customer reference, shipping address, and payment status.
2. **Vendor Suborders (`VendorOrder`)**: Automatically partitioned per vendor. Each suborder holds vendor items, vendor subtotal, shipping allocation, and delivery tracking.
3. **Platform Commission (`Commission`)**: Records platform take rate (e.g. 10%), applicable Indian GST (18% on platform commission), and net vendor payout (`grossAmount - commissionAmount - gstOnCommission`).

---

## 5. Security & Authentication Architecture

1. **Role Enforcement:** Authenticated roles (`customer`, `vendor`, `admin`) are strictly verified from the database record during token verification. Client-supplied role claims are never trusted.
2. **Token Strategy:**
   - **Access Token:** Short-lived JWT (15 minutes) signed via `HS256`.
   - **Refresh Token:** Long-lived JWT (7 days) stored on backend User document.
   - **Silent Refresh:** Automatic token refresh interceptor in client service layer.
   - **Revocation:** Explicit logout revokes refresh token on backend.
3. **Password Security:** Salt rounds 10+ using `bcryptjs` with pre-save hashing.
4. **Transport Hardening:** `helmet` security headers, CORS origin whitelisting, and parameter validation.
