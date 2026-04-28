# 🛒 FairCart Backend — v1.0

> Production-ready Node.js + Express + MongoDB backend for the FairCart grocery price comparison platform.

https://github.com/Gsudheerk68/fair-kart/tree/main
---

## 📁 Folder Structure

```
faircart-backend/
│
├── config/
│   └── db.js                    # MongoDB connection
│
├── controllers/
│   ├── authController.js        # Register, login, profile, location
│   ├── shopController.js        # Shop CRUD, nearby search, ranking
│   ├── productController.js     # Product catalog, price comparison, inventory
│   ├── reviewController.js      # Ratings & reviews (products + shops)
│   ├── trendingController.js    # Trending products by locality
│   ├── billingController.js     # Billing machine API integration
│   └── orderController.js       # Order placement and tracking
│
├── models/
│   ├── User.js                  # Users and shop owners
│   ├── Shop.js                  # Grocery shops (with geolocation)
│   ├── Product.js               # Master product catalog
│   ├── ProductPrice.js          # Per-shop pricing and stock
│   ├── Review.js                # Reviews for products and shops
│   ├── Order.js                 # Purchase records
│   ├── BillingLog.js            # Billing machine audit log
│   └── TrendingProduct.js       # Cached trending scores per locality
│
├── routes/
│   ├── authRoutes.js
│   ├── shopRoutes.js
│   ├── productRoutes.js
│   ├── reviewRoutes.js
│   ├── trendingRoutes.js
│   ├── billingRoutes.js
│   └── orderRoutes.js
│
├── middleware/
│   ├── auth.js                  # JWT protect + role-based authorize
│   ├── billingAuth.js           # Billing machine API key authentication
│   ├── errorHandler.js          # Global error handler
│   └── validate.js              # express-validator result handler
│
├── services/
│   ├── rankingService.js        # Shop ranking algorithm
│   └── trendingService.js       # Trending products algorithm
│
├── utils/
│   ├── AppError.js              # Custom operational error class
│   ├── apiResponse.js           # Standardized success/error response helpers
│   ├── asyncHandler.js          # Async error wrapper for controllers
│   └── logger.js                # Winston production logger
│
├── logs/                        # Auto-created by Winston (gitignore this)
├── app.js                       # Express app (middleware + routes)
├── server.js                    # Entry point — DB connection + HTTP server
├── .env.example                 # Environment variable template
├── package.json
├── FairCart.postman_collection.json
└── README.md
```

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI
- npm

### Step 1 — Clone and install

```bash
cd faircart-backend
npm install
```

### Step 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/faircart
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

### Step 3 — Start MongoDB locally

```bash
# macOS/Linux
mongod --dbpath /data/db

# Or use MongoDB Atlas URI in .env — no local install needed
```

### Step 4 — Run the server

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

Server starts at: `http://localhost:5000`

---

## 🔑 Authentication

FairCart uses **JWT Bearer Token** authentication.

1. Register → POST `/api/v1/auth/register`
2. Login → POST `/api/v1/auth/login` — returns `token`
3. Include in every protected request:
   ```
   Authorization: Bearer <token>
   ```

### User Roles
| Role        | Access                                    |
|-------------|-------------------------------------------|
| `user`      | Browse, compare, review, order            |
| `shopOwner` | All user access + manage shop & inventory |
| `admin`     | Full access                               |

---

## 📡 API Endpoints Reference

### Auth
| Method | Endpoint                       | Auth     | Description              |
|--------|-------------------------------|----------|--------------------------|
| POST   | `/api/v1/auth/register`        | Public   | Register user/shopOwner  |
| POST   | `/api/v1/auth/login`           | Public   | Login, returns JWT       |
| GET    | `/api/v1/auth/me`              | JWT      | Get my profile           |
| PUT    | `/api/v1/auth/update-profile`  | JWT      | Update name/phone/avatar |
| PUT    | `/api/v1/auth/update-location` | JWT      | Save user location       |
| PUT    | `/api/v1/auth/change-password` | JWT      | Change password          |
| POST   | `/api/v1/auth/logout`          | JWT      | Logout                   |

### Shops
| Method | Endpoint                                | Auth        | Description                  |
|--------|-----------------------------------------|-------------|------------------------------|
| GET    | `/api/v1/shops/nearby?lat=&lng=&radius=`| Public      | Find nearby shops            |
| GET    | `/api/v1/shops/ranked?city=`            | Public      | Top ranked shops in city     |
| GET    | `/api/v1/shops/:id`                     | Public      | Shop details + reviews       |
| GET    | `/api/v1/shops/owner/my-shop`           | shopOwner   | My shop details              |
| POST   | `/api/v1/shops`                         | shopOwner   | Create my shop               |
| PUT    | `/api/v1/shops/:id`                     | shopOwner   | Update shop info             |
| DELETE | `/api/v1/shops/:id`                     | shopOwner   | Deactivate shop              |
| POST   | `/api/v1/shops/owner/generate-billing-key` | shopOwner| Generate billing API key     |
| POST   | `/api/v1/shops/:id/favourite`           | user        | Toggle favourite shop        |

### Products
| Method | Endpoint                               | Auth        | Description                       |
|--------|----------------------------------------|-------------|-----------------------------------|
| GET    | `/api/v1/products`                     | Public      | Browse all products               |
| GET    | `/api/v1/products/:id`                 | Public      | Product details                   |
| GET    | `/api/v1/products/:id/compare`         | Public      | Compare prices across shops       |
| POST   | `/api/v1/products`                     | shopOwner   | Add product to master catalog     |
| GET    | `/api/v1/products/inventory/list`      | shopOwner   | My shop inventory                 |
| POST   | `/api/v1/products/inventory/add`       | shopOwner   | Add product to my shop            |
| PUT    | `/api/v1/products/inventory/:priceId`  | shopOwner   | Update price/stock                |
| DELETE | `/api/v1/products/inventory/:priceId`  | shopOwner   | Remove product from shop          |

### Reviews
| Method | Endpoint                               | Auth   | Description           |
|--------|----------------------------------------|--------|-----------------------|
| GET    | `/api/v1/reviews/:targetType/:targetId`| Public | Get reviews           |
| POST   | `/api/v1/reviews`                      | JWT    | Post a review         |
| PUT    | `/api/v1/reviews/:id`                  | JWT    | Edit my review        |
| DELETE | `/api/v1/reviews/:id`                  | JWT    | Delete my review      |
| POST   | `/api/v1/reviews/:id/helpful`          | JWT    | Mark review as helpful|

### Trending
| Method | Endpoint                      | Auth   | Description                     |
|--------|-------------------------------|--------|---------------------------------|
| GET    | `/api/v1/trending?locality=`   | Public | Trending products in locality   |
| POST   | `/api/v1/trending/recalculate` | admin  | Trigger recalculation           |

### Orders
| Method | Endpoint                       | Auth        | Description          |
|--------|--------------------------------|-------------|----------------------|
| POST   | `/api/v1/orders`                | user        | Place order          |
| GET    | `/api/v1/orders/my-orders`      | user        | My order history     |
| GET    | `/api/v1/orders/:id`            | user        | Order details        |
| PUT    | `/api/v1/orders/:id/status`     | shopOwner   | Update order status  |

### Billing Machine
| Method | Endpoint                      | Auth (API Key)    | Description         |
|--------|-------------------------------|-------------------|---------------------|
| POST   | `/api/v1/billing/sale`         | X-Billing-Api-Key | Record a sale       |
| POST   | `/api/v1/billing/stock-update` | X-Billing-Api-Key | Update stock/prices |
| GET    | `/api/v1/billing/logs`         | JWT (shopOwner)   | View billing logs   |

---

## 🏆 Ranking Algorithm

```
Shop Score = (priceScore × 0.30) + (ratingScore × 0.30) + (purchaseScore × 0.25) + (availabilityScore × 0.15)
```

- **priceScore** — shops with below-average prices score higher
- **ratingScore** — based on average star rating (0–5 → 0–100)
- **purchaseScore** — normalized total purchases vs. top shop
- **availabilityScore** — % of listed products currently in stock

---

## 📈 Trending Algorithm

```
Trending Score = (localPurchases × 0.40) + (rating × 0.30) + (localReviews × 0.20) + (globalPopularity × 0.10)
```

- All scores are normalized to 0–100 before weighting
- Trending is calculated **per locality** (city/pincode)
- TTL index auto-expires cached records after 24 hours
- Trend direction (rising/stable/falling) is tracked between runs

---

## 🖨️ Billing Machine Integration

Shop owners generate an API key via:
```
POST /api/v1/shops/owner/generate-billing-key
```

The machine uses this key in every request:
```
Header: X-Billing-Api-Key: fc_bm_<key>
```

**Sale flow:**
1. Customer buys product at counter
2. Machine POSTs to `/api/v1/billing/sale` with barcode + quantity
3. Backend decrements stock, logs audit trail, creates order record

**Stock update flow:**
1. New delivery arrives at shop
2. Machine POSTs to `/api/v1/billing/stock-update` with new quantities
3. Backend updates inventory, logs changes

---

## 🛡️ Security Features

- Helmet.js — HTTP security headers
- express-mongo-sanitize — NoSQL injection prevention
- express-rate-limit — 100 req/15min globally, 20 req/15min on auth
- JWT with expiry (7 days default)
- bcrypt with 12 salt rounds
- Role-based access control on all routes
- Body size limit (10kb) to prevent payload attacks
- Billing machine API keys never exposed in responses

---

## 🧪 Testing with Postman

1. Import `FairCart.postman_collection.json` into Postman
2. The collection has **auto-scripts** that save tokens and IDs to variables
3. Run in this order:
   - Register Shop Owner → Login Shop Owner (saves `ownerToken`)
   - Create Shop (saves `shopId`)
   - Generate Billing Key (saves `billingKey`)
   - Add Product to Catalog (saves `productId`)
   - Add Product to Inventory (saves `priceId`)
   - Register User → Login User (saves `userToken`)
   - Run all other endpoints

---

## 🔮 Future Versions

- Hotels, restaurants, bakeries, fashion stores (category-based expansion)
- Firebase push notifications for price drops
- WebSocket for real-time stock updates
- Admin dashboard API
- Delivery partner integration
- Multi-language support

---

*Built with ❤️ for FairCart — helping everyone find the best price.*
