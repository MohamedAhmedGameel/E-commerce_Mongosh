// ╔══════════════════════════════════════════════════════════════════════════╗
// ║          E-COMMERCE PLATFORM — MongoDB Database Script                  ║
// ║          Advanced Database Systems — Final Project                      ║
// ║          Database: ecommerce_db                                          ║
// ║                                                                          ║
// ║  Collections:                                                            ║
// ║    1. users         6. reviews                                           ║
// ║    2. categories    7. carts                                             ║
// ║    3. sellers       8. payments                                          ║
// ║    4. products      9. coupons                                           ║
// ║    5. orders       10. inventory                                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝

use("ecommerce_db");

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 ── DATABASE SETUP & COLLECTION SCHEMA VALIDATORS
// ══════════════════════════════════════════════════════════════════════════════

// ── Drop existing collections for a clean slate ──────────────────────────────
db.users.drop();
db.categories.drop();
db.sellers.drop();
db.products.drop();
db.orders.drop();
db.reviews.drop();
db.carts.drop();
db.payments.drop();
db.coupons.drop();
db.inventory.drop();

print("✓ All collections dropped. Starting fresh build...\n");

// ── 1. users ─────────────────────────────────────────────────────────────────
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "role", "isActive", "createdAt"],
      properties: {
        name:         { bsonType: "string",  description: "Full name is required" },
        email:        { bsonType: "string",  description: "Email is required" },
        passwordHash: { bsonType: "string" },
        phone:        { bsonType: "string" },
        role:         { enum: ["customer", "admin", "seller"], description: "Must be a valid role" },
        isActive:     { bsonType: "bool" },
        loyaltyPoints:{ bsonType: "int" },
        createdAt:    { bsonType: "date" },
        address: {
          bsonType: "object",
          properties: {
            street:  { bsonType: "string" },
            city:    { bsonType: "string" },
            country: { bsonType: "string" },
            zipCode: { bsonType: "string" }
          }
        }
      }
    }
  },
  validationAction: "warn"
});

// ── 2. categories ─────────────────────────────────────────────────────────────
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "isActive"],
      properties: {
        name:        { bsonType: "string" },
        slug:        { bsonType: "string" },
        description: { bsonType: "string" },
        isActive:    { bsonType: "bool" }
      }
    }
  },
  validationAction: "warn"
});

// ── 3. sellers ────────────────────────────────────────────────────────────────
db.createCollection("sellers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["storeName", "userId", "isVerified", "joinedAt"],
      properties: {
        storeName:  { bsonType: "string" },
        userId:     { bsonType: "objectId" },
        isVerified: { bsonType: "bool" },
        rating:     { bsonType: "double", minimum: 0, maximum: 5 },
        joinedAt:   { bsonType: "date" }
      }
    }
  },
  validationAction: "warn"
});

// ── 4. products ───────────────────────────────────────────────────────────────
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "price", "categoryId", "sellerId", "isActive"],
      properties: {
        name:     { bsonType: "string" },
        slug:     { bsonType: "string" },
        price:    { bsonType: "double", minimum: 0 },
        isActive: { bsonType: "bool" }
      }
    }
  },
  validationAction: "warn"
});

// ── 5. orders ─────────────────────────────────────────────────────────────────
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items", "totalAmount", "status", "createdAt"],
      properties: {
        userId:      { bsonType: "objectId" },
        totalAmount: { bsonType: "double", minimum: 0 },
        status:      { enum: ["pending","confirmed","shipped","delivered","cancelled","refunded"] },
        createdAt:   { bsonType: "date" }
      }
    }
  },
  validationAction: "warn"
});

// ── 6–10: reviews, carts, payments, coupons, inventory ───────────────────────
db.createCollection("reviews");
db.createCollection("carts");
db.createCollection("payments");
db.createCollection("coupons");
db.createCollection("inventory");

print("✓ All collections created with schema validators.\n");


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 ── INDEXES (Performance & Uniqueness)
// ══════════════════════════════════════════════════════════════════════════════

// users
db.users.createIndex({ email: 1 },        { unique: true, name: "idx_users_email_unique" });
db.users.createIndex({ role: 1 },                        { name: "idx_users_role" });
db.users.createIndex({ createdAt: -1 },                  { name: "idx_users_created_desc" });

// categories
db.categories.createIndex({ slug: 1 },    { unique: true, name: "idx_categories_slug_unique" });
db.categories.createIndex({ parentId: 1 },               { name: "idx_categories_parent" });

// sellers
db.sellers.createIndex({ userId: 1 },     { unique: true, name: "idx_sellers_userid_unique" });
db.sellers.createIndex({ rating: -1 },                   { name: "idx_sellers_rating_desc" });
db.sellers.createIndex({ storeName: "text" },            { name: "idx_sellers_text" });

// products
db.products.createIndex({ slug: 1 },      { unique: true, name: "idx_products_slug_unique" });
db.products.createIndex({ categoryId: 1 },               { name: "idx_products_category" });
db.products.createIndex({ sellerId: 1 },                 { name: "idx_products_seller" });
db.products.createIndex({ price: 1 },                    { name: "idx_products_price" });
db.products.createIndex({ averageRating: -1 },           { name: "idx_products_rating_desc" });
db.products.createIndex({ tags: 1 },                     { name: "idx_products_tags" });
db.products.createIndex({ name: "text", description: "text" }, { name: "idx_products_fulltext" });

// orders
db.orders.createIndex({ userId: 1 },                     { name: "idx_orders_user" });
db.orders.createIndex({ status: 1 },                     { name: "idx_orders_status" });
db.orders.createIndex({ createdAt: -1 },                 { name: "idx_orders_created_desc" });
db.orders.createIndex({ "items.productId": 1 },          { name: "idx_orders_product" });

// reviews
db.reviews.createIndex({ productId: 1, userId: 1 }, { unique: true, name: "idx_reviews_product_user_unique" });
db.reviews.createIndex({ productId: 1, createdAt: -1 },  { name: "idx_reviews_product_date" });
db.reviews.createIndex({ userId: 1 },                    { name: "idx_reviews_user" });

// payments
db.payments.createIndex({ orderId: 1 },   { unique: true, name: "idx_payments_order_unique" });
db.payments.createIndex({ userId: 1 },                   { name: "idx_payments_user" });
db.payments.createIndex({ transactionId: 1 },            { name: "idx_payments_txn" });

// coupons
db.coupons.createIndex({ code: 1 },       { unique: true, name: "idx_coupons_code_unique" });
db.coupons.createIndex({ expiresAt: 1 },                 { name: "idx_coupons_expiry" });

// inventory
db.inventory.createIndex({ productId: 1, sku: 1 }, { unique: true, name: "idx_inventory_product_sku_unique" });
db.inventory.createIndex({ quantity: 1 },                { name: "idx_inventory_qty" });

// carts
db.carts.createIndex({ userId: 1 },       { unique: true, name: "idx_carts_user_unique" });

print("✓ All indexes created.\n");


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 ── DATA INSERTION
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 3.1  USERS  (20 documents)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting users...");

const usersResult = db.users.insertMany([
  {
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    passwordHash: "$2b$12$hashed_password_001",
    phone: "+1-555-0101",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(1250),
    createdAt: new Date("2023-01-15"),
    lastLoginAt: new Date("2024-11-20"),
    address: {
      street: "14 Maple Avenue",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Bob Martinez",
    email: "bob.martinez@email.com",
    passwordHash: "$2b$12$hashed_password_002",
    phone: "+1-555-0102",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(870),
    createdAt: new Date("2023-02-20"),
    lastLoginAt: new Date("2024-11-18"),
    address: {
      street: "7 Sunset Blvd",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      zipCode: "90001"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: false
    }
  },
  {
    name: "Clara Chen",
    email: "clara.chen@email.com",
    passwordHash: "$2b$12$hashed_password_003",
    phone: "+1-555-0103",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(3400),
    createdAt: new Date("2022-11-05"),
    lastLoginAt: new Date("2024-11-21"),
    address: {
      street: "88 Orchid Street",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      zipCode: "94102"
    },
    preferences: {
      currency: "USD",
      language: "zh",
      newsletterSubscribed: true
    }
  },
  {
    name: "David Kim",
    email: "david.kim@email.com",
    passwordHash: "$2b$12$hashed_password_004",
    phone: "+1-555-0104",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(520),
    createdAt: new Date("2023-07-11"),
    lastLoginAt: new Date("2024-10-30"),
    address: {
      street: "23 Elm Road",
      city: "Chicago",
      state: "IL",
      country: "USA",
      zipCode: "60601"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    passwordHash: "$2b$12$hashed_password_005",
    phone: "+1-555-0105",
    role: "customer",
    isActive: false,
    loyaltyPoints: NumberInt(150),
    createdAt: new Date("2023-05-22"),
    lastLoginAt: new Date("2024-06-10"),
    address: {
      street: "5 Birch Lane",
      city: "Houston",
      state: "TX",
      country: "USA",
      zipCode: "77001"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: false
    }
  },
  {
    name: "Frank Nguyen",
    email: "frank.nguyen@email.com",
    passwordHash: "$2b$12$hashed_password_006",
    phone: "+1-555-0106",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(2100),
    createdAt: new Date("2022-08-14"),
    lastLoginAt: new Date("2024-11-19"),
    address: {
      street: "101 Pine Street",
      city: "Seattle",
      state: "WA",
      country: "USA",
      zipCode: "98101"
    },
    preferences: {
      currency: "USD",
      language: "vi",
      newsletterSubscribed: true
    }
  },
  {
    name: "Grace Patel",
    email: "grace.patel@email.com",
    passwordHash: "$2b$12$hashed_password_007",
    phone: "+1-555-0107",
    role: "seller",
    isActive: true,
    loyaltyPoints: NumberInt(600),
    createdAt: new Date("2022-03-09"),
    lastLoginAt: new Date("2024-11-20"),
    address: {
      street: "34 Lotus Drive",
      city: "Phoenix",
      state: "AZ",
      country: "USA",
      zipCode: "85001"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Henry Brooks",
    email: "henry.brooks@email.com",
    passwordHash: "$2b$12$hashed_password_008",
    phone: "+1-555-0108",
    role: "seller",
    isActive: true,
    loyaltyPoints: NumberInt(300),
    createdAt: new Date("2021-12-01"),
    lastLoginAt: new Date("2024-11-15"),
    address: {
      street: "90 Cedar Court",
      city: "Dallas",
      state: "TX",
      country: "USA",
      zipCode: "75201"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: false
    }
  },
  {
    name: "Irene Rossi",
    email: "irene.rossi@email.com",
    passwordHash: "$2b$12$hashed_password_009",
    phone: "+39-555-0109",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(980),
    createdAt: new Date("2023-09-30"),
    lastLoginAt: new Date("2024-11-17"),
    address: {
      street: "Via Roma 12",
      city: "Milan",
      state: "Lombardia",
      country: "Italy",
      zipCode: "20100"
    },
    preferences: {
      currency: "EUR",
      language: "it",
      newsletterSubscribed: true
    }
  },
  {
    name: "Jake Thompson",
    email: "jake.thompson@email.com",
    passwordHash: "$2b$12$hashed_password_010",
    phone: "+1-555-0110",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(4500),
    createdAt: new Date("2022-01-20"),
    lastLoginAt: new Date("2024-11-21"),
    address: {
      street: "200 Oak Boulevard",
      city: "Boston",
      state: "MA",
      country: "USA",
      zipCode: "02101"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Karen Lee",
    email: "karen.lee@email.com",
    passwordHash: "$2b$12$hashed_password_011",
    phone: "+1-555-0111",
    role: "seller",
    isActive: true,
    loyaltyPoints: NumberInt(750),
    createdAt: new Date("2021-07-15"),
    lastLoginAt: new Date("2024-11-20"),
    address: {
      street: "12 Magnolia Way",
      city: "Portland",
      state: "OR",
      country: "USA",
      zipCode: "97201"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Liam O'Brien",
    email: "liam.obrien@email.com",
    passwordHash: "$2b$12$hashed_password_012",
    phone: "+353-555-0112",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(290),
    createdAt: new Date("2023-11-01"),
    lastLoginAt: new Date("2024-11-10"),
    address: {
      street: "8 Clover Lane",
      city: "Dublin",
      state: "Leinster",
      country: "Ireland",
      zipCode: "D01"
    },
    preferences: {
      currency: "EUR",
      language: "en",
      newsletterSubscribed: false
    }
  },
  {
    name: "Mia Santos",
    email: "mia.santos@email.com",
    passwordHash: "$2b$12$hashed_password_013",
    phone: "+1-555-0113",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(1800),
    createdAt: new Date("2022-06-18"),
    lastLoginAt: new Date("2024-11-16"),
    address: {
      street: "330 Hibiscus Road",
      city: "Miami",
      state: "FL",
      country: "USA",
      zipCode: "33101"
    },
    preferences: {
      currency: "USD",
      language: "es",
      newsletterSubscribed: true
    }
  },
  {
    name: "Nathan Russo",
    email: "nathan.russo@email.com",
    passwordHash: "$2b$12$hashed_password_014",
    phone: "+1-555-0114",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(60),
    createdAt: new Date("2024-01-05"),
    lastLoginAt: new Date("2024-11-01"),
    address: {
      street: "55 Walnut Street",
      city: "Denver",
      state: "CO",
      country: "USA",
      zipCode: "80201"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Olivia Wang",
    email: "olivia.wang@email.com",
    passwordHash: "$2b$12$hashed_password_015",
    phone: "+1-555-0115",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(3100),
    createdAt: new Date("2022-04-25"),
    lastLoginAt: new Date("2024-11-21"),
    address: {
      street: "67 Jade Avenue",
      city: "Austin",
      state: "TX",
      country: "USA",
      zipCode: "73301"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Paul Evans",
    email: "paul.evans@email.com",
    passwordHash: "$2b$12$hashed_password_016",
    phone: "+44-555-0116",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(1400),
    createdAt: new Date("2023-03-14"),
    lastLoginAt: new Date("2024-11-14"),
    address: {
      street: "19 Baker Street",
      city: "London",
      state: "England",
      country: "UK",
      zipCode: "W1U"
    },
    preferences: {
      currency: "GBP",
      language: "en",
      newsletterSubscribed: false
    }
  },
  {
    name: "Quinn Murphy",
    email: "quinn.murphy@email.com",
    passwordHash: "$2b$12$hashed_password_017",
    phone: "+1-555-0117",
    role: "customer",
    isActive: false,
    loyaltyPoints: NumberInt(0),
    createdAt: new Date("2024-03-22"),
    lastLoginAt: new Date("2024-04-01"),
    address: {
      street: "3 Redwood Circle",
      city: "San Diego",
      state: "CA",
      country: "USA",
      zipCode: "92101"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: false
    }
  },
  {
    name: "Rachel Scott",
    email: "rachel.scott@email.com",
    passwordHash: "$2b$12$hashed_password_018",
    phone: "+1-555-0118",
    role: "seller",
    isActive: true,
    loyaltyPoints: NumberInt(430),
    createdAt: new Date("2021-09-10"),
    lastLoginAt: new Date("2024-11-20"),
    address: {
      street: "77 Aspen Trail",
      city: "Nashville",
      state: "TN",
      country: "USA",
      zipCode: "37201"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: true
    }
  },
  {
    name: "Sam Hernandez",
    email: "sam.hernandez@email.com",
    passwordHash: "$2b$12$hashed_password_019",
    phone: "+1-555-0119",
    role: "customer",
    isActive: true,
    loyaltyPoints: NumberInt(2700),
    createdAt: new Date("2022-10-03"),
    lastLoginAt: new Date("2024-11-19"),
    address: {
      street: "62 Cactus Road",
      city: "San Antonio",
      state: "TX",
      country: "USA",
      zipCode: "78201"
    },
    preferences: {
      currency: "USD",
      language: "es",
      newsletterSubscribed: true
    }
  },
  {
    name: "Admin SuperUser",
    email: "admin@ecommerce.com",
    passwordHash: "$2b$12$hashed_password_020",
    phone: "+1-555-0000",
    role: "admin",
    isActive: true,
    loyaltyPoints: NumberInt(0),
    createdAt: new Date("2021-01-01"),
    lastLoginAt: new Date("2024-11-21"),
    address: {
      street: "1 Corporate Plaza",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001"
    },
    preferences: {
      currency: "USD",
      language: "en",
      newsletterSubscribed: false
    }
  }
]);

print(`  ✓ Inserted ${usersResult.insertedIds ? Object.keys(usersResult.insertedIds).length : 20} users.\n`);

// ─────────────────────────────────────────────────────────────────────────────
// 3.2  CATEGORIES  (15 documents — includes parent & child categories)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting categories...");

const catResult = db.categories.insertMany([
  {
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets, devices, and electronic accessories",
    imageUrl: "/images/categories/electronics.jpg",
    parentId: null,
    isActive: true,
    sortOrder: NumberInt(1),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Smartphones",
    slug: "smartphones",
    description: "Latest smartphones from top brands",
    imageUrl: "/images/categories/smartphones.jpg",
    parentId: "electronics",
    isActive: true,
    sortOrder: NumberInt(1),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Laptops & Computers",
    slug: "laptops-computers",
    description: "Laptops, desktops, and computing accessories",
    imageUrl: "/images/categories/laptops.jpg",
    parentId: "electronics",
    isActive: true,
    sortOrder: NumberInt(2),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Audio & Headphones",
    slug: "audio-headphones",
    description: "Headphones, earbuds, speakers, and audio equipment",
    imageUrl: "/images/categories/audio.jpg",
    parentId: "electronics",
    isActive: true,
    sortOrder: NumberInt(3),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Clothing & Fashion",
    slug: "clothing-fashion",
    description: "Apparel, shoes, and fashion accessories",
    imageUrl: "/images/categories/clothing.jpg",
    parentId: null,
    isActive: true,
    sortOrder: NumberInt(2),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Men's Clothing",
    slug: "mens-clothing",
    description: "T-shirts, trousers, jackets, and more for men",
    imageUrl: "/images/categories/mens.jpg",
    parentId: "clothing-fashion",
    isActive: true,
    sortOrder: NumberInt(1),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Women's Clothing",
    slug: "womens-clothing",
    description: "Dresses, blouses, skirts, and more for women",
    imageUrl: "/images/categories/womens.jpg",
    parentId: "clothing-fashion",
    isActive: true,
    sortOrder: NumberInt(2),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, decor, kitchenware, and more",
    imageUrl: "/images/categories/home.jpg",
    parentId: null,
    isActive: true,
    sortOrder: NumberInt(3),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Kitchen & Dining",
    slug: "kitchen-dining",
    description: "Cookware, appliances, and dining accessories",
    imageUrl: "/images/categories/kitchen.jpg",
    parentId: "home-living",
    isActive: true,
    sortOrder: NumberInt(1),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Books & Media",
    slug: "books-media",
    description: "Books, e-books, music, and educational content",
    imageUrl: "/images/categories/books.jpg",
    parentId: null,
    isActive: true,
    sortOrder: NumberInt(4),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Equipment, apparel, and accessories for sports and outdoor activities",
    imageUrl: "/images/categories/sports.jpg",
    parentId: null,
    isActive: true,
    sortOrder: NumberInt(5),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Fitness Equipment",
    slug: "fitness-equipment",
    description: "Gym equipment, yoga, and home workout gear",
    imageUrl: "/images/categories/fitness.jpg",
    parentId: "sports-outdoors",
    isActive: true,
    sortOrder: NumberInt(1),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Skincare, haircare, fragrances, and grooming",
    imageUrl: "/images/categories/beauty.jpg",
    parentId: null,
    isActive: true,
    sortOrder: NumberInt(6),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    description: "Toys, board games, and children's entertainment",
    imageUrl: "/images/categories/toys.jpg",
    parentId: null,
    isActive: true,
    sortOrder: NumberInt(7),
    createdAt: new Date("2021-01-01")
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Consoles, games, and gaming peripherals",
    imageUrl: "/images/categories/gaming.jpg",
    parentId: "electronics",
    isActive: true,
    sortOrder: NumberInt(4),
    createdAt: new Date("2021-01-01")
  }
]);

print(`  ✓ Inserted ${catResult.insertedIds ? Object.keys(catResult.insertedIds).length : 15} categories.\n`);

// ─────────────────────────────────────────────────────────────────────────────
// 3.3  SELLERS  (15 documents — reference user IDs by email for clarity)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting sellers...");

// Fetch user ObjectIds for sellers
const sellerUser1 = db.users.findOne({ email: "grace.patel@email.com" });
const sellerUser2 = db.users.findOne({ email: "henry.brooks@email.com" });
const sellerUser3 = db.users.findOne({ email: "karen.lee@email.com" });
const sellerUser4 = db.users.findOne({ email: "rachel.scott@email.com" });

db.sellers.insertMany([
  {
    storeName: "TechVault",
    userId: sellerUser1._id,
    description: "Premium electronics and gadgets since 2018",
    logoUrl: "/images/sellers/techvault.png",
    rating: 4.8,
    totalSales: NumberInt(15400),
    totalRevenue: 2_340_000.00,
    isVerified: true,
    joinedAt: new Date("2021-03-10"),
    contactEmail: "support@techvault.com",
    policies: {
      returnDays: NumberInt(30),
      freeShippingAbove: 50.00,
      shipsFrom: "Phoenix, AZ"
    },
    socialLinks: {
      website: "https://techvault.com",
      instagram: "@techvault",
      twitter: "@TechVaultStore"
    }
  },
  {
    storeName: "BrooksGear",
    userId: sellerUser2._id,
    description: "Sports and outdoor adventure equipment",
    logoUrl: "/images/sellers/brooksgear.png",
    rating: 4.5,
    totalSales: NumberInt(8900),
    totalRevenue: 890_000.00,
    isVerified: true,
    joinedAt: new Date("2021-12-01"),
    contactEmail: "hello@brooksgear.com",
    policies: {
      returnDays: NumberInt(14),
      freeShippingAbove: 75.00,
      shipsFrom: "Dallas, TX"
    },
    socialLinks: {
      website: "https://brooksgear.com",
      instagram: "@brooksgear"
    }
  },
  {
    storeName: "StyleForward",
    userId: sellerUser3._id,
    description: "Contemporary fashion for modern lifestyles",
    logoUrl: "/images/sellers/styleforward.png",
    rating: 4.6,
    totalSales: NumberInt(22300),
    totalRevenue: 1_670_000.00,
    isVerified: true,
    joinedAt: new Date("2021-07-15"),
    contactEmail: "contact@styleforward.com",
    policies: {
      returnDays: NumberInt(21),
      freeShippingAbove: 40.00,
      shipsFrom: "Portland, OR"
    },
    socialLinks: {
      website: "https://styleforward.com",
      instagram: "@styleforward",
      pinterest: "StyleForward"
    }
  },
  {
    storeName: "HomeHaven",
    userId: sellerUser4._id,
    description: "Quality home goods and décor for every taste",
    logoUrl: "/images/sellers/homehaven.png",
    rating: 4.3,
    totalSales: NumberInt(6700),
    totalRevenue: 540_000.00,
    isVerified: true,
    joinedAt: new Date("2021-09-10"),
    contactEmail: "shop@homehaven.com",
    policies: {
      returnDays: NumberInt(30),
      freeShippingAbove: 60.00,
      shipsFrom: "Nashville, TN"
    },
    socialLinks: {
      website: "https://homehaven.com",
      instagram: "@homehaven"
    }
  },
  // Additional virtual sellers (without linked users for realism)
  {
    storeName: "AudioPeak",
    userId: new ObjectId(),
    description: "Audiophile-grade headphones, speakers, and accessories",
    logoUrl: "/images/sellers/audiopeak.png",
    rating: 4.9,
    totalSales: NumberInt(11200),
    totalRevenue: 1_950_000.00,
    isVerified: true,
    joinedAt: new Date("2020-06-01"),
    contactEmail: "info@audiopeak.com",
    policies: {
      returnDays: NumberInt(45),
      freeShippingAbove: 100.00,
      shipsFrom: "New York, NY"
    },
    socialLinks: {
      website: "https://audiopeak.com",
      youtube: "AudioPeakOfficial"
    }
  },
  {
    storeName: "LitCorner",
    userId: new ObjectId(),
    description: "Books, e-books, and educational media",
    logoUrl: "/images/sellers/litcorner.png",
    rating: 4.7,
    totalSales: NumberInt(31000),
    totalRevenue: 620_000.00,
    isVerified: true,
    joinedAt: new Date("2020-09-15"),
    contactEmail: "hello@litcorner.com",
    policies: {
      returnDays: NumberInt(10),
      freeShippingAbove: 25.00,
      shipsFrom: "Boston, MA"
    },
    socialLinks: {
      website: "https://litcorner.com",
      goodreads: "LitCornerStore"
    }
  },
  {
    storeName: "GlowBeauty",
    userId: new ObjectId(),
    description: "Natural skincare and cruelty-free beauty products",
    logoUrl: "/images/sellers/glowbeauty.png",
    rating: 4.4,
    totalSales: NumberInt(18700),
    totalRevenue: 840_000.00,
    isVerified: true,
    joinedAt: new Date("2021-02-20"),
    contactEmail: "support@glowbeauty.com",
    policies: {
      returnDays: NumberInt(14),
      freeShippingAbove: 35.00,
      shipsFrom: "Miami, FL"
    },
    socialLinks: {
      website: "https://glowbeauty.com",
      instagram: "@glowbeauty",
      tiktok: "@glowbeautyco"
    }
  },
  {
    storeName: "GamerZone",
    userId: new ObjectId(),
    description: "Consoles, games, and pro-gaming gear",
    logoUrl: "/images/sellers/gamerzone.png",
    rating: 4.6,
    totalSales: NumberInt(9400),
    totalRevenue: 2_100_000.00,
    isVerified: true,
    joinedAt: new Date("2020-11-05"),
    contactEmail: "deals@gamerzone.com",
    policies: {
      returnDays: NumberInt(15),
      freeShippingAbove: 80.00,
      shipsFrom: "Austin, TX"
    },
    socialLinks: {
      website: "https://gamerzone.com",
      twitch: "GamerZoneDeals",
      discord: "GamerZone"
    }
  },
  {
    storeName: "KidsWorld",
    userId: new ObjectId(),
    description: "Safe and educational toys for all ages",
    logoUrl: "/images/sellers/kidsworld.png",
    rating: 4.8,
    totalSales: NumberInt(25100),
    totalRevenue: 780_000.00,
    isVerified: true,
    joinedAt: new Date("2020-04-10"),
    contactEmail: "care@kidsworld.com",
    policies: {
      returnDays: NumberInt(30),
      freeShippingAbove: 45.00,
      shipsFrom: "Chicago, IL"
    },
    socialLinks: {
      website: "https://kidsworld.com",
      facebook: "KidsWorldToys"
    }
  },
  {
    storeName: "FreshKitchen",
    userId: new ObjectId(),
    description: "Chef-quality cookware and kitchen gadgets",
    logoUrl: "/images/sellers/freshkitchen.png",
    rating: 4.5,
    totalSales: NumberInt(7600),
    totalRevenue: 380_000.00,
    isVerified: false,
    joinedAt: new Date("2022-07-01"),
    contactEmail: "orders@freshkitchen.com",
    policies: {
      returnDays: NumberInt(21),
      freeShippingAbove: 55.00,
      shipsFrom: "San Francisco, CA"
    },
    socialLinks: {
      website: "https://freshkitchen.com",
      instagram: "@freshkitchenco"
    }
  },
  {
    storeName: "RunFast",
    userId: new ObjectId(),
    description: "Performance running shoes and fitness apparel",
    logoUrl: "/images/sellers/runfast.png",
    rating: 4.3,
    totalSales: NumberInt(5400),
    totalRevenue: 490_000.00,
    isVerified: true,
    joinedAt: new Date("2022-01-15"),
    contactEmail: "team@runfast.com",
    policies: {
      returnDays: NumberInt(30),
      freeShippingAbove: 70.00,
      shipsFrom: "Seattle, WA"
    },
    socialLinks: {
      website: "https://runfast.com",
      strava: "RunFastStore"
    }
  },
  {
    storeName: "PixelBox",
    userId: new ObjectId(),
    description: "Cameras, lenses, and photography equipment",
    logoUrl: "/images/sellers/pixelbox.png",
    rating: 4.7,
    totalSales: NumberInt(3800),
    totalRevenue: 1_150_000.00,
    isVerified: true,
    joinedAt: new Date("2021-05-20"),
    contactEmail: "hello@pixelbox.com",
    policies: {
      returnDays: NumberInt(30),
      freeShippingAbove: 100.00,
      shipsFrom: "New York, NY"
    },
    socialLinks: {
      website: "https://pixelbox.com",
      instagram: "@pixelboxphotos"
    }
  },
  {
    storeName: "EcoNest",
    userId: new ObjectId(),
    description: "Sustainable, eco-friendly lifestyle products",
    logoUrl: "/images/sellers/econest.png",
    rating: 4.6,
    totalSales: NumberInt(4200),
    totalRevenue: 210_000.00,
    isVerified: true,
    joinedAt: new Date("2022-03-30"),
    contactEmail: "green@econest.com",
    policies: {
      returnDays: NumberInt(30),
      freeShippingAbove: 30.00,
      shipsFrom: "Portland, OR"
    },
    socialLinks: {
      website: "https://econest.com",
      instagram: "@econest",
      tiktok: "@econestlife"
    }
  },
  {
    storeName: "VoltTech",
    userId: new ObjectId(),
    description: "Budget and mid-range electronics for everyday use",
    logoUrl: "/images/sellers/volttech.png",
    rating: 4.1,
    totalSales: NumberInt(19000),
    totalRevenue: 1_600_000.00,
    isVerified: true,
    joinedAt: new Date("2020-08-01"),
    contactEmail: "service@volttech.com",
    policies: {
      returnDays: NumberInt(15),
      freeShippingAbove: 60.00,
      shipsFrom: "Las Vegas, NV"
    },
    socialLinks: {
      website: "https://volttech.com",
      twitter: "@VoltTechDeals"
    }
  },
  {
    storeName: "PetParadise",
    userId: new ObjectId(),
    description: "Everything your pets need and love",
    logoUrl: "/images/sellers/petparadise.png",
    rating: 4.8,
    totalSales: NumberInt(14500),
    totalRevenue: 430_000.00,
    isVerified: true,
    joinedAt: new Date("2021-10-05"),
    contactEmail: "woof@petparadise.com",
    policies: {
      returnDays: NumberInt(30),
      freeShippingAbove: 40.00,
      shipsFrom: "Denver, CO"
    },
    socialLinks: {
      website: "https://petparadise.com",
      instagram: "@petparadise",
      facebook: "PetParadiseStore"
    }
  }
]);

print(`  ✓ Inserted 15 sellers.\n`);

// ─────────────────────────────────────────────────────────────────────────────
// 3.4  PRODUCTS  (20 documents — rich nested structure)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting products...");

// Fetch seller and category IDs
const techVault    = db.sellers.findOne({ storeName: "TechVault" });
const audioPeak    = db.sellers.findOne({ storeName: "AudioPeak" });
const styleForward = db.sellers.findOne({ storeName: "StyleForward" });
const homeHaven    = db.sellers.findOne({ storeName: "HomeHaven" });
const brooksGear   = db.sellers.findOne({ storeName: "BrooksGear" });
const gamerZone    = db.sellers.findOne({ storeName: "GamerZone" });
const litCorner    = db.sellers.findOne({ storeName: "LitCorner" });
const glowBeauty   = db.sellers.findOne({ storeName: "GlowBeauty" });
const freshKitchen = db.sellers.findOne({ storeName: "FreshKitchen" });
const kidsWorld    = db.sellers.findOne({ storeName: "KidsWorld" });
const runFast      = db.sellers.findOne({ storeName: "RunFast" });
const voltTech     = db.sellers.findOne({ storeName: "VoltTech" });
const ecoNest      = db.sellers.findOne({ storeName: "EcoNest" });

const catSmartphones    = db.categories.findOne({ slug: "smartphones" });
const catLaptops        = db.categories.findOne({ slug: "laptops-computers" });
const catAudio          = db.categories.findOne({ slug: "audio-headphones" });
const catMens           = db.categories.findOne({ slug: "mens-clothing" });
const catWomens         = db.categories.findOne({ slug: "womens-clothing" });
const catKitchen        = db.categories.findOne({ slug: "kitchen-dining" });
const catBooks          = db.categories.findOne({ slug: "books-media" });
const catBeauty         = db.categories.findOne({ slug: "beauty-personal-care" });
const catToys           = db.categories.findOne({ slug: "toys-games" });
const catGaming         = db.categories.findOne({ slug: "gaming" });
const catFitness        = db.categories.findOne({ slug: "fitness-equipment" });
const catSports         = db.categories.findOne({ slug: "sports-outdoors" });

db.products.insertMany([
  // ── PRODUCT 1: iPhone 16 Pro ─────────────────────────────────────────────
  {
    name: "Apple iPhone 16 Pro",
    slug: "apple-iphone-16-pro",
    description: "The most advanced iPhone ever, featuring the A18 Pro chip, titanium design, and ProCamera system with 5x optical zoom.",
    shortDescription: "Titanium. A18 Pro. ProCamera.",
    brand: "Apple",
    sku: "APL-IP16P-001",
    price: 999.00,
    compareAtPrice: 1099.00,
    costPrice: 620.00,
    categoryId: catSmartphones._id,
    sellerId: techVault._id,
    images: [
      { url: "/images/products/iphone16pro-1.jpg", altText: "iPhone 16 Pro front", isPrimary: true },
      { url: "/images/products/iphone16pro-2.jpg", altText: "iPhone 16 Pro back", isPrimary: false }
    ],
    specifications: {
      display: "6.3-inch Super Retina XDR, ProMotion 120Hz",
      processor: "Apple A18 Pro",
      ram: "8GB",
      battery: "3274 mAh, 27W fast charging",
      camera: "48MP main + 12MP ultrawide + 12MP 5x telephoto",
      os: "iOS 18",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, USB-C"
    },
    variants: [
      { color: "Black Titanium",   storage: "128GB", additionalPrice: 0,      stock: NumberInt(45) },
      { color: "Black Titanium",   storage: "256GB", additionalPrice: 100.00, stock: NumberInt(38) },
      { color: "White Titanium",   storage: "128GB", additionalPrice: 0,      stock: NumberInt(30) },
      { color: "White Titanium",   storage: "256GB", additionalPrice: 100.00, stock: NumberInt(22) },
      { color: "Desert Titanium",  storage: "512GB", additionalPrice: 300.00, stock: NumberInt(15) }
    ],
    tags: ["apple", "smartphone", "iphone", "5g", "flagship"],
    averageRating: 4.8,
    reviewCount: NumberInt(312),
    totalSold: NumberInt(1870),
    isActive: true,
    isFeatured: true,
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2024-11-01")
  },

  // ── PRODUCT 2: Samsung Galaxy S24 Ultra ──────────────────────────────────
  {
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    description: "The ultimate Galaxy experience with built-in S Pen, 200MP camera, and AI-powered features that redefine mobile photography.",
    shortDescription: "200MP AI Camera. Built-in S Pen. Galaxy AI.",
    brand: "Samsung",
    sku: "SAM-GS24U-001",
    price: 1199.99,
    compareAtPrice: 1299.99,
    costPrice: 750.00,
    categoryId: catSmartphones._id,
    sellerId: voltTech._id,
    images: [
      { url: "/images/products/s24ultra-1.jpg", altText: "Galaxy S24 Ultra front", isPrimary: true },
      { url: "/images/products/s24ultra-2.jpg", altText: "Galaxy S24 Ultra with S Pen", isPrimary: false }
    ],
    specifications: {
      display: "6.8-inch Dynamic AMOLED 2X, 120Hz",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      battery: "5000 mAh, 45W fast charging",
      camera: "200MP main + 50MP 5x + 10MP 3x + 12MP ultrawide",
      os: "Android 14 / One UI 6.1",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, USB-C 3.2"
    },
    variants: [
      { color: "Titanium Black",  storage: "256GB", additionalPrice: 0,      stock: NumberInt(60) },
      { color: "Titanium Gray",   storage: "256GB", additionalPrice: 0,      stock: NumberInt(45) },
      { color: "Titanium Violet", storage: "512GB", additionalPrice: 120.00, stock: NumberInt(28) },
      { color: "Titanium Yellow", storage: "1TB",   additionalPrice: 240.00, stock: NumberInt(10) }
    ],
    tags: ["samsung", "smartphone", "galaxy", "s-pen", "200mp"],
    averageRating: 4.7,
    reviewCount: NumberInt(427),
    totalSold: NumberInt(2240),
    isActive: true,
    isFeatured: true,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-11-01")
  },

  // ── PRODUCT 3: MacBook Pro 14" M4 ────────────────────────────────────────
  {
    name: "Apple MacBook Pro 14-inch M4",
    slug: "apple-macbook-pro-14-m4",
    description: "Supercharged by M4, M4 Pro, or M4 Max chip. The MacBook Pro lineup delivers unprecedented performance for demanding professional workflows.",
    shortDescription: "M4 Pro chip. Liquid Retina XDR. Up to 24 hours battery.",
    brand: "Apple",
    sku: "APL-MBP14-M4",
    price: 1599.00,
    compareAtPrice: 1799.00,
    costPrice: 980.00,
    categoryId: catLaptops._id,
    sellerId: techVault._id,
    images: [
      { url: "/images/products/mbp14m4-1.jpg", altText: "MacBook Pro 14 M4 open", isPrimary: true }
    ],
    specifications: {
      display: "14.2-inch Liquid Retina XDR, 120Hz ProMotion",
      processor: "Apple M4 Pro (14-core CPU, 20-core GPU)",
      ram: "24GB Unified Memory",
      storage: "512GB SSD",
      battery: "Up to 24 hours",
      ports: "3x Thunderbolt 5, HDMI, SD card, MagSafe 3",
      os: "macOS Sequoia"
    },
    variants: [
      { chip: "M4",       ram: "16GB", storage: "512GB", additionalPrice: -400.00, stock: NumberInt(25) },
      { chip: "M4 Pro",   ram: "24GB", storage: "512GB", additionalPrice: 0,       stock: NumberInt(40) },
      { chip: "M4 Pro",   ram: "24GB", storage: "1TB",   additionalPrice: 200.00,  stock: NumberInt(20) },
      { chip: "M4 Max",   ram: "48GB", storage: "1TB",   additionalPrice: 1000.00, stock: NumberInt(8)  }
    ],
    tags: ["apple", "laptop", "macbook", "m4", "professional"],
    averageRating: 4.9,
    reviewCount: NumberInt(198),
    totalSold: NumberInt(640),
    isActive: true,
    isFeatured: true,
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-10")
  },

  // ── PRODUCT 4: Sony WH-1000XM6 ──────────────────────────────────────────
  {
    name: "Sony WH-1000XM6 Wireless Headphones",
    slug: "sony-wh1000xm6",
    description: "Industry-leading noise cancellation with 30-hour battery life and crystal-clear hands-free calling. Premium listening redefined.",
    shortDescription: "Best-in-class ANC. 30hr battery. Hi-Res Audio.",
    brand: "Sony",
    sku: "SNY-WH1000XM6",
    price: 349.99,
    compareAtPrice: 399.99,
    costPrice: 180.00,
    categoryId: catAudio._id,
    sellerId: audioPeak._id,
    images: [
      { url: "/images/products/sonywh6-1.jpg", altText: "Sony WH-1000XM6 black", isPrimary: true },
      { url: "/images/products/sonywh6-2.jpg", altText: "Sony WH-1000XM6 folded", isPrimary: false }
    ],
    specifications: {
      type: "Over-ear, closed-back",
      driver: "40mm dynamic driver",
      frequencyResponse: "4Hz–40,000Hz",
      noiseCancellation: "Industry-leading ANC with Auto NC Optimizer",
      battery: "30 hours (ANC on), 40 hours (ANC off)",
      charging: "USB-C, 3-min quick charge for 3 hours",
      codecs: "LDAC, AAC, SBC",
      weight: "250g"
    },
    variants: [
      { color: "Midnight Black", additionalPrice: 0,     stock: NumberInt(120) },
      { color: "Platinum Silver", additionalPrice: 0,    stock: NumberInt(85) },
      { color: "Midnight Blue",   additionalPrice: 10.00, stock: NumberInt(60) }
    ],
    tags: ["sony", "headphones", "noise-cancelling", "wireless", "premium"],
    averageRating: 4.8,
    reviewCount: NumberInt(534),
    totalSold: NumberInt(3400),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-10-20")
  },

  // ── PRODUCT 5: Classic Slim Fit Chino ────────────────────────────────────
  {
    name: "Men's Classic Slim Fit Chino Pants",
    slug: "mens-classic-slim-chino",
    description: "Timeless chino crafted from stretch cotton twill for all-day comfort and a sharp, tailored look for any occasion.",
    shortDescription: "Stretch twill. Slim fit. All-day comfort.",
    brand: "StyleForward",
    sku: "SF-MCHINO-001",
    price: 59.99,
    compareAtPrice: 79.99,
    costPrice: 18.00,
    categoryId: catMens._id,
    sellerId: styleForward._id,
    images: [
      { url: "/images/products/chino-khaki-1.jpg", altText: "Slim chino khaki front", isPrimary: true }
    ],
    specifications: {
      material: "98% Cotton, 2% Elastane",
      fit: "Slim",
      closure: "Button & zip fly",
      pockets: "4-pocket design",
      careInstructions: "Machine wash cold, tumble dry low",
      origin: "Made in Bangladesh"
    },
    variants: [
      { color: "Khaki",      size: "30x30", additionalPrice: 0, stock: NumberInt(80)  },
      { color: "Khaki",      size: "32x32", additionalPrice: 0, stock: NumberInt(100) },
      { color: "Khaki",      size: "34x34", additionalPrice: 0, stock: NumberInt(90)  },
      { color: "Navy Blue",  size: "30x30", additionalPrice: 0, stock: NumberInt(70)  },
      { color: "Navy Blue",  size: "32x32", additionalPrice: 0, stock: NumberInt(95)  },
      { color: "Olive",      size: "32x32", additionalPrice: 0, stock: NumberInt(60)  },
      { color: "Charcoal",   size: "34x34", additionalPrice: 0, stock: NumberInt(45)  }
    ],
    tags: ["chino", "pants", "menswear", "slim-fit", "casual"],
    averageRating: 4.4,
    reviewCount: NumberInt(287),
    totalSold: NumberInt(4120),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2024-08-15")
  },

  // ── PRODUCT 6: Floral Wrap Maxi Dress ────────────────────────────────────
  {
    name: "Women's Floral Wrap Maxi Dress",
    slug: "womens-floral-wrap-maxi-dress",
    description: "Effortlessly elegant floral print wrap dress with a flowing silhouette, perfect for summer events, beach days, and casual outings.",
    shortDescription: "Floral print. Wrap style. Breathable viscose.",
    brand: "StyleForward",
    sku: "SF-WDRESS-001",
    price: 79.99,
    compareAtPrice: 99.99,
    costPrice: 22.00,
    categoryId: catWomens._id,
    sellerId: styleForward._id,
    images: [
      { url: "/images/products/floralmaxi-1.jpg", altText: "Floral wrap maxi dress model", isPrimary: true }
    ],
    specifications: {
      material: "100% Viscose",
      fit: "Wrap, flowy",
      length: "Maxi (ankle-length)",
      closure: "Self-tie wrap",
      careInstructions: "Hand wash cold, lay flat to dry",
      origin: "Made in India"
    },
    variants: [
      { color: "Blue Floral",  size: "XS", additionalPrice: 0, stock: NumberInt(55) },
      { color: "Blue Floral",  size: "S",  additionalPrice: 0, stock: NumberInt(80) },
      { color: "Blue Floral",  size: "M",  additionalPrice: 0, stock: NumberInt(90) },
      { color: "Blue Floral",  size: "L",  additionalPrice: 0, stock: NumberInt(65) },
      { color: "Pink Floral",  size: "S",  additionalPrice: 0, stock: NumberInt(70) },
      { color: "Pink Floral",  size: "M",  additionalPrice: 0, stock: NumberInt(75) },
      { color: "Green Floral", size: "M",  additionalPrice: 0, stock: NumberInt(50) }
    ],
    tags: ["dress", "maxi", "floral", "summer", "womens"],
    averageRating: 4.6,
    reviewCount: NumberInt(341),
    totalSold: NumberInt(5800),
    isActive: true,
    isFeatured: true,
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2024-09-01")
  },

  // ── PRODUCT 7: KitchenAid Stand Mixer ────────────────────────────────────
  {
    name: "KitchenAid Artisan Series 5-Qt Stand Mixer",
    slug: "kitchenaid-artisan-5qt-stand-mixer",
    description: "The iconic stand mixer with a 5-quart stainless steel bowl, 10 speeds, and compatibility with over 15 optional attachments for endless culinary possibilities.",
    shortDescription: "325W motor. 5-Qt bowl. 10-speed control.",
    brand: "KitchenAid",
    sku: "KA-ARTISAN-5QT",
    price: 379.99,
    compareAtPrice: 449.99,
    costPrice: 210.00,
    categoryId: catKitchen._id,
    sellerId: freshKitchen._id,
    images: [
      { url: "/images/products/kitchenaid-1.jpg", altText: "KitchenAid Artisan stand mixer", isPrimary: true }
    ],
    specifications: {
      motorPower: "325 watts",
      capacity: "5-quart",
      speeds: "10",
      bowlMaterial: "Stainless Steel",
      includes: "Flat beater, dough hook, wire whisk, pouring shield",
      dimensions: "14.1 x 8.7 x 13.9 inches",
      weight: "26 lbs"
    },
    variants: [
      { color: "Empire Red",      additionalPrice: 0,    stock: NumberInt(35) },
      { color: "Onyx Black",      additionalPrice: 0,    stock: NumberInt(42) },
      { color: "Ice Blue",        additionalPrice: 0,    stock: NumberInt(28) },
      { color: "Contour Silver",  additionalPrice: 0,    stock: NumberInt(31) },
      { color: "Pistachio",       additionalPrice: 20.00, stock: NumberInt(15) }
    ],
    tags: ["kitchenaid", "stand-mixer", "baking", "kitchen-appliance", "cooking"],
    averageRating: 4.9,
    reviewCount: NumberInt(812),
    totalSold: NumberInt(2900),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2022-10-01"),
    updatedAt: new Date("2024-07-15")
  },

  // ── PRODUCT 8: Atomic Habits (Book) ──────────────────────────────────────
  {
    name: "Atomic Habits by James Clear",
    slug: "atomic-habits-james-clear",
    description: "A proven framework for improving every day. Learn how tiny changes lead to remarkable results with James Clear's groundbreaking work on habit formation.",
    shortDescription: "#1 New York Times Bestseller. 15M+ copies sold.",
    brand: "Avery Publishing",
    sku: "LIT-ATOMHAB-PB",
    price: 16.99,
    compareAtPrice: 27.00,
    costPrice: 5.50,
    categoryId: catBooks._id,
    sellerId: litCorner._id,
    images: [
      { url: "/images/products/atomichabits-1.jpg", altText: "Atomic Habits book cover", isPrimary: true }
    ],
    specifications: {
      author: "James Clear",
      publisher: "Avery / Penguin Random House",
      pages: "320",
      language: "English",
      isbn: "978-0735211292",
      format: "Paperback",
      publishedDate: "October 16, 2018"
    },
    variants: [
      { format: "Paperback",  additionalPrice: 0,    stock: NumberInt(300) },
      { format: "Hardcover",  additionalPrice: 10.00, stock: NumberInt(150) },
      { format: "Audiobook",  additionalPrice: 5.00,  stock: NumberInt(999) },
      { format: "e-Book",     additionalPrice: -5.00, stock: NumberInt(999) }
    ],
    tags: ["book", "self-help", "habits", "productivity", "bestseller"],
    averageRating: 4.8,
    reviewCount: NumberInt(1420),
    totalSold: NumberInt(8900),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2022-01-01"),
    updatedAt: new Date("2024-11-01")
  },

  // ── PRODUCT 9: Vitamin C Serum ────────────────────────────────────────────
  {
    name: "GlowBeauty Vitamin C Brightening Serum 30ml",
    slug: "glowbeauty-vitamin-c-serum-30ml",
    description: "Potent 20% Vitamin C serum with Hyaluronic Acid and Niacinamide. Reduces dark spots, evens skin tone, and delivers a healthy, radiant glow.",
    shortDescription: "20% Vitamin C. Anti-aging. Cruelty-free.",
    brand: "GlowBeauty",
    sku: "GB-VCS-30ML",
    price: 39.99,
    compareAtPrice: 54.99,
    costPrice: 8.50,
    categoryId: catBeauty._id,
    sellerId: glowBeauty._id,
    images: [
      { url: "/images/products/vitcsermum-1.jpg", altText: "GlowBeauty Vitamin C serum bottle", isPrimary: true }
    ],
    specifications: {
      keyIngredients: ["Vitamin C (L-Ascorbic Acid 20%)", "Hyaluronic Acid", "Niacinamide", "Ferulic Acid"],
      skinType: "All skin types",
      volume: "30ml",
      usage: "Apply 3–5 drops on cleansed face every morning",
      crueltyFree: true,
      vegan: true,
      fragranceFree: true
    },
    variants: [
      { size: "30ml", additionalPrice: 0,     stock: NumberInt(250) },
      { size: "50ml", additionalPrice: 15.00, stock: NumberInt(100) }
    ],
    tags: ["serum", "vitamin-c", "skincare", "brightening", "cruelty-free"],
    averageRating: 4.6,
    reviewCount: NumberInt(678),
    totalSold: NumberInt(12400),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2023-02-14"),
    updatedAt: new Date("2024-10-05")
  },

  // ── PRODUCT 10: LEGO Technic Set ─────────────────────────────────────────
  {
    name: "LEGO Technic Bugatti Bolide 42151",
    slug: "lego-technic-bugatti-bolide-42151",
    description: "Build the iconic Bugatti Bolide race car with this detailed 905-piece LEGO Technic set. Features realistic suspension, working steering, and removable bodywork.",
    shortDescription: "905 pieces. Ages 10+. Authentic Bugatti details.",
    brand: "LEGO",
    sku: "LGO-TECH-42151",
    price: 69.99,
    compareAtPrice: 79.99,
    costPrice: 32.00,
    categoryId: catToys._id,
    sellerId: kidsWorld._id,
    images: [
      { url: "/images/products/legobugatti-1.jpg", altText: "LEGO Technic Bugatti Bolide set", isPrimary: true }
    ],
    specifications: {
      pieces: "905",
      recommendedAge: "10+",
      dimensions: "3 x 14 x 6 inches (assembled)",
      theme: "Technic",
      setNumber: "42151",
      includes: "905 pieces, instruction booklet"
    },
    variants: [
      { packaging: "Standard Box", additionalPrice: 0,    stock: NumberInt(180) },
      { packaging: "Gift Set",     additionalPrice: 5.00, stock: NumberInt(40) }
    ],
    tags: ["lego", "technic", "bugatti", "building-sets", "kids"],
    averageRating: 4.7,
    reviewCount: NumberInt(203),
    totalSold: NumberInt(2800),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2023-08-01"),
    updatedAt: new Date("2024-09-15")
  },

  // ── PRODUCT 11: PlayStation 5 ─────────────────────────────────────────────
  {
    name: "Sony PlayStation 5 Console",
    slug: "sony-playstation-5",
    description: "Experience lightning-fast loading with custom SSD, deeper immersion with haptic feedback via DualSense controller, and breathtaking 4K gaming at 120fps.",
    shortDescription: "4K 120fps. Custom SSD. DualSense haptic feedback.",
    brand: "Sony",
    sku: "SNY-PS5-DISC",
    price: 499.99,
    compareAtPrice: 499.99,
    costPrice: 380.00,
    categoryId: catGaming._id,
    sellerId: gamerZone._id,
    images: [
      { url: "/images/products/ps5-1.jpg", altText: "PlayStation 5 console", isPrimary: true }
    ],
    specifications: {
      cpu: "AMD Zen 2 (8-core, 3.5GHz)",
      gpu: "AMD RDNA 2, 10.28 TFLOPS",
      ram: "16GB GDDR6",
      storage: "825GB Custom SSD",
      resolution: "Up to 8K output",
      frameRate: "Up to 120fps",
      opticalDrive: "Ultra HD Blu-ray"
    },
    variants: [
      { edition: "Standard (Disc)", additionalPrice: 0,      stock: NumberInt(50) },
      { edition: "Digital Edition", additionalPrice: -100.00, stock: NumberInt(40) },
      { edition: "Spider-Man 2 Bundle", additionalPrice: 60.00, stock: NumberInt(20) }
    ],
    tags: ["playstation", "ps5", "gaming", "console", "sony"],
    averageRating: 4.9,
    reviewCount: NumberInt(892),
    totalSold: NumberInt(3100),
    isActive: true,
    isFeatured: true,
    createdAt: new Date("2022-11-01"),
    updatedAt: new Date("2024-10-30")
  },

  // ── PRODUCT 12: Yoga Mat ──────────────────────────────────────────────────
  {
    name: "Manduka PRO Yoga Mat 6mm",
    slug: "manduka-pro-yoga-mat-6mm",
    description: "The gold standard yoga mat. Dense 6mm cushioning, lifetime guarantee, and eco-certified materials make this the mat serious yogis trust worldwide.",
    shortDescription: "6mm cushioning. Lifetime guarantee. Eco-certified.",
    brand: "Manduka",
    sku: "MAN-PRO-6MM",
    price: 120.00,
    compareAtPrice: 140.00,
    costPrice: 48.00,
    categoryId: catFitness._id,
    sellerId: brooksGear._id,
    images: [
      { url: "/images/products/manduka-1.jpg", altText: "Manduka PRO yoga mat", isPrimary: true }
    ],
    specifications: {
      thickness: "6mm",
      dimensions: "71 x 24 inches",
      weight: "7.5 lbs",
      material: "PVC, OEKO-TEX certified",
      surface: "Non-slip, ultra-dense",
      warranty: "Lifetime guarantee"
    },
    variants: [
      { color: "Black",      length: "Standard (71\")", additionalPrice: 0,    stock: NumberInt(95) },
      { color: "Deep Sea",   length: "Standard (71\")", additionalPrice: 0,    stock: NumberInt(70) },
      { color: "Amethyst",   length: "Standard (71\")", additionalPrice: 0,    stock: NumberInt(55) },
      { color: "Black",      length: "Long (85\")",     additionalPrice: 20.00, stock: NumberInt(30) }
    ],
    tags: ["yoga", "mat", "fitness", "manduka", "eco-friendly"],
    averageRating: 4.7,
    reviewCount: NumberInt(456),
    totalSold: NumberInt(3600),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2022-06-01"),
    updatedAt: new Date("2024-07-20")
  },

  // ── PRODUCT 13: Air Purifier ──────────────────────────────────────────────
  {
    name: "Dyson Purifier Cool TP07 Air Purifier & Fan",
    slug: "dyson-purifier-cool-tp07",
    description: "Purifies and cools with HEPA H13 filtration, removing 99.97% of allergens, pollutants, and gases. Smart home compatible with real-time air quality monitoring.",
    shortDescription: "HEPA H13. Auto mode. Wi-Fi & Alexa compatible.",
    brand: "Dyson",
    sku: "DYS-TP07-001",
    price: 549.99,
    compareAtPrice: 649.99,
    costPrice: 310.00,
    categoryId: catKitchen._id,
    sellerId: homeHaven._id,
    images: [
      { url: "/images/products/dysontp07-1.jpg", altText: "Dyson TP07 purifier", isPrimary: true }
    ],
    specifications: {
      filtration: "HEPA H13 + Activated Carbon",
      coverage: "Up to 800 sq ft",
      airFlowRate: "290L/s",
      noise: "As quiet as 43dB",
      connectivity: "Wi-Fi, Bluetooth, Alexa, Google Assistant",
      dimensions: "6.3 x 6.3 x 41 inches",
      weight: "8.6 lbs"
    },
    variants: [
      { color: "White/Silver",  additionalPrice: 0,    stock: NumberInt(35) },
      { color: "Iron/Blue",     additionalPrice: 0,    stock: NumberInt(28) },
      { color: "Prussian Blue", additionalPrice: 20.00, stock: NumberInt(18) }
    ],
    tags: ["dyson", "air-purifier", "hepa", "smart-home", "fan"],
    averageRating: 4.5,
    reviewCount: NumberInt(334),
    totalSold: NumberInt(870),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2023-06-10"),
    updatedAt: new Date("2024-10-01")
  },

  // ── PRODUCT 14: Bose QuietComfort Earbuds ────────────────────────────────
  {
    name: "Bose QuietComfort Ultra Earbuds",
    slug: "bose-quietcomfort-ultra-earbuds",
    description: "World-class noise cancellation meets Bose Immersive Audio. Personalized fit, IPX4 water resistance, and 6-hour battery per charge.",
    shortDescription: "Immersive Audio. World-class ANC. IPX4 rated.",
    brand: "Bose",
    sku: "BOSE-QCUE-001",
    price: 279.00,
    compareAtPrice: 299.00,
    costPrice: 140.00,
    categoryId: catAudio._id,
    sellerId: audioPeak._id,
    images: [
      { url: "/images/products/boseqc-earbuds-1.jpg", altText: "Bose QuietComfort Ultra Earbuds", isPrimary: true }
    ],
    specifications: {
      type: "In-ear, true wireless",
      noiseCancellation: "World-class ANC + Aware mode",
      battery: "6hr (earbuds) + 18hr (case), 20min quick charge for 2hr",
      connectivity: "Bluetooth 5.3",
      waterResistance: "IPX4",
      voiceAssistant: "Alexa, Google Assistant, Siri",
      codecs: "aptX Adaptive, AAC, SBC"
    },
    variants: [
      { color: "Black",            additionalPrice: 0,    stock: NumberInt(90) },
      { color: "White Smoke",      additionalPrice: 0,    stock: NumberInt(75) },
      { color: "Sandstone",        additionalPrice: 0,    stock: NumberInt(60) }
    ],
    tags: ["bose", "earbuds", "noise-cancelling", "wireless", "premium"],
    averageRating: 4.7,
    reviewCount: NumberInt(289),
    totalSold: NumberInt(2600),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2023-09-20"),
    updatedAt: new Date("2024-10-15")
  },

  // ── PRODUCT 15: Running Shoes ─────────────────────────────────────────────
  {
    name: "Nike Pegasus 41 Running Shoes",
    slug: "nike-pegasus-41",
    description: "The dependable workhorse built for everyday runners. React foam midsole delivers responsive cushioning and Energy Return technology for a smooth, powerful ride.",
    shortDescription: "React foam. Breathable mesh. Everyday trainer.",
    brand: "Nike",
    sku: "NKE-PEG41-001",
    price: 130.00,
    compareAtPrice: 140.00,
    costPrice: 52.00,
    categoryId: catSports._id,
    sellerId: runFast._id,
    images: [
      { url: "/images/products/pegasus41-1.jpg", altText: "Nike Pegasus 41 running shoes", isPrimary: true }
    ],
    specifications: {
      type: "Road running",
      midsole: "Nike React foam with Air Zoom unit",
      upper: "Engineered mesh",
      outsole: "Rubber with waffle pattern",
      drop: "10mm",
      weight: "10 oz (men's US 10)"
    },
    variants: [
      { gender: "Men's",   size: "9",  color: "Black/White",   additionalPrice: 0, stock: NumberInt(40) },
      { gender: "Men's",   size: "10", color: "Black/White",   additionalPrice: 0, stock: NumberInt(55) },
      { gender: "Men's",   size: "11", color: "Black/White",   additionalPrice: 0, stock: NumberInt(50) },
      { gender: "Men's",   size: "10", color: "Blue/Orange",   additionalPrice: 0, stock: NumberInt(35) },
      { gender: "Women's", size: "7",  color: "Pink/White",    additionalPrice: 0, stock: NumberInt(45) },
      { gender: "Women's", size: "8",  color: "Pink/White",    additionalPrice: 0, stock: NumberInt(60) },
      { gender: "Women's", size: "9",  color: "Volt/Black",    additionalPrice: 0, stock: NumberInt(38) }
    ],
    tags: ["nike", "running", "shoes", "pegasus", "sports"],
    averageRating: 4.5,
    reviewCount: NumberInt(512),
    totalSold: NumberInt(5100),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-09-10")
  },

  // ── PRODUCT 16: Portable SSD ──────────────────────────────────────────────
  {
    name: "Samsung T9 Portable SSD 2TB",
    slug: "samsung-t9-portable-ssd-2tb",
    description: "Blazing USB 3.2 Gen 2x2 speeds up to 2,000 MB/s. Compact, shock-resistant design with Password Protection for ultimate data security on the go.",
    shortDescription: "2,000 MB/s. Shock-resistant. USB 3.2.",
    brand: "Samsung",
    sku: "SAM-T9-2TB",
    price: 179.99,
    compareAtPrice: 229.99,
    costPrice: 90.00,
    categoryId: catLaptops._id,
    sellerId: voltTech._id,
    images: [
      { url: "/images/products/samsung-t9-1.jpg", altText: "Samsung T9 portable SSD", isPrimary: true }
    ],
    specifications: {
      capacity: "2TB",
      interface: "USB 3.2 Gen 2x2 (Type-C)",
      readSpeed: "Up to 2,000 MB/s",
      writeSpeed: "Up to 1,950 MB/s",
      encryption: "256-bit AES",
      dimensions: "88.9 x 60.1 x 13mm",
      weight: "98g"
    },
    variants: [
      { color: "Beige",     capacity: "1TB",  additionalPrice: -40.00, stock: NumberInt(80) },
      { color: "Beige",     capacity: "2TB",  additionalPrice: 0,      stock: NumberInt(65) },
      { color: "Black",     capacity: "1TB",  additionalPrice: -40.00, stock: NumberInt(70) },
      { color: "Black",     capacity: "2TB",  additionalPrice: 0,      stock: NumberInt(55) },
      { color: "Black",     capacity: "4TB",  additionalPrice: 130.00, stock: NumberInt(25) }
    ],
    tags: ["samsung", "ssd", "storage", "portable", "backup"],
    averageRating: 4.7,
    reviewCount: NumberInt(378),
    totalSold: NumberInt(4200),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2023-07-01"),
    updatedAt: new Date("2024-10-20")
  },

  // ── PRODUCT 17: Bamboo Cutting Board Set ─────────────────────────────────
  {
    name: "Eco Bamboo Cutting Board Set (3-Piece)",
    slug: "eco-bamboo-cutting-board-set",
    description: "Sustainably sourced bamboo cutting boards in three sizes. Naturally antibacterial, knife-friendly, and easy to clean. The eco-conscious kitchen essential.",
    shortDescription: "3 sizes. Antibacterial. Sustainably sourced.",
    brand: "EcoNest",
    sku: "ECO-CBSET-3PC",
    price: 34.99,
    compareAtPrice: 44.99,
    costPrice: 9.00,
    categoryId: catKitchen._id,
    sellerId: ecoNest._id,
    images: [
      { url: "/images/products/bambooboard-1.jpg", altText: "Eco bamboo cutting board set", isPrimary: true }
    ],
    specifications: {
      material: "100% organic bamboo",
      sizes: ["Small: 9x6\", Medium: 12x8\", Large: 15x10\""],
      features: "Groove channels, anti-slip feet, hanging holes",
      careInstructions: "Hand wash, oil periodically",
      certifications: ["FSC Certified", "BPA-free"]
    },
    variants: [
      { style: "3-Piece Set",       additionalPrice: 0,     stock: NumberInt(200) },
      { style: "5-Piece Gift Set",  additionalPrice: 15.00, stock: NumberInt(80) }
    ],
    tags: ["cutting-board", "bamboo", "eco-friendly", "kitchen", "sustainable"],
    averageRating: 4.6,
    reviewCount: NumberInt(567),
    totalSold: NumberInt(7800),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2022-08-01"),
    updatedAt: new Date("2024-09-01")
  },

  // ── PRODUCT 18: Google Pixel 9 Pro ───────────────────────────────────────
  {
    name: "Google Pixel 9 Pro",
    slug: "google-pixel-9-pro",
    description: "The ultimate Google phone with Tensor G4 chip, a triple camera system co-engineered with Google AI, and seven years of OS and security updates.",
    shortDescription: "Tensor G4. Triple camera. 7 years of updates.",
    brand: "Google",
    sku: "GOO-PX9P-001",
    price: 999.00,
    compareAtPrice: 1099.00,
    costPrice: 600.00,
    categoryId: catSmartphones._id,
    sellerId: voltTech._id,
    images: [
      { url: "/images/products/pixel9pro-1.jpg", altText: "Google Pixel 9 Pro obsidian", isPrimary: true }
    ],
    specifications: {
      display: "6.3-inch LTPO OLED, 1–120Hz",
      processor: "Google Tensor G4",
      ram: "16GB",
      battery: "4700 mAh, 27W wired + 15W wireless",
      camera: "50MP main + 48MP ultrawide + 48MP 5x telephoto",
      os: "Android 14",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, USB-C 3.2"
    },
    variants: [
      { color: "Obsidian",     storage: "128GB", additionalPrice: 0,      stock: NumberInt(55) },
      { color: "Porcelain",    storage: "128GB", additionalPrice: 0,      stock: NumberInt(48) },
      { color: "Hazel",        storage: "256GB", additionalPrice: 100.00, stock: NumberInt(30) },
      { color: "Rose Quartz",  storage: "256GB", additionalPrice: 100.00, stock: NumberInt(22) },
      { color: "Obsidian",     storage: "512GB", additionalPrice: 250.00, stock: NumberInt(12) }
    ],
    tags: ["google", "pixel", "smartphone", "ai", "android"],
    averageRating: 4.7,
    reviewCount: NumberInt(256),
    totalSold: NumberInt(1450),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2024-08-13"),
    updatedAt: new Date("2024-11-01")
  },

  // ── PRODUCT 19: Resistance Band Set ──────────────────────────────────────
  {
    name: "Fit Simplify Resistance Band Set (5-Pack)",
    slug: "fit-simplify-resistance-band-set",
    description: "Premium latex resistance bands in five resistance levels. Perfect for physical therapy, stretching, yoga, Pilates, and strength training at home or gym.",
    shortDescription: "5 resistance levels. Latex-free option. Includes bag.",
    brand: "Fit Simplify",
    sku: "FTS-RBAND-5PK",
    price: 19.99,
    compareAtPrice: 29.99,
    costPrice: 4.50,
    categoryId: catFitness._id,
    sellerId: brooksGear._id,
    images: [
      { url: "/images/products/resistanceband-1.jpg", altText: "Resistance band 5-pack", isPrimary: true }
    ],
    specifications: {
      resistanceLevels: ["X-Light", "Light", "Medium", "Heavy", "X-Heavy"],
      material: "100% natural latex",
      length: "12 inches",
      includes: "5 bands, carry bag, exercise guide",
      warranty: "1-year"
    },
    variants: [
      { type: "Latex",      additionalPrice: 0,   stock: NumberInt(400) },
      { type: "Latex-Free", additionalPrice: 3.00, stock: NumberInt(180) }
    ],
    tags: ["resistance-band", "fitness", "workout", "yoga", "home-gym"],
    averageRating: 4.5,
    reviewCount: NumberInt(1890),
    totalSold: NumberInt(25000),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2022-02-01"),
    updatedAt: new Date("2024-08-01")
  },

  // ── PRODUCT 20: Luxury Scented Candle ────────────────────────────────────
  {
    name: "Nest New York Black Tulip Candle 8.1oz",
    slug: "nest-ny-black-tulip-candle",
    description: "An intoxicating blend of black tulip, jasmine, and patchouli. Hand-poured soy wax with a 50–60 hour burn time. The epitome of luxury home fragrance.",
    shortDescription: "Soy wax. 50–60hr burn. Premium fragrance.",
    brand: "Nest New York",
    sku: "NEST-BTCANDLE-8",
    price: 48.00,
    compareAtPrice: 52.00,
    costPrice: 12.00,
    categoryId: catBeauty._id,
    sellerId: homeHaven._id,
    images: [
      { url: "/images/products/nestcandle-1.jpg", altText: "Nest Black Tulip candle", isPrimary: true }
    ],
    specifications: {
      waxType: "Soy wax blend",
      weight: "8.1oz",
      burnTime: "50–60 hours",
      scentNotes: { top: "Black Tulip", middle: "Jasmine Petals", base: "Patchouli, Sandalwood" },
      wickType: "Cotton",
      dimensions: "3.5 x 3.5 x 3 inches"
    },
    variants: [
      { size: "3oz Travel",  additionalPrice: -26.00, stock: NumberInt(150) },
      { size: "8.1oz",       additionalPrice: 0,      stock: NumberInt(200) },
      { size: "21.2oz Lg",   additionalPrice: 52.00,  stock: NumberInt(75) }
    ],
    tags: ["candle", "luxury", "home-fragrance", "soy-wax", "nest"],
    averageRating: 4.8,
    reviewCount: NumberInt(423),
    totalSold: NumberInt(6200),
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2022-12-01"),
    updatedAt: new Date("2024-10-01")
  }
]);

print("  ✓ Inserted 20 products.\n");

// ─────────────────────────────────────────────────────────────────────────────
// 3.5  COUPONS  (15 documents)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting coupons...");

db.coupons.insertMany([
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    description: "10% off for new customers",
    minOrderAmount: 20.00,
    maxDiscountAmount: 50.00,
    maxUses: NumberInt(10000),
    usedCount: NumberInt(4321),
    isActive: true,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: true,
    expiresAt: new Date("2025-12-31"),
    createdAt: new Date("2023-01-01")
  },
  {
    code: "SAVE20",
    type: "percentage",
    value: 20,
    description: "Flash sale — 20% off",
    minOrderAmount: 100.00,
    maxDiscountAmount: 80.00,
    maxUses: NumberInt(500),
    usedCount: NumberInt(498),
    isActive: false,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2024-09-30"),
    createdAt: new Date("2024-09-01")
  },
  {
    code: "TECH50",
    type: "fixed",
    value: 50,
    description: "$50 off electronics orders over $500",
    minOrderAmount: 500.00,
    maxDiscountAmount: 50.00,
    maxUses: NumberInt(1000),
    usedCount: NumberInt(212),
    isActive: true,
    applicableCategories: ["electronics", "smartphones", "laptops-computers"],
    excludedProducts: [],
    onePerUser: true,
    expiresAt: new Date("2025-06-30"),
    createdAt: new Date("2024-01-15")
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    description: "Free shipping on any order",
    minOrderAmount: 0.00,
    maxDiscountAmount: 25.00,
    maxUses: NumberInt(2000),
    usedCount: NumberInt(1876),
    isActive: true,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2025-03-31"),
    createdAt: new Date("2024-06-01")
  },
  {
    code: "SUMMER15",
    type: "percentage",
    value: 15,
    description: "Summer sale — 15% off clothing",
    minOrderAmount: 50.00,
    maxDiscountAmount: 40.00,
    maxUses: NumberInt(3000),
    usedCount: NumberInt(2899),
    isActive: false,
    applicableCategories: ["clothing-fashion", "mens-clothing", "womens-clothing"],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2024-08-31"),
    createdAt: new Date("2024-06-15")
  },
  {
    code: "VIP25",
    type: "percentage",
    value: 25,
    description: "Exclusive 25% off for VIP loyalty members",
    minOrderAmount: 150.00,
    maxDiscountAmount: 100.00,
    maxUses: NumberInt(200),
    usedCount: NumberInt(87),
    isActive: true,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: true,
    expiresAt: new Date("2025-12-31"),
    createdAt: new Date("2024-01-01")
  },
  {
    code: "BOOKS5",
    type: "fixed",
    value: 5,
    description: "$5 off any book order",
    minOrderAmount: 15.00,
    maxDiscountAmount: 5.00,
    maxUses: NumberInt(5000),
    usedCount: NumberInt(3120),
    isActive: true,
    applicableCategories: ["books-media"],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2025-12-31"),
    createdAt: new Date("2023-06-01")
  },
  {
    code: "BEAUTY20",
    type: "percentage",
    value: 20,
    description: "20% off beauty and personal care",
    minOrderAmount: 30.00,
    maxDiscountAmount: 30.00,
    maxUses: NumberInt(1500),
    usedCount: NumberInt(944),
    isActive: true,
    applicableCategories: ["beauty-personal-care"],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2025-06-30"),
    createdAt: new Date("2024-02-14")
  },
  {
    code: "HOLIDAY30",
    type: "percentage",
    value: 30,
    description: "Holiday special — 30% off storewide",
    minOrderAmount: 200.00,
    maxDiscountAmount: 120.00,
    maxUses: NumberInt(300),
    usedCount: NumberInt(0),
    isActive: true,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: true,
    expiresAt: new Date("2024-12-31"),
    createdAt: new Date("2024-11-15")
  },
  {
    code: "GAME100",
    type: "fixed",
    value: 100,
    description: "$100 off gaming consoles over $400",
    minOrderAmount: 400.00,
    maxDiscountAmount: 100.00,
    maxUses: NumberInt(150),
    usedCount: NumberInt(74),
    isActive: true,
    applicableCategories: ["gaming"],
    excludedProducts: [],
    onePerUser: true,
    expiresAt: new Date("2025-01-31"),
    createdAt: new Date("2024-10-01")
  },
  {
    code: "FIRSTORDER",
    type: "fixed",
    value: 15,
    description: "$15 off your first order",
    minOrderAmount: 50.00,
    maxDiscountAmount: 15.00,
    maxUses: NumberInt(100000),
    usedCount: NumberInt(28450),
    isActive: true,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: true,
    expiresAt: new Date("2026-12-31"),
    createdAt: new Date("2021-01-01")
  },
  {
    code: "LOYALTY5",
    type: "percentage",
    value: 5,
    description: "5% off for loyalty point holders (500+ pts)",
    minOrderAmount: 0.00,
    maxDiscountAmount: 20.00,
    maxUses: NumberInt(50000),
    usedCount: NumberInt(7231),
    isActive: true,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2026-12-31"),
    createdAt: new Date("2022-01-01")
  },
  {
    code: "FLASH40",
    type: "percentage",
    value: 40,
    description: "48-hour flash sale — 40% off selected items",
    minOrderAmount: 80.00,
    maxDiscountAmount: 60.00,
    maxUses: NumberInt(250),
    usedCount: NumberInt(250),
    isActive: false,
    applicableCategories: [],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2024-10-05"),
    createdAt: new Date("2024-10-03")
  },
  {
    code: "HOME10",
    type: "percentage",
    value: 10,
    description: "10% off home & living items",
    minOrderAmount: 40.00,
    maxDiscountAmount: 35.00,
    maxUses: NumberInt(2000),
    usedCount: NumberInt(556),
    isActive: true,
    applicableCategories: ["home-living", "kitchen-dining"],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2025-09-30"),
    createdAt: new Date("2024-04-01")
  },
  {
    code: "SPORT15",
    type: "percentage",
    value: 15,
    description: "15% off sports and fitness gear",
    minOrderAmount: 60.00,
    maxDiscountAmount: 45.00,
    maxUses: NumberInt(800),
    usedCount: NumberInt(311),
    isActive: true,
    applicableCategories: ["sports-outdoors", "fitness-equipment"],
    excludedProducts: [],
    onePerUser: false,
    expiresAt: new Date("2025-06-30"),
    createdAt: new Date("2024-01-01")
  }
]);

print("  ✓ Inserted 15 coupons.\n");

// ─────────────────────────────────────────────────────────────────────────────
// 3.6  ORDERS  (18 documents — embedded items, nested shipping address)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting orders...");

const u1  = db.users.findOne({ email: "alice.johnson@email.com" });
const u2  = db.users.findOne({ email: "bob.martinez@email.com" });
const u3  = db.users.findOne({ email: "clara.chen@email.com" });
const u4  = db.users.findOne({ email: "david.kim@email.com" });
const u5  = db.users.findOne({ email: "frank.nguyen@email.com" });
const u6  = db.users.findOne({ email: "irene.rossi@email.com" });
const u7  = db.users.findOne({ email: "jake.thompson@email.com" });
const u8  = db.users.findOne({ email: "mia.santos@email.com" });
const u9  = db.users.findOne({ email: "olivia.wang@email.com" });
const u10 = db.users.findOne({ email: "sam.hernandez@email.com" });
const u11 = db.users.findOne({ email: "paul.evans@email.com" });
const u12 = db.users.findOne({ email: "karen.lee@email.com" });

const p1  = db.products.findOne({ slug: "apple-iphone-16-pro" });
const p2  = db.products.findOne({ slug: "samsung-galaxy-s24-ultra" });
const p3  = db.products.findOne({ slug: "apple-macbook-pro-14-m4" });
const p4  = db.products.findOne({ slug: "sony-wh1000xm6" });
const p5  = db.products.findOne({ slug: "mens-classic-slim-chino" });
const p6  = db.products.findOne({ slug: "womens-floral-wrap-maxi-dress" });
const p7  = db.products.findOne({ slug: "kitchenaid-artisan-5qt-stand-mixer" });
const p8  = db.products.findOne({ slug: "atomic-habits-james-clear" });
const p9  = db.products.findOne({ slug: "glowbeauty-vitamin-c-serum-30ml" });
const p10 = db.products.findOne({ slug: "sony-playstation-5" });
const p11 = db.products.findOne({ slug: "manduka-pro-yoga-mat-6mm" });
const p12 = db.products.findOne({ slug: "bose-quietcomfort-ultra-earbuds" });
const p13 = db.products.findOne({ slug: "nike-pegasus-41" });
const p14 = db.products.findOne({ slug: "samsung-t9-portable-ssd-2tb" });
const p15 = db.products.findOne({ slug: "eco-bamboo-cutting-board-set" });
const p16 = db.products.findOne({ slug: "dyson-purifier-cool-tp07" });
const p17 = db.products.findOne({ slug: "google-pixel-9-pro" });
const p18 = db.products.findOne({ slug: "fit-simplify-resistance-band-set" });
const p19 = db.products.findOne({ slug: "nest-ny-black-tulip-candle" });
const p20 = db.products.findOne({ slug: "lego-technic-bugatti-bolide-42151" });

db.orders.insertMany([
  // ── ORDER 1 ──────────────────────────────────────────────────────────────
  {
    userId: u1._id,
    orderNumber: "ORD-2024-000001",
    items: [
      { productId: p1._id, productName: p1.name, sku: "APL-IP16P-001", quantity: NumberInt(1), unitPrice: 999.00, totalPrice: 999.00, variant: "Black Titanium / 256GB" },
      { productId: p4._id, productName: p4.name, sku: "SNY-WH1000XM6", quantity: NumberInt(1), unitPrice: 349.99, totalPrice: 349.99, variant: "Midnight Black" }
    ],
    shippingAddress: { street: "14 Maple Avenue", city: "New York", state: "NY", country: "USA", zipCode: "10001" },
    billingAddress:  { street: "14 Maple Avenue", city: "New York", state: "NY", country: "USA", zipCode: "10001" },
    subtotal: 1348.99,
    shippingCost: 0.00,
    taxAmount: 107.92,
    discountAmount: 134.90,
    couponCode: "SAVE20",
    totalAmount: 1322.01,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "standard",
    trackingNumber: "TRK1234567890",
    estimatedDelivery: new Date("2024-10-10"),
    deliveredAt: new Date("2024-10-09"),
    notes: "",
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-09")
  },

  // ── ORDER 2 ──────────────────────────────────────────────────────────────
  {
    userId: u2._id,
    orderNumber: "ORD-2024-000002",
    items: [
      { productId: p3._id, productName: p3.name, sku: "APL-MBP14-M4", quantity: NumberInt(1), unitPrice: 1599.00, totalPrice: 1599.00, variant: "M4 Pro / 24GB / 512GB" },
      { productId: p14._id, productName: p14.name, sku: "SAM-T9-2TB", quantity: NumberInt(2), unitPrice: 179.99, totalPrice: 359.98, variant: "Black / 2TB" }
    ],
    shippingAddress: { street: "7 Sunset Blvd", city: "Los Angeles", state: "CA", country: "USA", zipCode: "90001" },
    billingAddress:  { street: "7 Sunset Blvd", city: "Los Angeles", state: "CA", country: "USA", zipCode: "90001" },
    subtotal: 1958.98,
    shippingCost: 0.00,
    taxAmount: 156.72,
    discountAmount: 50.00,
    couponCode: "TECH50",
    totalAmount: 2065.70,
    paymentMethod: "paypal",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "express",
    trackingNumber: "TRK2345678901",
    estimatedDelivery: new Date("2024-10-20"),
    deliveredAt: new Date("2024-10-19"),
    notes: "Please leave at front door.",
    createdAt: new Date("2024-10-12"),
    updatedAt: new Date("2024-10-19")
  },

  // ── ORDER 3 ──────────────────────────────────────────────────────────────
  {
    userId: u3._id,
    orderNumber: "ORD-2024-000003",
    items: [
      { productId: p6._id, productName: p6.name, sku: "SF-WDRESS-001", quantity: NumberInt(2), unitPrice: 79.99, totalPrice: 159.98, variant: "Blue Floral / M" },
      { productId: p9._id, productName: p9.name, sku: "GB-VCS-30ML",   quantity: NumberInt(3), unitPrice: 39.99, totalPrice: 119.97, variant: "30ml" },
      { productId: p19._id, productName: p19.name, sku: "NEST-BTCANDLE-8", quantity: NumberInt(1), unitPrice: 48.00, totalPrice: 48.00, variant: "8.1oz" }
    ],
    shippingAddress: { street: "88 Orchid Street", city: "San Francisco", state: "CA", country: "USA", zipCode: "94102" },
    billingAddress:  { street: "88 Orchid Street", city: "San Francisco", state: "CA", country: "USA", zipCode: "94102" },
    subtotal: 327.95,
    shippingCost: 0.00,
    taxAmount: 26.24,
    discountAmount: 65.59,
    couponCode: "VIP25",
    totalAmount: 288.60,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "standard",
    trackingNumber: "TRK3456789012",
    estimatedDelivery: new Date("2024-09-25"),
    deliveredAt: new Date("2024-09-23"),
    notes: "",
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2024-09-23")
  },

  // ── ORDER 4 ──────────────────────────────────────────────────────────────
  {
    userId: u4._id,
    orderNumber: "ORD-2024-000004",
    items: [
      { productId: p10._id, productName: p10.name, sku: "SNY-PS5-DISC", quantity: NumberInt(1), unitPrice: 499.99, totalPrice: 499.99, variant: "Standard (Disc)" }
    ],
    shippingAddress: { street: "23 Elm Road", city: "Chicago", state: "IL", country: "USA", zipCode: "60601" },
    billingAddress:  { street: "23 Elm Road", city: "Chicago", state: "IL", country: "USA", zipCode: "60601" },
    subtotal: 499.99,
    shippingCost: 9.99,
    taxAmount: 40.00,
    discountAmount: 100.00,
    couponCode: "GAME100",
    totalAmount: 449.98,
    paymentMethod: "debit_card",
    paymentStatus: "paid",
    status: "shipped",
    shippingMethod: "standard",
    trackingNumber: "TRK4567890123",
    estimatedDelivery: new Date("2024-11-28"),
    deliveredAt: null,
    notes: "Gift — do not include invoice.",
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2024-11-21")
  },

  // ── ORDER 5 ──────────────────────────────────────────────────────────────
  {
    userId: u5._id,
    orderNumber: "ORD-2024-000005",
    items: [
      { productId: p7._id, productName: p7.name, sku: "KA-ARTISAN-5QT", quantity: NumberInt(1), unitPrice: 379.99, totalPrice: 379.99, variant: "Empire Red" },
      { productId: p15._id, productName: p15.name, sku: "ECO-CBSET-3PC",  quantity: NumberInt(2), unitPrice: 34.99, totalPrice: 69.98, variant: "3-Piece Set" }
    ],
    shippingAddress: { street: "101 Pine Street", city: "Seattle", state: "WA", country: "USA", zipCode: "98101" },
    billingAddress:  { street: "101 Pine Street", city: "Seattle", state: "WA", country: "USA", zipCode: "98101" },
    subtotal: 449.97,
    shippingCost: 0.00,
    taxAmount: 36.00,
    discountAmount: 45.00,
    couponCode: "HOME10",
    totalAmount: 440.97,
    paymentMethod: "paypal",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "standard",
    trackingNumber: "TRK5678901234",
    estimatedDelivery: new Date("2024-08-15"),
    deliveredAt: new Date("2024-08-13"),
    notes: "",
    createdAt: new Date("2024-08-05"),
    updatedAt: new Date("2024-08-13")
  },

  // ── ORDER 6 ──────────────────────────────────────────────────────────────
  {
    userId: u6._id,
    orderNumber: "ORD-2024-000006",
    items: [
      { productId: p8._id, productName: p8.name, sku: "LIT-ATOMHAB-PB", quantity: NumberInt(1), unitPrice: 16.99, totalPrice: 16.99, variant: "Paperback" },
      { productId: p18._id, productName: p18.name, sku: "FTS-RBAND-5PK", quantity: NumberInt(1), unitPrice: 19.99, totalPrice: 19.99, variant: "Latex" }
    ],
    shippingAddress: { street: "Via Roma 12", city: "Milan", state: "Lombardia", country: "Italy", zipCode: "20100" },
    billingAddress:  { street: "Via Roma 12", city: "Milan", state: "Lombardia", country: "Italy", zipCode: "20100" },
    subtotal: 36.98,
    shippingCost: 12.99,
    taxAmount: 2.96,
    discountAmount: 5.00,
    couponCode: "BOOKS5",
    totalAmount: 47.93,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "international_standard",
    trackingNumber: "TRK6789012345",
    estimatedDelivery: new Date("2024-10-22"),
    deliveredAt: new Date("2024-10-20"),
    notes: "International shipment to Italy.",
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2024-10-20")
  },

  // ── ORDER 7 ──────────────────────────────────────────────────────────────
  {
    userId: u7._id,
    orderNumber: "ORD-2024-000007",
    items: [
      { productId: p2._id, productName: p2.name, sku: "SAM-GS24U-001", quantity: NumberInt(1), unitPrice: 1199.99, totalPrice: 1199.99, variant: "Titanium Black / 256GB" },
      { productId: p12._id, productName: p12.name, sku: "BOSE-QCUE-001", quantity: NumberInt(1), unitPrice: 279.00, totalPrice: 279.00, variant: "Black" }
    ],
    shippingAddress: { street: "200 Oak Boulevard", city: "Boston", state: "MA", country: "USA", zipCode: "02101" },
    billingAddress:  { street: "200 Oak Boulevard", city: "Boston", state: "MA", country: "USA", zipCode: "02101" },
    subtotal: 1478.99,
    shippingCost: 0.00,
    taxAmount: 118.32,
    discountAmount: 0.00,
    couponCode: null,
    totalAmount: 1597.31,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "express",
    trackingNumber: "TRK7890123456",
    estimatedDelivery: new Date("2024-07-18"),
    deliveredAt: new Date("2024-07-17"),
    notes: "",
    createdAt: new Date("2024-07-10"),
    updatedAt: new Date("2024-07-17")
  },

  // ── ORDER 8 ──────────────────────────────────────────────────────────────
  {
    userId: u8._id,
    orderNumber: "ORD-2024-000008",
    items: [
      { productId: p9._id, productName: p9.name, sku: "GB-VCS-30ML",   quantity: NumberInt(2), unitPrice: 39.99, totalPrice: 79.98, variant: "30ml" },
      { productId: p19._id, productName: p19.name, sku: "NEST-BTCANDLE-8", quantity: NumberInt(2), unitPrice: 48.00, totalPrice: 96.00, variant: "8.1oz" }
    ],
    shippingAddress: { street: "330 Hibiscus Road", city: "Miami", state: "FL", country: "USA", zipCode: "33101" },
    billingAddress:  { street: "330 Hibiscus Road", city: "Miami", state: "FL", country: "USA", zipCode: "33101" },
    subtotal: 175.98,
    shippingCost: 0.00,
    taxAmount: 14.08,
    discountAmount: 35.20,
    couponCode: "BEAUTY20",
    totalAmount: 154.86,
    paymentMethod: "paypal",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "standard",
    trackingNumber: "TRK8901234567",
    estimatedDelivery: new Date("2024-11-12"),
    deliveredAt: new Date("2024-11-11"),
    notes: "",
    createdAt: new Date("2024-11-02"),
    updatedAt: new Date("2024-11-11")
  },

  // ── ORDER 9 ──────────────────────────────────────────────────────────────
  {
    userId: u9._id,
    orderNumber: "ORD-2024-000009",
    items: [
      { productId: p11._id, productName: p11.name, sku: "MAN-PRO-6MM",  quantity: NumberInt(1), unitPrice: 120.00, totalPrice: 120.00, variant: "Black / Standard" },
      { productId: p18._id, productName: p18.name, sku: "FTS-RBAND-5PK", quantity: NumberInt(2), unitPrice: 19.99, totalPrice: 39.98, variant: "Latex" },
      { productId: p13._id, productName: p13.name, sku: "NKE-PEG41-001", quantity: NumberInt(1), unitPrice: 130.00, totalPrice: 130.00, variant: "Women's 8 / Pink-White" }
    ],
    shippingAddress: { street: "67 Jade Avenue", city: "Austin", state: "TX", country: "USA", zipCode: "73301" },
    billingAddress:  { street: "67 Jade Avenue", city: "Austin", state: "TX", country: "USA", zipCode: "73301" },
    subtotal: 289.98,
    shippingCost: 0.00,
    taxAmount: 23.20,
    discountAmount: 43.50,
    couponCode: "SPORT15",
    totalAmount: 269.68,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "standard",
    trackingNumber: "TRK9012345678",
    estimatedDelivery: new Date("2024-09-15"),
    deliveredAt: new Date("2024-09-14"),
    notes: "",
    createdAt: new Date("2024-09-05"),
    updatedAt: new Date("2024-09-14")
  },

  // ── ORDER 10 ─────────────────────────────────────────────────────────────
  {
    userId: u10._id,
    orderNumber: "ORD-2024-000010",
    items: [
      { productId: p17._id, productName: p17.name, sku: "GOO-PX9P-001", quantity: NumberInt(1), unitPrice: 999.00, totalPrice: 999.00, variant: "Obsidian / 256GB" },
      { productId: p4._id, productName: p4.name, sku: "SNY-WH1000XM6", quantity: NumberInt(1), unitPrice: 349.99, totalPrice: 349.99, variant: "Midnight Blue" }
    ],
    shippingAddress: { street: "62 Cactus Road", city: "San Antonio", state: "TX", country: "USA", zipCode: "78201" },
    billingAddress:  { street: "62 Cactus Road", city: "San Antonio", state: "TX", country: "USA", zipCode: "78201" },
    subtotal: 1348.99,
    shippingCost: 0.00,
    taxAmount: 107.92,
    discountAmount: 0.00,
    couponCode: null,
    totalAmount: 1456.91,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "express",
    trackingNumber: "TRK0123456789",
    estimatedDelivery: new Date("2024-11-05"),
    deliveredAt: new Date("2024-11-04"),
    notes: "",
    createdAt: new Date("2024-10-28"),
    updatedAt: new Date("2024-11-04")
  },

  // ── ORDER 11 ─────────────────────────────────────────────────────────────
  {
    userId: u11._id,
    orderNumber: "ORD-2024-000011",
    items: [
      { productId: p5._id, productName: p5.name, sku: "SF-MCHINO-001", quantity: NumberInt(3), unitPrice: 59.99, totalPrice: 179.97, variant: "Navy Blue / 32x32" }
    ],
    shippingAddress: { street: "19 Baker Street", city: "London", state: "England", country: "UK", zipCode: "W1U" },
    billingAddress:  { street: "19 Baker Street", city: "London", state: "England", country: "UK", zipCode: "W1U" },
    subtotal: 179.97,
    shippingCost: 18.00,
    taxAmount: 14.40,
    discountAmount: 27.00,
    couponCode: "SUMMER15",
    totalAmount: 185.37,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "international_express",
    trackingNumber: "TRK1122334455",
    estimatedDelivery: new Date("2024-08-20"),
    deliveredAt: new Date("2024-08-18"),
    notes: "UK delivery.",
    createdAt: new Date("2024-08-10"),
    updatedAt: new Date("2024-08-18")
  },

  // ── ORDER 12 ─────────────────────────────────────────────────────────────
  {
    userId: u1._id,
    orderNumber: "ORD-2024-000012",
    items: [
      { productId: p20._id, productName: p20.name, sku: "LGO-TECH-42151", quantity: NumberInt(1), unitPrice: 69.99, totalPrice: 69.99, variant: "Standard Box" },
      { productId: p8._id, productName: p8.name, sku: "LIT-ATOMHAB-PB",  quantity: NumberInt(2), unitPrice: 16.99, totalPrice: 33.98, variant: "Paperback" }
    ],
    shippingAddress: { street: "14 Maple Avenue", city: "New York", state: "NY", country: "USA", zipCode: "10001" },
    billingAddress:  { street: "14 Maple Avenue", city: "New York", state: "NY", country: "USA", zipCode: "10001" },
    subtotal: 103.97,
    shippingCost: 0.00,
    taxAmount: 8.32,
    discountAmount: 15.00,
    couponCode: "FIRSTORDER",
    totalAmount: 97.29,
    paymentMethod: "paypal",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "standard",
    trackingNumber: "TRK2233445566",
    estimatedDelivery: new Date("2024-11-18"),
    deliveredAt: new Date("2024-11-16"),
    notes: "Birthday gift for my son.",
    createdAt: new Date("2024-11-08"),
    updatedAt: new Date("2024-11-16")
  },

  // ── ORDER 13 ─────────────────────────────────────────────────────────────
  {
    userId: u7._id,
    orderNumber: "ORD-2024-000013",
    items: [
      { productId: p16._id, productName: p16.name, sku: "DYS-TP07-001", quantity: NumberInt(1), unitPrice: 549.99, totalPrice: 549.99, variant: "White/Silver" }
    ],
    shippingAddress: { street: "200 Oak Boulevard", city: "Boston", state: "MA", country: "USA", zipCode: "02101" },
    billingAddress:  { street: "200 Oak Boulevard", city: "Boston", state: "MA", country: "USA", zipCode: "02101" },
    subtotal: 549.99,
    shippingCost: 0.00,
    taxAmount: 44.00,
    discountAmount: 0.00,
    couponCode: null,
    totalAmount: 593.99,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "confirmed",
    shippingMethod: "standard",
    trackingNumber: null,
    estimatedDelivery: new Date("2024-11-30"),
    deliveredAt: null,
    notes: "",
    createdAt: new Date("2024-11-18"),
    updatedAt: new Date("2024-11-18")
  },

  // ── ORDER 14 ─────────────────────────────────────────────────────────────
  {
    userId: u3._id,
    orderNumber: "ORD-2024-000014",
    items: [
      { productId: p3._id, productName: p3.name, sku: "APL-MBP14-M4", quantity: NumberInt(1), unitPrice: 1599.00, totalPrice: 1599.00, variant: "M4 Pro / 24GB / 1TB" }
    ],
    shippingAddress: { street: "88 Orchid Street", city: "San Francisco", state: "CA", country: "USA", zipCode: "94102" },
    billingAddress:  { street: "88 Orchid Street", city: "San Francisco", state: "CA", country: "USA", zipCode: "94102" },
    subtotal: 1599.00,
    shippingCost: 0.00,
    taxAmount: 127.92,
    discountAmount: 399.75,
    couponCode: "HOLIDAY30",
    totalAmount: 1327.17,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "pending",
    shippingMethod: "express",
    trackingNumber: null,
    estimatedDelivery: new Date("2024-11-30"),
    deliveredAt: null,
    notes: "Please use sturdy packaging.",
    createdAt: new Date("2024-11-21"),
    updatedAt: new Date("2024-11-21")
  },

  // ── ORDER 15 ─────────────────────────────────────────────────────────────
  {
    userId: u5._id,
    orderNumber: "ORD-2024-000015",
    items: [
      { productId: p4._id, productName: p4.name, sku: "SNY-WH1000XM6", quantity: NumberInt(1), unitPrice: 349.99, totalPrice: 349.99, variant: "Platinum Silver" },
      { productId: p12._id, productName: p12.name, sku: "BOSE-QCUE-001", quantity: NumberInt(1), unitPrice: 279.00, totalPrice: 279.00, variant: "White Smoke" }
    ],
    shippingAddress: { street: "101 Pine Street", city: "Seattle", state: "WA", country: "USA", zipCode: "98101" },
    billingAddress:  { street: "101 Pine Street", city: "Seattle", state: "WA", country: "USA", zipCode: "98101" },
    subtotal: 628.99,
    shippingCost: 0.00,
    taxAmount: 50.32,
    discountAmount: 0.00,
    couponCode: null,
    totalAmount: 679.31,
    paymentMethod: "debit_card",
    paymentStatus: "paid",
    status: "cancelled",
    shippingMethod: "standard",
    trackingNumber: null,
    estimatedDelivery: null,
    deliveredAt: null,
    cancellationReason: "Customer changed their mind",
    notes: "",
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-10-15")
  },

  // ── ORDER 16 ─────────────────────────────────────────────────────────────
  {
    userId: u12._id,
    orderNumber: "ORD-2024-000016",
    items: [
      { productId: p6._id, productName: p6.name, sku: "SF-WDRESS-001", quantity: NumberInt(4), unitPrice: 79.99, totalPrice: 319.96, variant: "Pink Floral / S" },
      { productId: p5._id, productName: p5.name, sku: "SF-MCHINO-001", quantity: NumberInt(4), unitPrice: 59.99, totalPrice: 239.96, variant: "Khaki / 32x32" }
    ],
    shippingAddress: { street: "12 Magnolia Way", city: "Portland", state: "OR", country: "USA", zipCode: "97201" },
    billingAddress:  { street: "12 Magnolia Way", city: "Portland", state: "OR", country: "USA", zipCode: "97201" },
    subtotal: 559.92,
    shippingCost: 0.00,
    taxAmount: 44.79,
    discountAmount: 83.99,
    couponCode: "SUMMER15",
    totalAmount: 520.72,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "standard",
    trackingNumber: "TRK3344556677",
    estimatedDelivery: new Date("2024-09-02"),
    deliveredAt: new Date("2024-08-31"),
    notes: "Seller order (for store inventory review).",
    createdAt: new Date("2024-08-22"),
    updatedAt: new Date("2024-08-31")
  },

  // ── ORDER 17 ─────────────────────────────────────────────────────────────
  {
    userId: u2._id,
    orderNumber: "ORD-2024-000017",
    items: [
      { productId: p1._id, productName: p1.name, sku: "APL-IP16P-001", quantity: NumberInt(1), unitPrice: 999.00, totalPrice: 999.00, variant: "White Titanium / 128GB" }
    ],
    shippingAddress: { street: "7 Sunset Blvd", city: "Los Angeles", state: "CA", country: "USA", zipCode: "90001" },
    billingAddress:  { street: "7 Sunset Blvd", city: "Los Angeles", state: "CA", country: "USA", zipCode: "90001" },
    subtotal: 999.00,
    shippingCost: 0.00,
    taxAmount: 79.92,
    discountAmount: 99.90,
    couponCode: "WELCOME10",
    totalAmount: 979.02,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "express",
    trackingNumber: "TRK4455667788",
    estimatedDelivery: new Date("2024-11-10"),
    deliveredAt: new Date("2024-11-09"),
    notes: "",
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-09")
  },

  // ── ORDER 18 ─────────────────────────────────────────────────────────────
  {
    userId: u9._id,
    orderNumber: "ORD-2024-000018",
    items: [
      { productId: p2._id, productName: p2.name, sku: "SAM-GS24U-001", quantity: NumberInt(1), unitPrice: 1199.99, totalPrice: 1199.99, variant: "Titanium Violet / 512GB" },
      { productId: p3._id, productName: p3.name, sku: "APL-MBP14-M4",  quantity: NumberInt(1), unitPrice: 1599.00, totalPrice: 1599.00, variant: "M4 / 16GB / 512GB" },
      { productId: p4._id, productName: p4.name, sku: "SNY-WH1000XM6", quantity: NumberInt(1), unitPrice: 349.99, totalPrice: 349.99, variant: "Midnight Black" }
    ],
    shippingAddress: { street: "67 Jade Avenue", city: "Austin", state: "TX", country: "USA", zipCode: "73301" },
    billingAddress:  { street: "67 Jade Avenue", city: "Austin", state: "TX", country: "USA", zipCode: "73301" },
    subtotal: 3148.98,
    shippingCost: 0.00,
    taxAmount: 251.92,
    discountAmount: 787.25,
    couponCode: "VIP25",
    totalAmount: 2613.65,
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    status: "delivered",
    shippingMethod: "express",
    trackingNumber: "TRK5566778899",
    estimatedDelivery: new Date("2024-06-20"),
    deliveredAt: new Date("2024-06-19"),
    notes: "Handle with care — fragile electronics.",
    createdAt: new Date("2024-06-10"),
    updatedAt: new Date("2024-06-19")
  }
]);

print("  ✓ Inserted 18 orders.\n");

// ─────────────────────────────────────────────────────────────────────────────
// 3.7  PAYMENTS  (18 documents — one per order)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting payments...");

const ordersList = db.orders.find({}, { _id: 1, userId: 1, totalAmount: 1, paymentMethod: 1, orderNumber: 1 }).toArray();

const paymentDocs = ordersList.map((order, i) => ({
  orderId: order._id,
  userId: order.userId,
  orderNumber: order.orderNumber,
  amount: order.totalAmount,
  currency: "USD",
  method: order.paymentMethod,
  status: order.orderNumber === "ORD-2024-000015" ? "refunded" : "completed",
  transactionId: `TXN-${Date.now()}-${String(i).padStart(4, "0")}`,
  gateway: order.paymentMethod === "paypal" ? "PayPal" : "Stripe",
  gatewayResponse: {
    code: "00",
    message: "Approved",
    authCode: `AUTH${String(100000 + i)}`
  },
  billingCountry: "USA",
  last4: order.paymentMethod === "credit_card" || order.paymentMethod === "debit_card"
    ? String(Math.floor(1000 + Math.random() * 9000))
    : null,
  createdAt: new Date(),
  updatedAt: new Date()
}));

db.payments.insertMany(paymentDocs);
print("  ✓ Inserted 18 payment records.\n");

// ─────────────────────────────────────────────────────────────────────────────
// 3.8  REVIEWS  (20 documents — with nested structure)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting reviews...");

db.reviews.insertMany([
  {
    productId: p1._id, userId: u1._id,
    rating: NumberInt(5), title: "Absolutely stunning phone",
    body: "Switched from Android and I'm blown away by the camera and performance. The titanium build feels incredibly premium. Battery life with the 256GB variant is excellent.",
    verifiedPurchase: true, helpfulVotes: NumberInt(47),
    images: ["/reviews/img001.jpg"],
    createdAt: new Date("2024-10-12"), updatedAt: new Date("2024-10-12"),
    sellerResponse: null
  },
  {
    productId: p1._id, userId: u7._id,
    rating: NumberInt(4), title: "Great phone, pricey but worth it",
    body: "The 5x zoom is a game changer for travel photography. A18 Pro is incredibly fast. Knocked one star because the base 128GB fills up quickly.",
    verifiedPurchase: false, helpfulVotes: NumberInt(31),
    images: [],
    createdAt: new Date("2024-11-01"), updatedAt: new Date("2024-11-01"),
    sellerResponse: null
  },
  {
    productId: p2._id, userId: u10._id,
    rating: NumberInt(5), title: "Best Android phone ever made",
    body: "The S Pen alone makes this worth the premium. Galaxy AI features are genuinely useful. The 200MP camera produces jaw-dropping detail in good lighting.",
    verifiedPurchase: true, helpfulVotes: NumberInt(62),
    images: ["/reviews/img003.jpg"],
    createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-02-10"),
    sellerResponse: null
  },
  {
    productId: p3._id, userId: u2._id,
    rating: NumberInt(5), title: "This MacBook is a beast",
    body: "Compiling large Rust codebases in under 60 seconds. The M4 Pro chip is unreal. Fan never spins under normal load. The Liquid Retina XDR display is the best I've ever used.",
    verifiedPurchase: true, helpfulVotes: NumberInt(89),
    images: [],
    createdAt: new Date("2024-11-03"), updatedAt: new Date("2024-11-03"),
    sellerResponse: null
  },
  {
    productId: p3._id, userId: u3._id,
    rating: NumberInt(5), title: "Worth every penny for creative work",
    body: "Video editing in Final Cut Pro is instant — no dropped frames, no lag. The 1TB SSD is lightning fast. Battery genuinely lasts all day through heavy usage.",
    verifiedPurchase: false, helpfulVotes: NumberInt(54),
    images: [],
    createdAt: new Date("2024-11-18"), updatedAt: new Date("2024-11-18"),
    sellerResponse: null
  },
  {
    productId: p4._id, userId: u5._id,
    rating: NumberInt(5), title: "Nothing cancels noise like these",
    body: "I work in a busy open-plan office and these headphones are a literal lifesaver. The LDAC codec makes hi-res streaming sound incredible. 30-hour battery is realistic.",
    verifiedPurchase: true, helpfulVotes: NumberInt(73),
    images: [],
    createdAt: new Date("2024-09-20"), updatedAt: new Date("2024-09-20"),
    sellerResponse: null
  },
  {
    productId: p4._id, userId: u9._id,
    rating: NumberInt(4), title: "Excellent ANC, slightly heavy",
    body: "The noise cancellation is industry-leading without question. Sound quality is warm and detailed. The only downside is they feel slightly heavy during long listening sessions.",
    verifiedPurchase: true, helpfulVotes: NumberInt(28),
    images: [],
    createdAt: new Date("2024-06-22"), updatedAt: new Date("2024-06-22"),
    sellerResponse: null
  },
  {
    productId: p6._id, userId: u3._id,
    rating: NumberInt(5), title: "The most flattering dress I own",
    body: "I ordered two — the Blue Floral and Pink Floral. Both fit perfectly true to size. The fabric is lightweight and breathable, perfect for summer. Got so many compliments!",
    verifiedPurchase: true, helpfulVotes: NumberInt(44),
    images: ["/reviews/img008.jpg", "/reviews/img009.jpg"],
    createdAt: new Date("2024-09-28"), updatedAt: new Date("2024-09-28"),
    sellerResponse: null
  },
  {
    productId: p7._id, userId: u5._id,
    rating: NumberInt(5), title: "A kitchen investment for life",
    body: "I've had this mixer for a year and it's used multiple times a week. The motor is whisper-quiet and powerful. The Empire Red colour is stunning on my counter. Worth every dollar.",
    verifiedPurchase: true, helpfulVotes: NumberInt(117),
    images: ["/reviews/img010.jpg"],
    createdAt: new Date("2024-09-01"), updatedAt: new Date("2024-09-01"),
    sellerResponse: { text: "Thank you so much for this wonderful review!", respondedAt: new Date("2024-09-03") }
  },
  {
    productId: p8._id, userId: u6._id,
    rating: NumberInt(5), title: "Changed how I approach daily habits",
    body: "This book is dense with actionable advice. The 1% improvement framework is simple yet profound. I've read it twice and found new insights on the second reading.",
    verifiedPurchase: true, helpfulVotes: NumberInt(203),
    images: [],
    createdAt: new Date("2024-10-22"), updatedAt: new Date("2024-10-22"),
    sellerResponse: null
  },
  {
    productId: p9._id, userId: u8._id,
    rating: NumberInt(5), title: "Visibly brighter skin in 2 weeks",
    body: "I was skeptical about the 20% Vitamin C concentration but my skin adapted within days. Dark spots from sun damage have visibly faded. The texture is lightweight, absorbs fast.",
    verifiedPurchase: true, helpfulVotes: NumberInt(88),
    images: ["/reviews/img011.jpg"],
    createdAt: new Date("2024-11-13"), updatedAt: new Date("2024-11-13"),
    sellerResponse: null
  },
  {
    productId: p10._id, userId: u4._id,
    rating: NumberInt(5), title: "PS5 is still the king",
    body: "Spider-Man 2 at 4K 60fps with ray tracing looks absolutely insane. The DualSense haptic feedback adds a layer of immersion I didn't know I needed. Load times are nearly instant.",
    verifiedPurchase: false, helpfulVotes: NumberInt(95),
    images: [],
    createdAt: new Date("2024-11-20"), updatedAt: new Date("2024-11-20"),
    sellerResponse: null
  },
  {
    productId: p11._id, userId: u9._id,
    rating: NumberInt(5), title: "The last yoga mat you'll ever buy",
    body: "I had a cheaper mat that curled at the edges and slipped. The Manduka PRO is a completely different category. The dense foam cushions perfectly and the grip is outstanding.",
    verifiedPurchase: true, helpfulVotes: NumberInt(66),
    images: [],
    createdAt: new Date("2024-09-16"), updatedAt: new Date("2024-09-16"),
    sellerResponse: null
  },
  {
    productId: p12._id, userId: u7._id,
    rating: NumberInt(5), title: "Immersive Audio is genuinely magical",
    body: "I've tried many earbuds and the Bose QC Ultra are the best. The spatial audio makes music feel like it's coming from around you. ANC is class-leading for in-ears.",
    verifiedPurchase: true, helpfulVotes: NumberInt(41),
    images: [],
    createdAt: new Date("2024-07-19"), updatedAt: new Date("2024-07-19"),
    sellerResponse: null
  },
  {
    productId: p13._id, userId: u9._id,
    rating: NumberInt(4), title: "Reliable everyday trainer",
    body: "I run 30-40 miles a week in these and they hold up great. The React foam is responsive without being too firm. Sizing runs half a size small — order up.",
    verifiedPurchase: true, helpfulVotes: NumberInt(37),
    images: [],
    createdAt: new Date("2024-09-17"), updatedAt: new Date("2024-09-17"),
    sellerResponse: null
  },
  {
    productId: p14._id, userId: u2._id,
    rating: NumberInt(5), title: "Fastest portable SSD I've tested",
    body: "Tested it with a 50GB folder — hit 1,850 MB/s read. The compact form factor fits in any pocket. The rubberized grip feels secure. Password protection app is easy to set up.",
    verifiedPurchase: true, helpfulVotes: NumberInt(52),
    images: [],
    createdAt: new Date("2024-10-21"), updatedAt: new Date("2024-10-21"),
    sellerResponse: null
  },
  {
    productId: p17._id, userId: u10._id,
    rating: NumberInt(5), title: "The best Android camera phone this year",
    body: "Pixel 9 Pro absolutely nails computational photography. Night Sight in complete darkness is jaw-dropping. The Tensor G4 processes AI tasks on-device, making everything feel instant.",
    verifiedPurchase: true, helpfulVotes: NumberInt(79),
    images: ["/reviews/img017.jpg"],
    createdAt: new Date("2024-11-05"), updatedAt: new Date("2024-11-05"),
    sellerResponse: null
  },
  {
    productId: p19._id, userId: u8._id,
    rating: NumberInt(5), title: "The most luxurious scent I've found",
    body: "The Black Tulip scent is intoxicating — deep floral with a warm woody base. Burn time is honest at 55+ hours in my experience. The jar is elegant and reusable.",
    verifiedPurchase: true, helpfulVotes: NumberInt(33),
    images: [],
    createdAt: new Date("2024-11-14"), updatedAt: new Date("2024-11-14"),
    sellerResponse: null
  },
  {
    productId: p5._id, userId: u11._id,
    rating: NumberInt(4), title: "Sharp, comfortable fit",
    body: "These chinos are well-constructed and the stretch twill makes them comfortable all day. The Navy Blue is a versatile shade. I'd recommend sizing down if between sizes.",
    verifiedPurchase: true, helpfulVotes: NumberInt(19),
    images: [],
    createdAt: new Date("2024-08-20"), updatedAt: new Date("2024-08-20"),
    sellerResponse: null
  },
  {
    productId: p15._id, userId: u5._id,
    rating: NumberInt(5), title: "Perfect eco-friendly kitchen upgrade",
    body: "These bamboo boards look beautiful and are incredibly sturdy. The groove channels catch all the juice. Love that they're FSC certified and have anti-slip feet. Great set.",
    verifiedPurchase: true, helpfulVotes: NumberInt(24),
    images: [],
    createdAt: new Date("2024-08-15"), updatedAt: new Date("2024-08-15"),
    sellerResponse: null
  }
]);

print("  ✓ Inserted 20 reviews.\n");

// ─────────────────────────────────────────────────────────────────────────────
// 3.9  CARTS  (15 documents — embedded items)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting carts...");

db.carts.insertMany([
  { userId: u1._id, items: [{ productId: p20._id, productName: p20.name, quantity: NumberInt(1), unitPrice: 69.99, variant: "Standard Box" }, { productId: p8._id, productName: p8.name, quantity: NumberInt(1), unitPrice: 16.99, variant: "Hardcover" }], totalItems: NumberInt(2), subtotal: 86.98, updatedAt: new Date("2024-11-20") },
  { userId: u2._id, items: [{ productId: p1._id, productName: p1.name, quantity: NumberInt(1), unitPrice: 999.00, variant: "Desert Titanium / 512GB" }], totalItems: NumberInt(1), subtotal: 999.00, updatedAt: new Date("2024-11-21") },
  { userId: u3._id, items: [{ productId: p9._id, productName: p9.name, quantity: NumberInt(2), unitPrice: 39.99, variant: "50ml" }], totalItems: NumberInt(2), subtotal: 79.98, updatedAt: new Date("2024-11-19") },
  { userId: u4._id, items: [{ productId: p10._id, productName: p10.name, quantity: NumberInt(1), unitPrice: 499.99, variant: "Digital Edition" }, { productId: p20._id, productName: p20.name, quantity: NumberInt(1), unitPrice: 69.99, variant: "Gift Set" }], totalItems: NumberInt(2), subtotal: 569.98, updatedAt: new Date("2024-11-21") },
  { userId: u5._id, items: [{ productId: p16._id, productName: p16.name, quantity: NumberInt(1), unitPrice: 549.99, variant: "Iron/Blue" }], totalItems: NumberInt(1), subtotal: 549.99, updatedAt: new Date("2024-11-20") },
  { userId: u6._id, items: [{ productId: p8._id, productName: p8.name, quantity: NumberInt(3), unitPrice: 16.99, variant: "e-Book" }], totalItems: NumberInt(3), subtotal: 50.97, updatedAt: new Date("2024-11-18") },
  { userId: u7._id, items: [{ productId: p3._id, productName: p3.name, quantity: NumberInt(1), unitPrice: 1599.00, variant: "M4 Max / 48GB / 1TB" }], totalItems: NumberInt(1), subtotal: 1599.00, updatedAt: new Date("2024-11-21") },
  { userId: u8._id, items: [{ productId: p6._id, productName: p6.name, quantity: NumberInt(1), unitPrice: 79.99, variant: "Green Floral / M" }, { productId: p19._id, productName: p19.name, quantity: NumberInt(1), unitPrice: 100.00, variant: "21.2oz Lg" }], totalItems: NumberInt(2), subtotal: 179.99, updatedAt: new Date("2024-11-17") },
  { userId: u9._id, items: [{ productId: p11._id, productName: p11.name, quantity: NumberInt(1), unitPrice: 140.00, variant: "Amethyst / Long 85\"" }], totalItems: NumberInt(1), subtotal: 140.00, updatedAt: new Date("2024-11-21") },
  { userId: u10._id, items: [{ productId: p2._id, productName: p2.name, quantity: NumberInt(1), unitPrice: 1319.99, variant: "Titanium Yellow / 1TB" }, { productId: p4._id, productName: p4.name, quantity: NumberInt(1), unitPrice: 359.99, variant: "Midnight Blue" }], totalItems: NumberInt(2), subtotal: 1679.98, updatedAt: new Date("2024-11-20") },
  { userId: u11._id, items: [{ productId: p13._id, productName: p13.name, quantity: NumberInt(2), unitPrice: 130.00, variant: "Men's 10 / Blue-Orange" }], totalItems: NumberInt(2), subtotal: 260.00, updatedAt: new Date("2024-11-15") },
  { userId: u12._id, items: [{ productId: p5._id, productName: p5.name, quantity: NumberInt(5), unitPrice: 59.99, variant: "Charcoal / 34x34" }, { productId: p6._id, productName: p6.name, quantity: NumberInt(5), unitPrice: 79.99, variant: "Blue Floral / L" }], totalItems: NumberInt(10), subtotal: 699.90, updatedAt: new Date("2024-11-20") },
  { userId: db.users.findOne({ email: "liam.obrien@email.com" })._id, items: [{ productId: p18._id, productName: p18.name, quantity: NumberInt(1), unitPrice: 19.99, variant: "Latex-Free" }], totalItems: NumberInt(1), subtotal: 19.99, updatedAt: new Date("2024-11-10") },
  { userId: db.users.findOne({ email: "rachel.scott@email.com" })._id, items: [{ productId: p9._id, productName: p9.name, quantity: NumberInt(1), unitPrice: 39.99, variant: "30ml" }, { productId: p19._id, productName: p19.name, quantity: NumberInt(2), unitPrice: 48.00, variant: "8.1oz" }], totalItems: NumberInt(3), subtotal: 135.99, updatedAt: new Date("2024-11-16") },
  { userId: db.users.findOne({ email: "nathan.russo@email.com" })._id, items: [{ productId: p7._id, productName: p7.name, quantity: NumberInt(1), unitPrice: 399.99, variant: "Pistachio" }], totalItems: NumberInt(1), subtotal: 399.99, updatedAt: new Date() },  
]);

print("  ✓ Inserted 15 carts.\n");

// ─────────────────────────────────────────────────────────────────────────────
// 3.10  INVENTORY  (20 documents — per-product-variant warehouse records)
// ─────────────────────────────────────────────────────────────────────────────
print("── Inserting inventory records...");

db.inventory.insertMany([
  { productId: p1._id,  sku: "APL-IP16P-128-BLK",  productName: p1.name,  variant: "Black Titanium / 128GB",    warehouse: "WH-NY",  quantity: NumberInt(45),  reserved: NumberInt(5),  available: NumberInt(40),  reorderLevel: NumberInt(10), lastUpdated: new Date() },
  { productId: p1._id,  sku: "APL-IP16P-256-BLK",  productName: p1.name,  variant: "Black Titanium / 256GB",    warehouse: "WH-NY",  quantity: NumberInt(38),  reserved: NumberInt(8),  available: NumberInt(30),  reorderLevel: NumberInt(10), lastUpdated: new Date() },
  { productId: p2._id,  sku: "SAM-GS24U-256-BLK",  productName: p2.name,  variant: "Titanium Black / 256GB",    warehouse: "WH-LA",  quantity: NumberInt(60),  reserved: NumberInt(12), available: NumberInt(48),  reorderLevel: NumberInt(15), lastUpdated: new Date() },
  { productId: p3._id,  sku: "APL-MBP14-M4PRO-512", productName: p3.name, variant: "M4 Pro / 24GB / 512GB",     warehouse: "WH-NY",  quantity: NumberInt(40),  reserved: NumberInt(6),  available: NumberInt(34),  reorderLevel: NumberInt(8),  lastUpdated: new Date() },
  { productId: p4._id,  sku: "SNY-WH6-BLACK",       productName: p4.name, variant: "Midnight Black",            warehouse: "WH-CHI", quantity: NumberInt(120), reserved: NumberInt(20), available: NumberInt(100), reorderLevel: NumberInt(30), lastUpdated: new Date() },
  { productId: p5._id,  sku: "SF-MCH-KHK-3232",     productName: p5.name, variant: "Khaki / 32x32",             warehouse: "WH-PDX", quantity: NumberInt(100), reserved: NumberInt(15), available: NumberInt(85),  reorderLevel: NumberInt(25), lastUpdated: new Date() },
  { productId: p6._id,  sku: "SF-WDR-BLU-M",        productName: p6.name, variant: "Blue Floral / M",           warehouse: "WH-PDX", quantity: NumberInt(90),  reserved: NumberInt(10), available: NumberInt(80),  reorderLevel: NumberInt(20), lastUpdated: new Date() },
  { productId: p7._id,  sku: "KA-ARTISAN-RED",       productName: p7.name, variant: "Empire Red",                warehouse: "WH-NSH", quantity: NumberInt(35),  reserved: NumberInt(4),  available: NumberInt(31),  reorderLevel: NumberInt(10), lastUpdated: new Date() },
  { productId: p8._id,  sku: "LIT-ATOMHAB-PB",       productName: p8.name, variant: "Paperback",                 warehouse: "WH-BOS", quantity: NumberInt(300), reserved: NumberInt(50), available: NumberInt(250), reorderLevel: NumberInt(100),lastUpdated: new Date() },
  { productId: p9._id,  sku: "GB-VCS-30ML",          productName: p9.name, variant: "30ml",                      warehouse: "WH-MIA", quantity: NumberInt(250), reserved: NumberInt(30), available: NumberInt(220), reorderLevel: NumberInt(50), lastUpdated: new Date() },
  { productId: p10._id, sku: "SNY-PS5-DISC-STD",     productName: p10.name,variant: "Standard (Disc)",           warehouse: "WH-AUS", quantity: NumberInt(50),  reserved: NumberInt(8),  available: NumberInt(42),  reorderLevel: NumberInt(15), lastUpdated: new Date() },
  { productId: p11._id, sku: "MAN-PRO-BLK-71",       productName: p11.name,variant: "Black / Standard",          warehouse: "WH-DAL", quantity: NumberInt(95),  reserved: NumberInt(10), available: NumberInt(85),  reorderLevel: NumberInt(20), lastUpdated: new Date() },
  { productId: p12._id, sku: "BOSE-QCUE-BLACK",      productName: p12.name,variant: "Black",                     warehouse: "WH-NY",  quantity: NumberInt(90),  reserved: NumberInt(12), available: NumberInt(78),  reorderLevel: NumberInt(25), lastUpdated: new Date() },
  { productId: p13._id, sku: "NKE-PEG41-M10-BLK",   productName: p13.name,variant: "Men's 10 / Black-White",    warehouse: "WH-SEA", quantity: NumberInt(55),  reserved: NumberInt(5),  available: NumberInt(50),  reorderLevel: NumberInt(15), lastUpdated: new Date() },
  { productId: p14._id, sku: "SAM-T9-2TB-BLK",       productName: p14.name,variant: "Black / 2TB",               warehouse: "WH-LA",  quantity: NumberInt(65),  reserved: NumberInt(9),  available: NumberInt(56),  reorderLevel: NumberInt(20), lastUpdated: new Date() },
  { productId: p15._id, sku: "ECO-CBSET-3PC",         productName: p15.name,variant: "3-Piece Set",               warehouse: "WH-PDX", quantity: NumberInt(200), reserved: NumberInt(25), available: NumberInt(175), reorderLevel: NumberInt(50), lastUpdated: new Date() },
  { productId: p16._id, sku: "DYS-TP07-WHT",         productName: p16.name,variant: "White/Silver",              warehouse: "WH-NSH", quantity: NumberInt(35),  reserved: NumberInt(3),  available: NumberInt(32),  reorderLevel: NumberInt(8),  lastUpdated: new Date() },
  { productId: p17._id, sku: "GOO-PX9P-OBS-128",     productName: p17.name,variant: "Obsidian / 128GB",          warehouse: "WH-CHI", quantity: NumberInt(55),  reserved: NumberInt(7),  available: NumberInt(48),  reorderLevel: NumberInt(15), lastUpdated: new Date() },
  { productId: p18._id, sku: "FTS-RBAND-LATEX",       productName: p18.name,variant: "Latex",                     warehouse: "WH-DEN", quantity: NumberInt(400), reserved: NumberInt(60), available: NumberInt(340), reorderLevel: NumberInt(100),lastUpdated: new Date() },
  { productId: p20._id, sku: "LGO-TECH-42151-STD",   productName: p20.name,variant: "Standard Box",              warehouse: "WH-CHI", quantity: NumberInt(180), reserved: NumberInt(20), available: NumberInt(160), reorderLevel: NumberInt(40), lastUpdated: new Date() }
]);

print("  ✓ Inserted 20 inventory records.\n");
print("══════════════════════════════════════════════════════════\n");
print("✓ ALL DATA INSERTION COMPLETE\n");
print("══════════════════════════════════════════════════════════\n\n");

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 ── CRUD OPERATIONS
// ══════════════════════════════════════════════════════════════════════════════

print("═══════════════════════════════════════════════════════════");
print("SECTION 4 — CRUD OPERATIONS");
print("═══════════════════════════════════════════════════════════\n");

// ─────────────────────────────────────────────────────────────────────────────
// 4.1  INSERT OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────
print("── 4.1 INSERT OPERATIONS ──────────────────────────────────\n");

// insertOne — add a new user
print("insertOne: Adding new user 'Tom Hanson'...");
db.users.insertOne({
  name: "Tom Hanson",
  email: "tom.hanson@email.com",
  passwordHash: "$2b$12$hashed_password_021",
  phone: "+1-555-0121",
  role: "customer",
  isActive: true,
  loyaltyPoints: NumberInt(0),
  createdAt: new Date(),
  lastLoginAt: null,
  address: {
    street: "48 Willow Street",
    city: "Minneapolis",
    state: "MN",
    country: "USA",
    zipCode: "55401"
  },
  preferences: {
    currency: "USD",
    language: "en",
    newsletterSubscribed: true
  }
});
print("  ✓ insertOne (users) complete.\n");

// insertOne — add a new coupon
print("insertOne: Adding flash coupon 'CYBER25'...");
db.coupons.insertOne({
  code: "CYBER25",
  type: "percentage",
  value: 25,
  description: "Cyber Monday — 25% off everything",
  minOrderAmount: 75.00,
  maxDiscountAmount: 150.00,
  maxUses: NumberInt(1000),
  usedCount: NumberInt(0),
  isActive: true,
  applicableCategories: [],
  excludedProducts: [],
  onePerUser: true,
  expiresAt: new Date("2024-12-02"),
  createdAt: new Date()
});
print("  ✓ insertOne (coupons) complete.\n");

// insertMany — add multiple new products
print("insertMany: Adding 3 new products...");
db.products.insertMany([
  {
    name: "Apple AirPods Pro (3rd Generation)",
    slug: "apple-airpods-pro-3rd-gen",
    description: "Rebuilt from the ground up with H2 chip, Adaptive Audio, and Personalized Spatial Audio for an immersive, intelligent listening experience.",
    shortDescription: "H2 chip. Adaptive Audio. MagSafe charging.",
    brand: "Apple",
    sku: "APL-APP3-001",
    price: 249.00,
    compareAtPrice: 279.00,
    costPrice: 110.00,
    categoryId: db.categories.findOne({ slug: "audio-headphones" })._id,
    sellerId: db.sellers.findOne({ storeName: "TechVault" })._id,
    images: [{ url: "/images/products/airpodspro3-1.jpg", altText: "AirPods Pro 3rd Gen", isPrimary: true }],
    specifications: {
      chip: "Apple H2",
      anc: "Adaptive Transparency, ANC",
      battery: "6hr (ANC on), 30hr with case",
      waterResistance: "IP54",
      charging: "MagSafe, USB-C, Qi2"
    },
    variants: [
      { color: "White", additionalPrice: 0, stock: NumberInt(200) }
    ],
    tags: ["apple", "airpods", "earbuds", "wireless", "anc"],
    averageRating: 4.8, reviewCount: NumberInt(0), totalSold: NumberInt(0),
    isActive: true, isFeatured: false,
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: "Instant Pot Duo 7-in-1 6Qt",
    slug: "instant-pot-duo-7in1-6qt",
    description: "The world's #1 multi-cooker. Replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.",
    shortDescription: "7-in-1 functionality. 6-quart. 1000W.",
    brand: "Instant Pot",
    sku: "IP-DUO-6QT",
    price: 79.99,
    compareAtPrice: 99.99,
    costPrice: 28.00,
    categoryId: db.categories.findOne({ slug: "kitchen-dining" })._id,
    sellerId: db.sellers.findOne({ storeName: "FreshKitchen" })._id,
    images: [{ url: "/images/products/instantpot-1.jpg", altText: "Instant Pot Duo 6Qt", isPrimary: true }],
    specifications: {
      capacity: "6-quart",
      power: "1000W",
      modes: "Pressure Cook, Slow Cook, Rice, Steam, Sauté, Yogurt, Warm",
      safetyFeatures: "10+ safety features",
      programs: "13 one-touch programs"
    },
    variants: [
      { size: "3Qt", additionalPrice: -20.00, stock: NumberInt(80) },
      { size: "6Qt", additionalPrice: 0,      stock: NumberInt(150) },
      { size: "8Qt", additionalPrice: 20.00,  stock: NumberInt(60) }
    ],
    tags: ["instant-pot", "pressure-cooker", "kitchen", "cooking", "multi-cooker"],
    averageRating: 4.7, reviewCount: NumberInt(0), totalSold: NumberInt(0),
    isActive: true, isFeatured: false,
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: "Patagonia Men's Down Sweater Jacket",
    slug: "patagonia-mens-down-sweater-jacket",
    description: "600-fill-power responsible down insulation in a slim, packable silhouette. Ethically sourced, Fair Trade certified, and built to last a lifetime.",
    shortDescription: "600-fill down. Slim fit. Recycled materials.",
    brand: "Patagonia",
    sku: "PAT-MDS-001",
    price: 229.00,
    compareAtPrice: 249.00,
    costPrice: 88.00,
    categoryId: db.categories.findOne({ slug: "mens-clothing" })._id,
    sellerId: db.sellers.findOne({ storeName: "BrooksGear" })._id,
    images: [{ url: "/images/products/patagonia-1.jpg", altText: "Patagonia Down Sweater", isPrimary: true }],
    specifications: {
      insulation: "600-fill-power Responsible Down Standard certified",
      shell: "100% recycled polyester ripstop",
      fit: "Slim",
      packability: "Stuffs into its own chest pocket",
      certifications: ["Fair Trade", "RDS certified down", "bluesign approved"]
    },
    variants: [
      { color: "Black",    size: "S",  additionalPrice: 0, stock: NumberInt(25) },
      { color: "Black",    size: "M",  additionalPrice: 0, stock: NumberInt(40) },
      { color: "Black",    size: "L",  additionalPrice: 0, stock: NumberInt(35) },
      { color: "Navy",     size: "M",  additionalPrice: 0, stock: NumberInt(30) },
      { color: "Red",      size: "L",  additionalPrice: 0, stock: NumberInt(20) }
    ],
    tags: ["patagonia", "jacket", "down", "outdoor", "sustainable"],
    averageRating: 4.9, reviewCount: NumberInt(0), totalSold: NumberInt(0),
    isActive: true, isFeatured: false,
    createdAt: new Date(), updatedAt: new Date()
  }
]);
print("  ✓ insertMany (products) complete.\n");


// ─────────────────────────────────────────────────────────────────────────────
// 4.2  READ OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────
print("── 4.2 READ OPERATIONS ────────────────────────────────────\n");

// find all active users
print("find: All active customers:");
db.users.find({ role: "customer", isActive: true }).toArray();
print("  ✓ find (users) complete.\n");

// find with projection
print("find + projection: Product names, prices, and ratings:");
db.products.find(
  { isActive: true },
  { name: 1, price: 1, averageRating: 1, totalSold: 1, _id: 0 }
).toArray();
print("  ✓ find + projection complete.\n");

// findOne — get specific order
print("findOne: Retrieve order ORD-2024-000001:");
db.orders.findOne({ orderNumber: "ORD-2024-000001" });
print("  ✓ findOne (orders) complete.\n");

// find all delivered orders
print("find: All delivered orders:");
db.orders.find({ status: "delivered" }).toArray();
print("  ✓ find (delivered orders) complete.\n");


// ─────────────────────────────────────────────────────────────────────────────
// 4.3  UPDATE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────
print("── 4.3 UPDATE OPERATIONS ──────────────────────────────────\n");

// updateOne — mark an order as shipped
print("updateOne: Mark order ORD-2024-000013 as 'shipped' and add tracking number...");
db.orders.updateOne(
  { orderNumber: "ORD-2024-000013" },
  {
    $set: {
      status: "shipped",
      trackingNumber: "TRK9988776655",
      updatedAt: new Date()
    }
  }
);
print("  ✓ updateOne (orders) complete.\n");

// updateOne — award loyalty points to a user
print("updateOne: Award 250 loyalty points to Alice Johnson...");
db.users.updateOne(
  { email: "alice.johnson@email.com" },
  {
    $inc: { loyaltyPoints: 250 },
    $set: { lastLoginAt: new Date() }
  }
);
print("  ✓ updateOne (users – loyalty points) complete.\n");

// updateOne — deactivate expired coupon
print("updateOne: Deactivate expired coupon FLASH40...");
db.coupons.updateOne(
  { code: "FLASH40" },
  { $set: { isActive: false, updatedAt: new Date() } }
);
print("  ✓ updateOne (coupons) complete.\n");

// updateOne — add a new variant to a product
print("updateOne: Add new storage variant to Samsung T9 SSD...");
db.products.updateOne(
  { slug: "samsung-t9-portable-ssd-2tb" },
  {
    $push: {
      variants: {
        color: "Blue",
        capacity: "4TB",
        additionalPrice: 130.00,
        stock: NumberInt(15)
      }
    },
    $set: { updatedAt: new Date() }
  }
);
print("  ✓ updateOne ($push variant) complete.\n");

// updateMany — reduce price of all Books category products by 10%
print("updateMany: Apply 10% sale price to all book products...");
db.products.updateMany(
  { categoryId: db.categories.findOne({ slug: "books-media" })._id },
  {
    $mul: { price: 0.90 },
    $set: { updatedAt: new Date(), onSale: true }
  }
);
print("  ✓ updateMany (products – books sale) complete.\n");

// updateMany — increment usedCount for all active coupons that have been used
print("updateMany: Increment usedCount by 1 for all active coupons with usedCount > 0...");
db.coupons.updateMany(
  { isActive: true, usedCount: { $gt: 0 } },
  { $inc: { usedCount: 1 } }
);
print("  ✓ updateMany (coupons – usedCount increment) complete.\n");

// updateOne — update user address
print("updateOne: Update delivery address for Bob Martinez...");
db.users.updateOne(
  { email: "bob.martinez@email.com" },
  {
    $set: {
      "address.street": "500 Hollywood Boulevard",
      "address.zipCode": "90028",
      updatedAt: new Date()
    }
  }
);
print("  ✓ updateOne (nested address update) complete.\n");

// updateMany — mark out-of-stock items as inactive
print("updateMany: Deactivate inventory items with quantity = 0...");
db.inventory.updateMany(
  { quantity: { $lte: 0 } },
  { $set: { available: NumberInt(0), lastUpdated: new Date() } }
);
print("  ✓ updateMany (inventory – zero stock) complete.\n");


// ─────────────────────────────────────────────────────────────────────────────
// 4.4  DELETE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────
print("── 4.4 DELETE OPERATIONS ──────────────────────────────────\n");

// deleteOne — remove a specific cart item (simulate clearing a session cart)
print("deleteOne: Remove cart for user 'tom.hanson@email.com' (empty cart cleanup)...");
// First create a temp cart to delete
db.carts.insertOne({
  userId: db.users.findOne({ email: "tom.hanson@email.com" })._id,
  items: [],
  totalItems: NumberInt(0),
  subtotal: 0.00,
  updatedAt: new Date()
});
db.carts.deleteOne({
  userId: db.users.findOne({ email: "tom.hanson@email.com" })._id,
  totalItems: 0
});
print("  ✓ deleteOne (empty cart) complete.\n");

// deleteMany — purge all expired, fully-used inactive coupons
print("deleteMany: Delete fully-used & expired coupons...");
db.coupons.deleteMany({
  isActive: false,
  expiresAt: { $lt: new Date() }
});
print("  ✓ deleteMany (expired coupons) complete.\n");

// deleteMany — remove all reviews with 0 helpful votes from users no longer active
print("deleteMany: Delete reviews with 0 helpfulVotes that are older than 1 year...");
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
db.reviews.deleteMany({
  helpfulVotes: 0,
  createdAt: { $lt: oneYearAgo }
});
print("  ✓ deleteMany (stale reviews) complete.\n");

print("\n");


// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5 ── QUERY OPERATIONS  (Operators, Projection, Sort, Limit, Skip)
// ══════════════════════════════════════════════════════════════════════════════

print("═══════════════════════════════════════════════════════════");
print("SECTION 5 — QUERY OPERATIONS");
print("═══════════════════════════════════════════════════════════\n");

// ─────────────────────────────────────────────────────────────────────────────
// 5.1  COMPARISON OPERATORS: $gt, $lt, $gte, $lte, $ne
// ─────────────────────────────────────────────────────────────────────────────
print("── 5.1 COMPARISON OPERATORS ───────────────────────────────\n");

// $gt — products priced above $500
print("$gt: Products with price > $500:");
db.products.find(
  { price: { $gt: 500 }, isActive: true },
  { name: 1, price: 1, averageRating: 1, _id: 0 }
).sort({ price: -1 }).toArray();

// $lt — budget products under $50
print("\n$lt: Products with price < $50 (budget picks):");
db.products.find(
  { price: { $lt: 50 }, isActive: true },
  { name: 1, price: 1, totalSold: 1, _id: 0 }
).sort({ price: 1 }).toArray();

// $gte — users with 1000+ loyalty points
print("\n$gte: Users with loyaltyPoints >= 1000:");
db.users.find(
  { loyaltyPoints: { $gte: 1000 } },
  { name: 1, email: 1, loyaltyPoints: 1, _id: 0 }
).sort({ loyaltyPoints: -1 }).toArray();

// $lte — coupons with a max discount of $50 or less
print("\n$lte: Coupons with maxDiscountAmount <= 50:");
db.coupons.find(
  { maxDiscountAmount: { $lte: 50 }, isActive: true },
  { code: 1, type: 1, value: 1, maxDiscountAmount: 1, _id: 0 }
).toArray();

// $ne — orders that are NOT in "delivered" status
print("\n$ne: Orders NOT in 'delivered' status:");
db.orders.find(
  { status: { $ne: "delivered" } },
  { orderNumber: 1, status: 1, totalAmount: 1, createdAt: 1, _id: 0 }
).sort({ createdAt: -1 }).toArray();

// $ne — inventory items not stored in "WH-NY"
print("\n$ne: Inventory items not in warehouse 'WH-NY':");
db.inventory.find(
  { warehouse: { $ne: "WH-NY" } },
  { productName: 1, warehouse: 1, available: 1, _id: 0 }
).toArray();
print("\n");


// ─────────────────────────────────────────────────────────────────────────────
// 5.2  LOGICAL OPERATORS: $and, $or
// ─────────────────────────────────────────────────────────────────────────────
print("── 5.2 LOGICAL OPERATORS ──────────────────────────────────\n");

// $and — active products in electronics with rating >= 4.7
print("$and: Active electronics products with averageRating >= 4.7:");
db.products.find({
  $and: [
    { isActive: true },
    { averageRating: { $gte: 4.7 } },
    { categoryId: { $in: [
      db.categories.findOne({ slug: "smartphones" })._id,
      db.categories.findOne({ slug: "laptops-computers" })._id,
      db.categories.findOne({ slug: "audio-headphones" })._id,
      db.categories.findOne({ slug: "gaming" })._id
    ]}}
  ]
},
{ name: 1, price: 1, averageRating: 1, totalSold: 1, _id: 0 }
).sort({ averageRating: -1 }).toArray();

// $or — users with role seller OR admin
print("\n$or: Users who are sellers OR admins:");
db.users.find(
  { $or: [{ role: "seller" }, { role: "admin" }] },
  { name: 1, email: 1, role: 1, _id: 0 }
).toArray();

// $and with $or — delivered or shipped orders with total > $400
print("\n$and + $or: Orders (delivered OR shipped) with totalAmount > $400:");
db.orders.find({
  $and: [
    { $or: [{ status: "delivered" }, { status: "shipped" }] },
    { totalAmount: { $gt: 400 } }
  ]
},
{ orderNumber: 1, status: 1, totalAmount: 1, _id: 0 }
).sort({ totalAmount: -1 }).toArray();

// $or — products on sale OR isFeatured
print("\n$or: Products that are featured OR on sale:");
db.products.find(
  { $or: [{ isFeatured: true }, { onSale: true }] },
  { name: 1, price: 1, isFeatured: 1, onSale: 1, _id: 0 }
).toArray();
print("\n");


// ─────────────────────────────────────────────────────────────────────────────
// 5.3  $in AND $nin
// ─────────────────────────────────────────────────────────────────────────────
print("── 5.3 $in AND $nin ───────────────────────────────────────\n");

// $in — orders with specific statuses
print("$in: Orders with status in ['pending', 'confirmed', 'shipped']:");
db.orders.find(
  { status: { $in: ["pending", "confirmed", "shipped"] } },
  { orderNumber: 1, status: 1, totalAmount: 1, userId: 1, _id: 0 }
).sort({ createdAt: -1 }).toArray();

// $in — products in specific warehouses
print("\n$in: Inventory in warehouses ['WH-NY', 'WH-LA', 'WH-CHI']:");
db.inventory.find(
  { warehouse: { $in: ["WH-NY", "WH-LA", "WH-CHI"] } },
  { productName: 1, warehouse: 1, quantity: 1, available: 1, _id: 0 }
).sort({ available: -1 }).toArray();

// $nin — products NOT tagged with 'apple' or 'samsung'
print("\n$nin: Products NOT tagged as 'apple' or 'samsung':");
db.products.find(
  { tags: { $nin: ["apple", "samsung"] }, isActive: true },
  { name: 1, brand: 1, price: 1, tags: 1, _id: 0 }
).toArray();

// $nin — coupons that are NOT percentage-type
print("\n$nin: Coupons that are NOT of type 'percentage':");
db.coupons.find(
  { type: { $nin: ["percentage"] } },
  { code: 1, type: 1, value: 1, isActive: 1, _id: 0 }
).toArray();
print("\n");


// ─────────────────────────────────────────────────────────────────────────────
// 5.4  PROJECTION
// ─────────────────────────────────────────────────────────────────────────────
print("── 5.4 PROJECTION ─────────────────────────────────────────\n");

// Inclusion projection — only name, brand, price, rating
print("Projection (include): Product catalog view — name, brand, price, rating:");
db.products.find(
  { isActive: true },
  { name: 1, brand: 1, price: 1, compareAtPrice: 1, averageRating: 1, reviewCount: 1, _id: 0 }
).toArray();

// Exclusion projection — hide sensitive fields from user document
print("\nProjection (exclude): User profile — hide passwordHash and _id:");
db.users.find(
  { isActive: true },
  { passwordHash: 0 }
).limit(5).toArray();

// Nested field projection — show only address city and country
print("\nProjection (nested): User locations — name, city, country only:");
db.users.find(
  {},
  { name: 1, "address.city": 1, "address.country": 1, _id: 0 }
).toArray();

// Projection on orders — only order number, status, total, and items
print("\nProjection: Order summary view — orderNumber, status, totalAmount:");
db.orders.find(
  { status: "delivered" },
  { orderNumber: 1, status: 1, totalAmount: 1, deliveredAt: 1, _id: 0 }
).toArray();
print("\n");


// ─────────────────────────────────────────────────────────────────────────────
// 5.5  SORTING
// ─────────────────────────────────────────────────────────────────────────────
print("── 5.5 SORTING ────────────────────────────────────────────\n");

// Sort products by price DESC
print("sort DESC: Products sorted by price (highest first):");
db.products.find(
  { isActive: true },
  { name: 1, price: 1, brand: 1, _id: 0 }
).sort({ price: -1 }).toArray();

// Sort products by totalSold DESC (bestsellers)
print("\nsort DESC: Top-selling products by totalSold:");
db.products.find(
  { isActive: true },
  { name: 1, totalSold: 1, averageRating: 1, _id: 0 }
).sort({ totalSold: -1 }).toArray();

// Sort users by loyaltyPoints DESC
print("\nsort DESC: Users by loyalty points (top loyalty members):");
db.users.find(
  { role: "customer", isActive: true },
  { name: 1, loyaltyPoints: 1, _id: 0 }
).sort({ loyaltyPoints: -1 }).toArray();

// Sort orders by totalAmount DESC
print("\nsort DESC: Orders by totalAmount (highest value first):");
db.orders.find(
  {},
  { orderNumber: 1, totalAmount: 1, status: 1, _id: 0 }
).sort({ totalAmount: -1 }).toArray();

// Sort reviews by helpfulVotes DESC then createdAt DESC
print("\nsort multi-key: Reviews sorted by helpfulVotes DESC, then createdAt DESC:");
db.reviews.find(
  {},
  { title: 1, rating: 1, helpfulVotes: 1, createdAt: 1, _id: 0 }
).sort({ helpfulVotes: -1, createdAt: -1 }).toArray();
print("\n");


// ─────────────────────────────────────────────────────────────────────────────
// 5.6  LIMIT AND SKIP (Pagination)
// ─────────────────────────────────────────────────────────────────────────────
print("── 5.6 LIMIT AND SKIP (PAGINATION) ───────────────────────\n");

const PAGE_SIZE = 5;

// Page 1 — top 5 products by rating
print("Pagination Page 1: Top 5 products by averageRating:");
db.products.find(
  { isActive: true },
  { name: 1, price: 1, averageRating: 1, totalSold: 1, _id: 0 }
).sort({ averageRating: -1, totalSold: -1 }).limit(PAGE_SIZE).skip(0).toArray();

// Page 2 — products 6–10
print("\nPagination Page 2: Products 6–10 by averageRating:");
db.products.find(
  { isActive: true },
  { name: 1, price: 1, averageRating: 1, totalSold: 1, _id: 0 }
).sort({ averageRating: -1, totalSold: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE).toArray();

// Paginate orders — page 1 of 5 per page
print("\nPagination: Orders page 1 (5 per page), newest first:");
db.orders.find(
  {},
  { orderNumber: 1, status: 1, totalAmount: 1, createdAt: 1, _id: 0 }
).sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(0).toArray();

// Limit — get only the 3 most recently created coupons
print("\nlimit(3): 3 most recently created active coupons:");
db.coupons.find(
  { isActive: true },
  { code: 1, type: 1, value: 1, expiresAt: 1, _id: 0 }
).sort({ createdAt: -1 }).limit(3).toArray();

// limit — show 3 highest-rated sellers
print("\nlimit(3): Top 3 sellers by rating:");
db.sellers.find(
  { isVerified: true },
  { storeName: 1, rating: 1, totalSales: 1, _id: 0 }
).sort({ rating: -1 }).limit(3).toArray();
print("\n");


print("\n");
print("╔══════════════════════════════════════════════════════════╗");
print("║           E-COMMERCE DATABASE SCRIPT COMPLETE            ║");
print("║                                                          ║");
print("║  Collections: users, categories, sellers, products,      ║");
print("║               orders, reviews, carts, payments,          ║");
print("║               coupons, inventory                         ║");
print("║                                                          ║");
print("║  Section 3: Data Insertion  (10 collections)             ║");
print("║  Section 4: CRUD Operations (insertOne/Many,             ║");
print("║             updateOne/Many, deleteOne/Many, find)        ║");
print("║  Section 5: Query Operations ($gt,$lt,$gte,$lte,$ne,     ║");
print("║             $and,$or,$in,$nin, projection, sort,         ║");
print("║             limit, skip)                                 ║");
print("╚══════════════════════════════════════════════════════════╝");
