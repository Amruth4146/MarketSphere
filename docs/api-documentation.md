# MarketSphere REST API Specification

## 1. General Principles

- **Base URL:** `http://localhost:5000/api/v1`
- **Format:** JSON (`Content-Type: application/json`)
- **Authentication:** HTTP Bearer token via `Authorization: Bearer <token>` header
- **Standard Envelope:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2026-11-10T10:45:00.000Z"
}
```

- **Error Envelope:**

```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": [],
  "timestamp": "2026-11-10T10:45:00.000Z"
}
```

---

## 2. Authentication Endpoints (`/api/v1/auth`)

### 2.1 Register User
- **Method:** `POST`
- **Route:** `/api/v1/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123!",
    "role": "buyer"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { "id": "6730a1b2...", "name": "Jane Doe", "email": "jane@example.com", "role": "buyer" },
      "accessToken": "eyJhbGciOi..."
    }
  }
  ```

### 2.2 Login User
- **Method:** `POST`
- **Route:** `/api/v1/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { "id": "6730a1b2...", "name": "Jane Doe", "email": "jane@example.com", "role": "buyer" },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### 2.3 Current Authenticated User
- **Method:** `GET`
- **Route:** `/api/v1/auth/me`
- **Access:** Authenticated (Bearer Token)
- **Response (200 OK):** Current user object.

---

## 3. Product Catalog Endpoints (`/api/v1/products`)

### 3.1 List / Search Products
- **Method:** `GET`
- **Route:** `/api/v1/products`
- **Access:** Public
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `query` (search term for title/description)
  - `category` (category ID or slug)
  - `minPrice`, `maxPrice`
  - `sortBy` (`price_asc`, `price_desc`, `rating`, `newest`)
- **Response (200 OK):** Paginated array of products.

### 3.2 Get Product Details
- **Method:** `GET`
- **Route:** `/api/v1/products/:idOrSlug`
- **Access:** Public
- **Response (200 OK):** Full product details with seller and reviews.

### 3.3 Create Product
- **Method:** `POST`
- **Route:** `/api/v1/products`
- **Access:** Seller / Admin
- **Request Body:** Product object (title, description, price, stock, images, categoryId, etc.)

---

## 4. Order Management Endpoints (`/api/v1/orders`)

### 4.1 Create Order (Checkout)
- **Method:** `POST`
- **Route:** `/api/v1/orders`
- **Access:** Buyer
- **Request Body:** Items, shipping address, payment method.

### 4.2 Get Order by ID
- **Method:** `GET`
- **Route:** `/api/v1/orders/:id`
- **Access:** Owner (Buyer) / Assigned Seller / Admin

---

## 5. System & Health Endpoints

### 5.1 System Health
- **Method:** `GET`
- **Route:** `/health`
- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "uptime": 124.5,
    "timestamp": "2026-11-10T10:45:00.000Z",
    "environment": "development"
  }
  ```

