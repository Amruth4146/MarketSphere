# MarketSphere Database & Data Architecture Specification

## 1. Storage Overview

MarketSphere utilizes a hybrid polyglot data storage strategy:
- **MongoDB:** Serves as the primary system of record for transactional entities (Users, Products, Orders, Reviews, Categories).
- **Redis:** Provides high-throughput in-memory caching for sessions, rate limiting, and frequent query results.
- **Elasticsearch:** Indexes searchable product catalog data for fast full-text search, filtering, and facets.

---

## 2. MongoDB Document Schemas

### 2.1 Users Collection (`users`)
Stores platform identities, credentials, role-based profiles, and contact details.

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary Key |
| `name` | String | Yes | Trimmed, 2-100 characters |
| `email` | String | Yes | Unique index, lowercase |
| `passwordHash` | String | Yes | Bcrypt hashed (cost factor 10+) |
| `role` | String | Yes | Enum: `['buyer', 'seller', 'admin']`, default: `'buyer'` |
| `phone` | String | No | Formatted E.164 |
| `avatar` | String | No | URL to image asset |
| `addresses` | Array | No | Sub-documents: street, city, state, postalCode, country, isDefault |
| `sellerProfile` | Object | No | Business name, tax ID, rating, verification status |
| `isActive` | Boolean | Yes | Default: `true` |
| `createdAt` | Date | Yes | Timestamp |
| `updatedAt` | Date | Yes | Timestamp |

---

### 2.2 Products Collection (`products`)
Stores item listings, pricing, inventory, seller reference, and media.

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary Key |
| `title` | String | Yes | Indexed, 3-200 characters |
| `slug` | String | Yes | Unique index, SEO friendly URL identifier |
| `description` | String | Yes | Rich text markdown or HTML |
| `sellerId` | ObjectId | Yes | Foreign Key referencing `users._id` |
| `categoryId` | ObjectId | Yes | Foreign Key referencing `categories._id` |
| `price` | Number | Yes | Positive decimal (min: 0.01) |
| `discountPrice` | Number | No | Optional sale price |
| `stock` | Number | Yes | Integer quantity available (min: 0) |
| `sku` | String | Yes | Unique inventory SKU code |
| `images` | [String] | Yes | Array of image URLs |
| `attributes` | Map | No | Key-value pairs (e.g., color, size, brand) |
| `averageRating`| Number | Yes | Default: 0 (0-5 scale) |
| `reviewCount` | Number | Yes | Default: 0 |
| `status` | String | Yes | Enum: `['draft', 'published', 'archived']`, default: `'draft'` |
| `createdAt` | Date | Yes | Timestamp |
| `updatedAt` | Date | Yes | Timestamp |

---

### 2.3 Orders Collection (`orders`)
Encapsulates finalized checkout transactions, fulfillment milestones, and audit history.

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary Key |
| `orderNumber` | String | Yes | Unique order reference (e.g. `MS-2026-XXXXX`) |
| `buyerId` | ObjectId | Yes | Foreign Key referencing `users._id` |
| `items` | Array | Yes | Sub-documents: `productId`, `title`, `unitPrice`, `quantity`, `sellerId` |
| `subtotal` | Number | Yes | Sum of item price * quantity |
| `shippingFee` | Number | Yes | Calculated shipping rate |
| `tax` | Number | Yes | Calculated sales tax |
| `totalAmount` | Number | Yes | Final payable amount |
| `shippingAddress`| Object | Yes | Snapshot of delivery address |
| `paymentStatus`| String | Yes | Enum: `['pending', 'paid', 'failed', 'refunded']` |
| `paymentMethod`| String | Yes | Enum: `['stripe', 'paypal', 'cod']` |
| `orderStatus` | String | Yes | Enum: `['placed', 'processing', 'shipped', 'delivered', 'cancelled']` |
| `trackingNumber`| String | No | Carrier tracking code |
| `createdAt` | Date | Yes | Timestamp |
| `updatedAt` | Date | Yes | Timestamp |

---

### 2.4 Categories Collection (`categories`)
Hierarchical category structure for product taxonomy.

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary Key |
| `name` | String | Yes | Category display name |
| `slug` | String | Yes | Unique URL path |
| `parentId` | ObjectId | No | References parent category (null for root) |
| `icon` | String | No | Icon name or URL |
| `isActive` | Boolean | Yes | Default: `true` |

---

### 2.5 Reviews Collection (`reviews`)
Customer feedback and rating system.

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary Key |
| `productId` | ObjectId | Yes | Foreign Key referencing `products._id` |
| `buyerId` | ObjectId | Yes | Foreign Key referencing `users._id` |
| `orderId` | ObjectId | Yes | Verified purchase reference |
| `rating` | Number | Yes | Integer 1 to 5 |
| `comment` | String | No | Feedback text |
| `createdAt` | Date | Yes | Timestamp |

---

## 3. Redis Data Structure

| Key Pattern | Data Type | TTL | Purpose |
| :--- | :--- | :--- | :--- |
| `session:<userId>` | String (Hash) | 24 Hours | Active user session metadata |
| `cart:<userId>` | String (JSON) | 7 Days | Ephemeral shopping cart state |
| `product:detail:<id>`| String (JSON) | 1 Hour | High-frequency read cache for popular items |
| `ratelimit:<ip>:<route>`| String (Integer)| 1 Minute | Sliding window rate limit counters |

---

## 4. Elasticsearch Index Design (`products_index`)

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text" },
      "category": { "type": "keyword" },
      "price": { "type": "scaled_float", "scaling_factor": 100 },
      "stock": { "type": "integer" },
      "rating": { "type": "float" },
      "sellerId": { "type": "keyword" },
      "status": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

