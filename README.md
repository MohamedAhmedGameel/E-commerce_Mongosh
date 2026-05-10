#  E-Commerce Platform — MongoDB Database

> **Advanced Database Systems · Final Project**  
> A production-grade NoSQL database built with MongoDB, simulating a full-scale e-commerce platform with 10 collections, 13 relationships, schema validation, indexing, and comprehensive query coverage.

---

##  Table of Contents

1. [Project Overview](#1-project-overview)
2. [Getting Started](#2-getting-started)
3. [Database Architecture](#3-database-architecture)
4. [Collections Reference](#4-collections-reference)
5. [Relationships Between Collections](#5-relationships-between-collections)
6. [Schema Validators & Indexes](#6-schema-validators--indexes)
7. [Script Structure](#7-script-structure)
8. [CRUD Operations](#8-crud-operations)
9. [Query Operations](#9-query-operations)
10. [Data Design Decisions](#10-data-design-decisions)
11. [Team Notes](#11-team-notes)

---

## 1. Project Overview

This database models a real-world e-commerce platform similar to Amazon or Shopify. It covers the full lifecycle of an online store — from browsing products and managing inventory, to placing orders, applying coupons, processing payments, and leaving reviews.

### Platform Summary

| Property | Value |
|---|---|
| Database Name | `ecommerce_db` |
| Total Collections | 10 |
| Total Documents | ~200+ across all collections |
| Total Relationships | 13 |
| Script Size | ~3,700 lines |
| Script File | `ecommerce_mongodb.js` |

### What the System Models

- Users can browse products organized by category hierarchies
- Sellers manage their own product listings and store profiles
- Customers add products to their cart, apply discount coupons, and place orders
- Orders are tracked through a status lifecycle (pending → confirmed → shipped → delivered)
- Payments are recorded per order
- Customers leave reviews on products they've purchased
- Inventory is tracked per product variant across multiple warehouses

---

## 2. Getting Started

### Prerequisites

- MongoDB installed locally **or** access to MongoDB Atlas
- `mongosh` (MongoDB Shell) installed

### Running the Script

**Option A — mongosh (recommended):**
```bash
mongosh < ecommerce_mongodb.js
```

**Option B — Run inside mongosh interactively:**
```bash
mongosh
> load("ecommerce_mongodb.js")
```

**Option C — MongoDB Compass:**  
Open Compass → connect to your instance → open the MongoDB Shell tab at the bottom → paste and run the script.

### Verify the Setup

After running, confirm everything was created:
```js
use("ecommerce_db")
show collections
db.users.countDocuments()        // should return 21
db.products.countDocuments()     // should return 23
db.orders.countDocuments()       // should return 18
db.sellers.countDocuments()      // should return 15
```

> **Note:** The script starts with `drop()` calls on all collections so it can be safely re-run from scratch at any time.

---

## 3. Database Architecture

The database follows a hybrid data modeling approach — embedding data where it makes sense for read performance, and referencing data where relationships are dynamic or reused across many documents.

```
ecommerce_db
│
├── users           ← Core entity: customers, sellers, admins
├── categories      ← Product taxonomy (parent/child hierarchy)
├── sellers         ← Store profiles linked to user accounts
├── products        ← Product catalog with embedded variants & specs
├── inventory       ← Stock levels per SKU per warehouse
│
├── orders          ← Purchase records with embedded line items
├── payments        ← One payment record per order
├── coupons         ← Discount codes (referenced by orders)
│
├── reviews         ← Product reviews linked to user + product
└── carts           ← Active shopping carts per user
```

### Embedding vs. Referencing — Our Choices

| Embedded (inside document) | Referenced (separate collection) |
|---|---|
| Order line items (`items[]`) | `userId` in orders → users |
| Product variants (`variants[]`) | `categoryId` in products → categories |
| Product specifications | `sellerId` in products → sellers |
| Shipping/billing address in orders | `productId` in reviews → products |
| Seller policies & social links | `orderId` in payments → orders |
| User address & preferences | `userId` in sellers → users |
| Review seller response | |

**Why embed?** Data that is always read together, never updated independently, and belongs to one parent (e.g. a product's variants only make sense in the context of that product).

**Why reference?** Data that has its own lifecycle, is shared across many documents, or needs to be queried independently (e.g. a user can have many orders — we don't embed all orders inside the user document).

---

## 4. Collections Reference

###  users
Stores all platform users — customers, sellers, and admins.

```js
{
  _id:          ObjectId,          // auto-generated primary key
  name:         String,
  email:        String,            // unique index
  passwordHash: String,
  phone:        String,
  role:         "customer" | "seller" | "admin",
  isActive:     Boolean,
  loyaltyPoints: Int,
  createdAt:    Date,
  lastLoginAt:  Date,
  address: {                       // embedded sub-document
    street, city, state, country, zipCode
  },
  preferences: {                   // embedded sub-document
    currency, language, newsletterSubscribed
  }
}
```

**20 documents** · Roles: 13 customers, 5 sellers, 1 admin, 1 extra added via `insertOne`

---

###  categories
Organizes products in a tree structure using a self-referencing `parentId` field.

```js
{
  _id:         ObjectId,
  name:        String,
  slug:        String,             // unique index (e.g. "smartphones")
  description: String,
  parentId:    String | null,      // null = top-level category
  isActive:    Boolean,
  sortOrder:   Int,
  createdAt:   Date
}
```

**15 documents** · Top-level: Electronics, Clothing, Home, Books, Sports, Beauty, Toys · Each has sub-categories (e.g. Electronics → Smartphones, Laptops, Audio, Gaming)

---

###  sellers
One seller profile per user account. Contains store configuration, performance stats, and policies.

```js
{
  _id:          ObjectId,
  userId:       ObjectId,          // → users._id (unique index)
  storeName:    String,
  description:  String,
  rating:       Double,            // 0.0 – 5.0
  totalSales:   Int,
  totalRevenue: Double,
  isVerified:   Boolean,
  joinedAt:     Date,
  contactEmail: String,
  policies: {                      // embedded
    returnDays, freeShippingAbove, shipsFrom
  },
  socialLinks: {                   // embedded
    website, instagram, twitter, ...
  }
}
```

**15 documents** · Notable sellers: TechVault (electronics), StyleForward (fashion), AudioPeak (audio), GamerZone (gaming), HomeHaven (home goods)

---

###  products
The most complex collection. Each product has embedded variants (e.g. color + size combinations), specifications, and images.

```js
{
  _id:              ObjectId,
  name:             String,
  slug:             String,        // unique index
  brand:            String,
  sku:              String,
  price:            Double,
  compareAtPrice:   Double,        // original/crossed-out price
  costPrice:        Double,        // internal cost
  categoryId:       ObjectId,      // → categories._id
  sellerId:         ObjectId,      // → sellers._id
  images: [                        // embedded array
    { url, altText, isPrimary }
  ],
  specifications:   Object,        // varies per product type
  variants: [                      // embedded array
    { color, size/storage, additionalPrice, stock }
  ],
  tags:             Array,
  averageRating:    Double,
  reviewCount:      Int,
  totalSold:        Int,
  isActive:         Boolean,
  isFeatured:       Boolean,
  createdAt:        Date,
  updatedAt:        Date
}
```

**23 documents** (20 initial + 3 inserted via `insertMany`) · Includes: iPhones, MacBooks, Sony headphones, KitchenAid mixer, PlayStation 5, Nike shoes, LEGO sets, skincare, books, and more

---

###  orders
Central transactional collection. Line items are embedded directly in the order for snapshot integrity — the price at time of purchase is preserved even if the product price changes later.

```js
{
  _id:             ObjectId,
  userId:          ObjectId,       // → users._id
  orderNumber:     String,         // e.g. "ORD-2024-000001"
  items: [                         // embedded array (snapshot)
    {
      productId:   ObjectId,       // → products._id
      productName: String,
      sku:         String,
      quantity:    Int,
      unitPrice:   Double,
      totalPrice:  Double,
      variant:     String
    }
  ],
  shippingAddress: Object,         // embedded snapshot
  billingAddress:  Object,         // embedded snapshot
  subtotal:        Double,
  shippingCost:    Double,
  taxAmount:       Double,
  discountAmount:  Double,
  couponCode:      String | null,  // loose ref → coupons.code
  totalAmount:     Double,
  paymentMethod:   String,
  paymentStatus:   String,
  status:          "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded",
  trackingNumber:  String | null,
  estimatedDelivery: Date,
  deliveredAt:     Date | null,
  createdAt:       Date,
  updatedAt:       Date
}
```

**18 documents** · Statuses: 12 delivered, 1 shipped, 1 confirmed, 1 pending, 1 cancelled

---

###  payments
One payment document per order. Auto-generated from the orders collection at insert time.

```js
{
  _id:           ObjectId,
  orderId:       ObjectId,         // → orders._id (unique index)
  userId:        ObjectId,         // → users._id
  orderNumber:   String,
  amount:        Double,
  currency:      String,
  method:        String,
  status:        "completed" | "refunded" | "pending",
  transactionId: String,
  gateway:       "Stripe" | "PayPal",
  gatewayResponse: {               // embedded
    code, message, authCode
  },
  last4:         String | null,
  createdAt:     Date
}
```

**18 documents** · One per order · The cancelled order's payment is marked `"refunded"`

---

###  reviews
Product reviews. A unique compound index on `(productId, userId)` ensures one review per user per product.

```js
{
  _id:              ObjectId,
  productId:        ObjectId,      // → products._id
  userId:           ObjectId,      // → users._id
  rating:           Int,           // 1–5
  title:            String,
  body:             String,
  verifiedPurchase: Boolean,
  helpfulVotes:     Int,
  images:           Array,
  createdAt:        Date,
  updatedAt:        Date,
  sellerResponse: {                // embedded (nullable)
    text, respondedAt
  }
}
```

**20 documents** · All 5-star and 4-star ratings · Covers 17 out of 20 products

---

###  carts
One active cart per user. Items are embedded. Carts are ephemeral — cleared after checkout.

```js
{
  _id:        ObjectId,
  userId:     ObjectId,            // → users._id (unique index)
  items: [                         // embedded array
    { productId, productName, quantity, unitPrice, variant }
  ],
  totalItems: Int,
  subtotal:   Double,
  updatedAt:  Date
}
```

**15 documents** · One per active user · Ranges from 1-item carts to 10-item bulk carts

---

###  coupons
Discount codes with type, value, usage limits, and category restrictions.

```js
{
  _id:                  ObjectId,
  code:                 String,    // unique index (e.g. "WELCOME10")
  type:                 "percentage" | "fixed" | "free_shipping",
  value:                Number,    // percent or dollar amount
  description:          String,
  minOrderAmount:       Double,
  maxDiscountAmount:    Double,
  maxUses:              Int,
  usedCount:            Int,
  isActive:             Boolean,
  applicableCategories: Array,     // empty = all categories
  onePerUser:           Boolean,
  expiresAt:            Date,
  createdAt:            Date
}
```

**15 documents** · Includes: WELCOME10, VIP25, TECH50, GAME100, HOLIDAY30, FREESHIP, and more · Referenced loosely by `orders.couponCode`

---

###  inventory
Tracks physical stock per product variant per warehouse. Decoupled from the product document to allow independent warehouse management.

```js
{
  _id:          ObjectId,
  productId:    ObjectId,          // → products._id
  sku:          String,
  productName:  String,
  variant:      String,
  warehouse:    String,            // e.g. "WH-NY", "WH-LA"
  quantity:     Int,               // total physical stock
  reserved:     Int,               // held for pending orders
  available:    Int,               // quantity - reserved
  reorderLevel: Int,               // alert threshold
  lastUpdated:  Date
}
```

**20 documents** · Warehouses: WH-NY, WH-LA, WH-CHI, WH-AUS, WH-SEA, WH-PDX, WH-BOS, WH-MIA, WH-NSH, WH-DAL, WH-DEN

---

## 5. Relationships Between Collections

Below is the full map of how collections relate to each other.

```
┌────────────────────────────────────────────────────────────────────────┐
│                    RELATIONSHIP MAP                                    │
├──────────────┬────────────────┬───────────┬────────────────────────────┤
│ From         │ To             │ Type      │ Via Field                  │
├──────────────┼────────────────┼───────────┼────────────────────────────┤
│ users        │ sellers        │ 1 : 1     │ sellers.userId             │
│ users        │ orders         │ 1 : N     │ orders.userId              │
│ users        │ reviews        │ 1 : N     │ reviews.userId             │
│ users        │ carts          │ 1 : 1     │ carts.userId               │
│ users        │ payments       │ 1 : N     │ payments.userId            │
│ categories   │ products       │ 1 : N     │ products.categoryId        │
│ sellers      │ products       │ 1 : N     │ products.sellerId          │
│ products     │ orders         │ N : N     │ orders.items[].productId   │
│ products     │ reviews        │ 1 : N     │ reviews.productId          │
│ products     │ carts          │ N : N     │ carts.items[].productId    │
│ products     │ inventory      │ 1 : N     │ inventory.productId        │
│ orders       │ payments       │ 1 : 1     │ payments.orderId           │
│ orders       │ coupons        │ N : 1     │ orders.couponCode          │
└──────────────┴────────────────┴───────────┴────────────────────────────┘
```

### Key Relationship Explanations

**users → sellers (1:1)**  
A seller is an extended profile for a user who sells on the platform. Not every user has a seller record — only those with `role: "seller"`. The link is `sellers.userId → users._id`.

**users → orders (1:N)**  
One user can place many orders over time. Each order stores a `userId` to identify the buyer. We do NOT embed orders inside the user document because orders grow unboundedly and need their own queries.

**categories → products (1:N)**  
Each product belongs to exactly one category. Categories support a parent/child hierarchy via `parentId` (self-reference), allowing top-level categories like "Electronics" to contain sub-categories like "Smartphones".

**sellers → products (1:N)**  
One seller can list many products. Each product has exactly one `sellerId`.

**products ↔ orders (N:N via embedding)**  
This is a many-to-many relationship. One order can contain many products; one product can appear in many orders. Rather than a separate junction collection, we embed the line items directly inside the order document. This snapshot pattern preserves the price and variant at the exact time of purchase — even if the product is later updated or deleted.

**products ↔ carts (N:N via embedding)**  
Same pattern as orders. Cart items are embedded inside the cart document.

**products → inventory (1:N)**  
One product can have multiple inventory records — one per variant/SKU and potentially one per warehouse location. This decoupling allows the warehouse team to manage stock independently from the product catalog.

**orders → payments (1:1)**  
Every completed order generates exactly one payment record. The payment stores the gateway response, transaction ID, and status separately from the order itself, keeping concerns cleanly separated.

**orders → coupons (N:1)**  
Many orders can use the same coupon code. The link is a loose reference — `orders.couponCode` stores the coupon `code` string (not the ObjectId). This is intentional: if a coupon is deleted, the order history still shows which code was used.

---

## 6. Schema Validators & Indexes

### Schema Validation
The `users`, `categories`, `sellers`, `products`, and `orders` collections use MongoDB's `$jsonSchema` validator with `validationAction: "warn"`. This means:
- Invalid documents trigger a **warning** in the logs but are still inserted (non-blocking)
- In a production system you would use `validationAction: "error"` to strictly reject invalid data

### Indexes Created

| Collection | Index | Type | Purpose |
|---|---|---|---|
| users | `email` | Unique | Prevent duplicate accounts |
| users | `role` | Standard | Filter by role quickly |
| categories | `slug` | Unique | URL-safe lookups |
| sellers | `userId` | Unique | One seller per user |
| sellers | `storeName` | Text | Full-text store search |
| products | `slug` | Unique | SEO-friendly URL lookups |
| products | `categoryId` | Standard | Browse by category |
| products | `price` | Standard | Price range filters |
| products | `name, description` | Text | Full-text product search |
| orders | `userId` | Standard | User order history |
| orders | `status` | Standard | Filter by order state |
| orders | `items.productId` | Standard | Find orders containing a product |
| reviews | `(productId, userId)` | Compound Unique | One review per user per product |
| payments | `orderId` | Unique | One payment per order |
| coupons | `code` | Unique | Fast coupon lookup |
| coupons | `expiresAt` | Standard | Expiry cleanup queries |
| inventory | `(productId, sku)` | Compound Unique | Stock lookup per variant |
| carts | `userId` | Unique | One cart per user |

---

## 7. Script Structure

The script `ecommerce_mongodb.js` is organized into 7 numbered sections:

```
Section 1 — Database Setup & Validators    (lines ~1–120)
Section 2 — Indexes                        (lines ~121–175)
Section 3 — Data Insertion                 (lines ~176–2400)
  3.1  users         (20 docs)
  3.2  categories    (15 docs)
  3.3  sellers       (15 docs)
  3.4  products      (20 docs)
  3.5  coupons       (15 docs)
  3.6  orders        (18 docs)
  3.7  payments      (18 docs — auto-generated)
  3.8  reviews       (20 docs)
  3.9  carts         (15 docs)
  3.10 inventory     (20 docs)

Section 4 — CRUD Operations                (lines ~2401–2650)
  4.1  Insert (insertOne × 2, insertMany × 1)
  4.2  Read (find, findOne)
  4.3  Update (updateOne × 4, updateMany × 3)
  4.4  Delete (deleteOne × 1, deleteMany × 2)

Section 5 — Query Operations               (lines ~2651–3700)
  5.1  Comparison operators ($gt, $lt, $gte, $lte, $ne)
  5.2  Logical operators ($and, $or)
  5.3  $in and $nin
  5.4  Projection (include, exclude, nested)
  5.5  Sorting (single-key and multi-key)
  5.6  Limit and Skip (pagination)
```

---

## 8. CRUD Operations

All four CRUD operations are demonstrated with realistic, meaningful examples — not just placeholder data.

### Insert
```js
// insertOne — new user registration
db.users.insertOne({ name: "Tom Hanson", email: "tom.hanson@email.com", role: "customer", ... })

// insertOne — new promotional coupon
db.coupons.insertOne({ code: "CYBER25", type: "percentage", value: 25, ... })

// insertMany — bulk product catalog addition
db.products.insertMany([ airpodsPro, instantPot, patagoniaJacket ])
```

### Read
```js
// All active customers
db.users.find({ role: "customer", isActive: true })

// Single order by order number
db.orders.findOne({ orderNumber: "ORD-2024-000001" })

// Products with projection — public catalog view only
db.products.find({ isActive: true }, { name: 1, price: 1, averageRating: 1, _id: 0 })
```

### Update
```js
// updateOne — advance order to shipped + add tracking number
db.orders.updateOne(
  { orderNumber: "ORD-2024-000013" },
  { $set: { status: "shipped", trackingNumber: "TRK9988776655", updatedAt: new Date() } }
)

// updateOne — increment loyalty points
db.users.updateOne({ email: "alice.johnson@email.com" }, { $inc: { loyaltyPoints: 250 } })

// updateOne — push a new variant into a product's variants array
db.products.updateOne({ slug: "samsung-t9-portable-ssd-2tb" }, { $push: { variants: { ... } } })

// updateMany — apply sale price to all books (10% reduction using $mul)
db.products.updateMany({ categoryId: booksCategoryId }, { $mul: { price: 0.90 } })

// updateMany — increment usedCount for active coupons
db.coupons.updateMany({ isActive: true, usedCount: { $gt: 0 } }, { $inc: { usedCount: 1 } })
```

### Delete
```js
// deleteOne — remove an empty cart
db.carts.deleteOne({ userId: userId, totalItems: 0 })

// deleteMany — purge expired, fully-used coupons
db.coupons.deleteMany({ isActive: false, expiresAt: { $lt: new Date() } })

// deleteMany — clean up stale low-quality reviews (older than 1 year, 0 helpful votes)
db.reviews.deleteMany({ helpfulVotes: 0, createdAt: { $lt: oneYearAgo } })
```

---

## 9. Query Operations

### Comparison Operators
| Operator | Example Use Case |
|---|---|
| `$gt` | Products priced above $500 |
| `$lt` | Budget products under $50 |
| `$gte` | Users with 1,000+ loyalty points |
| `$lte` | Coupons with max discount ≤ $50 |
| `$ne` | Orders NOT in "delivered" status |

### Logical Operators
```js
// $and — active electronics with rating ≥ 4.7
db.products.find({ $and: [ { isActive: true }, { averageRating: { $gte: 4.7 } }, { categoryId: { $in: [...] } } ] })

// $or — users who are sellers OR admins
db.users.find({ $or: [{ role: "seller" }, { role: "admin" }] })

// $and + $or — delivered or shipped orders over $400
db.orders.find({ $and: [ { $or: [{ status: "delivered" }, { status: "shipped" }] }, { totalAmount: { $gt: 400 } } ] })
```

### $in and $nin
```js
// $in — orders with active statuses
db.orders.find({ status: { $in: ["pending", "confirmed", "shipped"] } })

// $nin — products NOT tagged apple or samsung
db.products.find({ tags: { $nin: ["apple", "samsung"] } })
```

### Projection
```js
// Include only specific fields (1 = include, _id excluded with 0)
db.products.find({}, { name: 1, price: 1, averageRating: 1, _id: 0 })

// Exclude sensitive fields
db.users.find({}, { passwordHash: 0 })

// Nested field projection
db.users.find({}, { name: 1, "address.city": 1, "address.country": 1 })
```

### Sorting, Limit & Skip
```js
// Sort products by price descending
db.products.find().sort({ price: -1 })

// Multi-key sort — reviews by helpfulness then recency
db.reviews.find().sort({ helpfulVotes: -1, createdAt: -1 })

// Pagination — page 2 of results (5 per page)
const PAGE_SIZE = 5;
db.products.find().sort({ averageRating: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE)
```

---
---

## 10. Data Design Decisions

**Why is the order `items` array embedded instead of a separate collection?**  
Order line items are a snapshot in time. If we referenced `productId` and the product price changed tomorrow, historical orders would show the wrong price. Embedding captures the exact price, name, and variant at the moment of purchase — this is standard e-commerce practice.

**Why is `couponCode` a string reference and not an ObjectId?**  
Coupons can be deactivated or deleted after a campaign ends. If we stored an ObjectId and the coupon was deleted, the order history would break. Storing the code string means the order always shows "coupon SAVE20 was applied" even if that coupon no longer exists.

**Why does `categories` use `parentId` as a string (slug) instead of ObjectId?**  
For readability in queries and scripts. When filtering products by category, filtering by the readable slug `"electronics"` is clearer than an ObjectId. In production with very large category trees you'd use ObjectId for referential integrity.

**Why is `inventory` a separate collection from `products`?**  
Products are managed by the seller. Inventory is managed by the warehouse team. These are different domains with different update rates and access patterns. Separating them follows the principle of separation of concerns.

**Why does `payments` duplicate `userId` from `orders`?**  
Denormalization for query performance. The finance team needs to query all payments by a user (`payments.find({ userId: ... })`) without always joining through orders. This is a deliberate trade-off of a small amount of redundancy for significantly faster and simpler payment queries.

---

## 11. Team Notes

### Folder Structure
```
project/
├── ecommerce_mongodb.js   ← Full database script (run this)  (~3,700 lines)
├── README.md              ← This file
└── ecommerce_schema.jsx   ← Interactive schema diagram (React)
```

### Naming Conventions
- Collection names: **camelCase plural** (`users`, `categories`, `orderItems`)
- Field names: **camelCase** (`createdAt`, `totalAmount`, `isActive`)
- Boolean fields: prefixed with `is` or `has` (`isActive`, `isVerified`, `isFeatured`)
- Array fields: suffixed with `[]` in docs, no suffix in actual field name (`variants`, `items`, `tags`)
- Dates: always stored as BSON `Date` objects, never strings
- Money values: always stored as `Double` in USD (or relevant currency)
- Counts/quantities: always stored as `Int` using `NumberInt()`

### Common Gotchas
- Always use `NumberInt()` for integer values in mongosh — without it, MongoDB stores numbers as `Double` by default
- The `$expr` operator is needed to compare two fields within the same document (e.g. `usedCount < maxUses`)
- When paginating, always apply a consistent `.sort()` before `.skip()` — otherwise results are non-deterministic
- The script must be run in order — later sections reference `ObjectId`s retrieved from earlier inserts

### How to Reset the Database
```js
use("ecommerce_db")
db.dropDatabase()
```
Or simply re-run `ecommerce_mongodb.js` — the `drop()` calls at the top handle it automatically.

---
