// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                  StoreDB — MongoDB Lab Tasks                             ║
// ║                  Database: StoreDB                                       ║
// ╚══════════════════════════════════════════════════════════════════════════╝

use("StoreDB");

// ══════════════════════════════════════════════════════════════════════════
// LAB 1 — SETUP & BASIC QUERIES
// ══════════════════════════════════════════════════════════════════════════

// ── Step 1: Database verification ─────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 1: Current Database In Use");
print("──────────────────────────────────────");
print("Using database: " + db.getName() + "\n");

// ── Step 2: Insert products ───────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 2: Inserting products...");
print("──────────────────────────────────────");
db.products.drop();

printjson(db.products.insertMany([
  { name: "Laptop", category: "Electronics", brand: "Dell", price: 25000 },
  { name: "Phone", category: "Electronics", brand: "Samsung", price: 15000 },
  { name: "Tablet", category: "Electronics", brand: "Apple", price: 20000 },
  { name: "Headphones", category: "Accessories", brand: "Sony", price: 3000 },
  { name: "Smart Watch", category: "Accessories", brand: "Xiaomi", price: 5000 },
  { name: "Camera", category: "Electronics", brand: "Canon", price: 30000 }
]));
print("\n");

// ── Step 3: Insert customers ──────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 3: Inserting customers...");
print("──────────────────────────────────────");
db.customers.drop();

printjson(db.customers.insertMany([
  { name: "Ali", city: "Cairo", age: 30 },
  { name: "Sara", city: "Alexandria", age: 22 },
  { name: "Omar", city: "Giza", age: 27 },
  { name: "Nour", city: "Cairo", age: 19 },
  { name: "Asmaa", city: "Giza", age: 25 },
  { name: "Khaled", city: "Cairo", age: 35 },
  { name: "Mona", city: "Alexandria", age: 23 }
]));
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 4: Display all products
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 4: Display all products");
print("──────────────────────────────────────");
printjson(db.products.find().toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 5: Display all customers
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 5: Display all customers");
print("──────────────────────────────────────");
printjson(db.customers.find().toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 6: Display products with price = 25000
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 6: Products with price = 25000");
print("──────────────────────────────────────");
printjson(db.products.find({ price: 25000 }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 7: Display customers who live in Cairo
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 7: Customers in Cairo");
print("──────────────────────────────────────");
printjson(db.customers.find({ city: "Cairo" }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 8: Display only product names (with _id)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 8: Product names only (with _id)");
print("──────────────────────────────────────");
printjson(db.products.find({}, { name: 1 }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 9: Display product names only WITHOUT _id
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 9: Product names only (no _id)");
print("──────────────────────────────────────");
printjson(db.products.find({}, { name: 1, _id: 0 }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 10: Display all customer data EXCEPT age
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 10: All customer data except age");
print("──────────────────────────────────────");
printjson(db.customers.find({}, { age: 0 }).toArray());
print("\n");


// ══════════════════════════════════════════════════════════════════════════
// LAB 2 — ORDERS & COMPARISON / LOGICAL OPERATORS
// ══════════════════════════════════════════════════════════════════════════

// ── Step 11: Insert orders ─────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 11: Inserting orders...");
print("──────────────────────────────────────");
db.orders.drop();

printjson(db.orders.insertMany([
  { customer: "Ali", product: "Laptop", amount: 25000, date: new Date("2024-01-10") },
  { customer: "Sara", product: "Phone", amount: 15000, date: new Date("2024-01-15") },
  { customer: "Omar", product: "Headphones", amount: 3000, date: new Date("2024-02-01") },
  { customer: "Nour", product: "Tablet", amount: 20000, date: new Date("2024-02-10") },
  { customer: "Asmaa", product: "Smart Watch", amount: 500, date: new Date("2024-03-05") },
  { customer: "Khaled", product: "Camera", amount: 30000, date: new Date("2024-03-12") },
  { customer: "Ali", product: "Phone", amount: 15000, date: new Date("2024-04-01") },
  { customer: "Mona", product: "Headphones", amount: 3000, date: new Date("2024-04-20") }
]));
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 12: Orders where amount > 1000
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 12: Orders where amount > 1000");
print("──────────────────────────────────────");
printjson(db.orders.find({ amount: { $gt: 1000 } }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 13: Products where price < 25000
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 13: Products where price < 25000");
print("──────────────────────────────────────");
printjson(db.products.find({ price: { $lt: 25000 } }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 14: Customers where age >= 25
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 14: Customers where age >= 25");
print("──────────────────────────────────────");
printjson(db.customers.find({ age: { $gte: 25 } }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 15: Orders where customer = "Ali" AND amount > 1000
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 15: Orders where customer = Ali AND amount > 1000");
print("──────────────────────────────────────");
printjson(db.orders.find({
  $and: [
    { customer: "Ali" },
    { amount: { $gt: 1000 } }
  ]
}).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 16: Customers where city = "Cairo" OR age < 25
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 16: Customers where city = Cairo OR age < 25");
print("──────────────────────────────────────");
printjson(db.customers.find({
  $or: [
    { city: "Cairo" },
    { age: { $lt: 25 } }
  ]
}).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 17: Products where price = 25000 OR price = 3000
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 17: Products where price = 25000 OR price = 3000");
print("──────────────────────────────────────");
printjson(db.products.find({
  $or: [
    { price: 25000 },
    { price: 3000 }
  ]
}).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 18: Customers where city is Cairo or Giza  ($in)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 18: Customers in Cairo or Giza ($in)");
print("──────────────────────────────────────");
printjson(db.customers.find({ city: { $in: ["Cairo", "Giza"] } }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 19: Products where price is NOT 25000  ($ne)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 19: Products where price != 25000");
print("──────────────────────────────────────");
printjson(db.products.find({ price: { $ne: 25000 } }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 20: Customers where city is NOT Cairo  ($ne)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 20: Customers where city != Cairo");
print("──────────────────────────────────────");
printjson(db.customers.find({ city: { $ne: "Cairo" } }).toArray());
print("\n");


// ══════════════════════════════════════════════════════════════════════════
// LAB 3 — SORT, LIMIT, SKIP, UPDATE, DELETE
// ══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// Step 21: Sort orders by amount ASCENDING
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 21: Orders sorted by amount ASC");
print("──────────────────────────────────────");
printjson(db.orders.find({}, { customer: 1, product: 1, amount: 1, _id: 0 })
  .sort({ amount: 1 })
  .toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 22: Sort orders by amount DESCENDING
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 22: Orders sorted by amount DESC");
print("──────────────────────────────────────");
printjson(db.orders.find({}, { customer: 1, product: 1, amount: 1, _id: 0 })
  .sort({ amount: -1 })
  .toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 23: Display only the FIRST 2 orders
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 23: First 2 orders (limit 2)");
print("──────────────────────────────────────");
printjson(db.orders.find({}, { customer: 1, product: 1, amount: 1, _id: 0 })
  .limit(2)
  .toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 24: Top 2 HIGHEST orders (sort DESC + limit 2)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 24: Top 2 highest orders");
print("──────────────────────────────────────");
printjson(db.orders.find({}, { customer: 1, product: 1, amount: 1, _id: 0 })
  .sort({ amount: -1 })
  .limit(2)
  .toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 25: Skip the first order, display the rest
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 25: Skip first order, show the rest");
print("──────────────────────────────────────");
printjson(db.orders.find({}, { customer: 1, product: 1, amount: 1, _id: 0 })
  .skip(1)
  .toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 26: Skip first 2, display the next 2
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 26: Skip 2, display next 2");
print("──────────────────────────────────────");
printjson(db.orders.find({}, { customer: 1, product: 1, amount: 1, _id: 0 })
  .skip(2)
  .limit(2)
  .toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 27: Update Asmaa's order amount to 1000
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 27: Update Asmaa's order amount to 1000");
print("──────────────────────────────────────");
printjson(db.orders.updateOne(
  { customer: "Asmaa" },
  { $set: { amount: 1000 } }
));
print("   Asmaa's order configuration verification:");
printjson(db.orders.find({ customer: "Asmaa" }, { customer: 1, amount: 1, _id: 0 }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 28: Add "status" = "done" to ALL orders
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 28: Add status = done to all orders");
print("──────────────────────────────────────");
printjson(db.orders.updateMany(
  {},
  { $set: { status: "done" } }
));
print("   Orders with updated status field:");
printjson(db.orders.find({}, { customer: 1, amount: 1, status: 1, _id: 0 }).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 29: Delete one order where customer = "Omar"
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 29: Delete Omar's order");
print("──────────────────────────────────────");
printjson(db.orders.deleteOne({ customer: "Omar" }));
print("   Remaining active orders:");
printjson(db.orders.find({}, { customer: 1, product: 1, amount: 1, _id: 0 }).toArray());
print("\n");


// ══════════════════════════════════════════════════════════════════════════
// LAB 4 — AGGREGATION PIPELINES
// ══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// Step 30: Orders where amount > 1000 using aggregation ($match)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 30: Aggregation — Orders where amount > 1000");
print("──────────────────────────────────────");
printjson(db.orders.aggregate([
  { $match: { amount: { $gt: 1000 } } }
]).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 31: Total amount for each customer ($group + $sum)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 31: Aggregation — Total amount per customer");
print("──────────────────────────────────────");
printjson(db.orders.aggregate([
  {
    $group: {
      _id: "$customer",
      totalAmount: { $sum: "$amount" }
    }
  }
]).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 32: Total amount per customer, only for orders > 1000
//         ($match first, then $group)
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 32: Aggregation — Total per customer (orders > 1000 only)");
print("──────────────────────────────────────");
printjson(db.orders.aggregate([
  { $match: { amount: { $gt: 1000 } } },
  {
    $group: {
      _id: "$customer",
      totalAmount: { $sum: "$amount" }
    }
  }
]).toArray());
print("\n");


// ══════════════════════════════════════════════════════════════════════════
// LAB 5 — AGGREGATION WITH SORT, LIMIT, SKIP
// ══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// Step 33: Total per customer, sorted DESC
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 33: Aggregation — Total per customer sorted DESC");
print("──────────────────────────────────────");
printjson(db.orders.aggregate([
  {
    $group: {
      _id: "$customer",
      totalAmount: { $sum: "$amount" }
    }
  },
  { $sort: { totalAmount: -1 } }
]).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 34: $limit — Top 2 customers with highest total amount
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 34: Aggregation — Top 2 customers by total amount");
print("──────────────────────────────────────");
printjson(db.orders.aggregate([
  {
    $group: {
      _id: "$customer",
      totalAmount: { $sum: "$amount" }
    }
  },
  { $sort: { totalAmount: -1 } },
  { $limit: 2 }
]).toArray());
print("\n");

// ─────────────────────────────────────────────────────────────────────────
// Step 35: $skip — Skip #1 customer, display next 2
// ─────────────────────────────────────────────────────────────────────────
print("──────────────────────────────────────");
print("Step 35: Aggregation — Skip top customer, show next 2");
print("──────────────────────────────────────");
printjson(db.orders.aggregate([
  {
    $group: {
      _id: "$customer",
      totalAmount: { $sum: "$amount" }
    }
  },
  { $sort: { totalAmount: -1 } },
  { $skip: 1 },
  { $limit: 2 }
]).toArray());

print("\n");
print("╔══════════════════════════════════════════════════════════╗");
print("║            StoreDB Lab Tasks — ALL COMPLETE              ║");
print("╚══════════════════════════════════════════════════════════╝");