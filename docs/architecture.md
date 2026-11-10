# MarketSphere System Architecture

## 1. System Overview

**MarketSphere** is an enterprise-grade, scalable multi-vendor e-commerce marketplace platform. It facilitates seamless interactions between buyers, sellers, and platform administrators, offering comprehensive product discovery, transaction handling, inventory management, and analytics.

The system is architected around a decoupled client-server model, utilizing a distributed data layer with specialized databases for persistence (MongoDB), distributed caching (Redis), and full-text search indexing (Elasticsearch).

---

## 2. High-Level Architecture Diagram

```
+-------------------------------------------------------------+
|                      Client Layer                           |
|              (React 19 + Vite SPA, Tailwind CSS)            |
+------------------------------+------------------------------+
                               |
                               | HTTPS / REST JSON APIs
                               v
+-------------------------------------------------------------+
|                     API Gateway / Server                     |
|           (Node.js + Express.js - Modular Monolith)         |
|  - Auth Middleware (JWT + RBAC)                             |
|  - Request Validation (Express-Validator)                   |
|  - Rate Limiting & Helmet Security Headers                  |
+----------+-------------------+-------------------+----------+
           |                   |                   |
           v                   v                   v
+--------------------+ +---------------+ +--------------------+
|   Database Layer   | |  Cache Layer  | |    Search Layer    |
|   (MongoDB 7.0)    | |  (Redis 7.0)  | |(Elasticsearch 8.17)|
| - Users & Profiles | | - Session     | | - Product Catalog  |
| - Orders & Carts   | | - Cache Data  | | - Faceted Search   |
| - Transactions     | | - Rate Limits | | - Autocomplete     |
+--------------------+ +---------------+ +--------------------+
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 19.x | Declarative UI component tree |
| **Frontend Tooling** | Vite | 6.x | Fast HMR development and optimized production bundling |
| **Backend** | Node.js + Express | 24.x / 4.21.x | Robust HTTP server, routing, and controller execution |
| **Primary Database** | MongoDB | 7.0 | Document store for ACID transactional entities |
| **ODM** | Mongoose | 8.x | Schema modeling, validation, and middleware hooks |
| **In-Memory Cache** | Redis | 7.0 (Alpine) | High-speed cache, session management, and rate limiting |
| **Search Engine** | Elasticsearch | 8.17.x | Full-text search, typo-tolerance, and catalog aggregation |
| **Containerization** | Docker + Compose | 3.8 Spec | Unified local and staging container orchestration |

---

## 4. Frontend Architecture (`client/`)

The frontend application follows a feature-modular component structure:

```
client/src/
├── assets/         # Static visual assets (icons, illustrations, brand media)
├── components/     # Reusable atomic & composite UI components (Button, Modal, Input)
├── context/        # React Context providers (AuthContext, CartContext, ThemeContext)
├── hooks/          # Custom reusable React hooks (useAuth, useDebounce, useFetch)
├── layouts/        # Page layout templates (MainLayout, AuthLayout, DashboardLayout)
├── pages/          # Route view components (HomePage, ProductDetails, Checkout)
├── services/       # API client abstractions and Axios/Fetch interceptors
└── utils/          # Pure helper utilities (formatters, validators, constants)
```

### Key Principles:
- **Separation of Concerns:** Business logic resides inside custom hooks and services; UI components remain presentation-focused.
- **State Management:** Local state handles UI transitions; Context API handles global states (user auth, cart session); Server state handles API caching.
- **Responsive Layouts:** Mobile-first responsive grids and components.

---

## 5. Backend Architecture (`server/`)

The server is built with a layered, modular architecture:

```
server/src/
├── config/         # Environment variables, database, redis, and ES clients
├── controllers/    # Request handling, response formatting, HTTP status codes
├── models/         # Mongoose entity schemas and model definitions
├── routes/         # Express endpoint definitions mapped to controllers
├── middleware/     # Auth, RBAC, error handling, rate limiting, logging
├── services/       # Core business logic and external integrations
├── utils/          # Reusable helper functions and custom Error classes
└── validators/     # Request payload validation schemas
```

### Request Lifecycle:
1. **Inbound HTTP Request** arrives at `server.js`.
2. Passed to Express `app.js` through global middleware (`helmet`, `cors`, `morgan`, `express.json`).
3. Routed through endpoint router (`/api/v1/*`).
4. **Validation Middleware** verifies query/body parameters.
5. **Auth Middleware** extracts and verifies Bearer JWT, attaching `req.user`.
6. **Controller** delegates business operations to relevant **Service**.
7. **Service** interacts with MongoDB, Redis, or Elasticsearch.
8. Standardized JSON response envelope returned to client.
9. Any uncaught exceptions are caught by the centralized `errorHandler`.

---

## 6. Security Architecture

1. **Credentials Isolation:** No hardcoded secrets. All configurations are loaded via environment variables validated by `config/env.js`.
2. **Authentication:** Stateless JSON Web Tokens (Access Tokens with short expiry + Refresh Tokens with rotation).
3. **Authorization:** Role-Based Access Control (`buyer`, `seller`, `admin`).
4. **Transport Protection:** Helmet middleware sets HTTP security headers (HSTS, CSP, X-Frame-Options).
5. **Data Sanitization:** Strict payload schemas prevent injection attacks.

