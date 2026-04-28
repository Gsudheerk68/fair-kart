# 🛒 FairCart

**FairCart** helps users compare grocery product prices, quality, and availability across nearby local shops based on their location.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 🧠 Features

### User Side
- 📍 **Location Detection** – Auto-detects browser location (falls back to Nellore)
- 🏠 **Homepage** – Search bar, Trending Products, Top Nearby Shops
- ⚖️ **Product Comparison** – Compare prices, quality, availability & distance across shops
- 🏪 **Shop Details** – Full product list, reviews, ratings
- 🔥 **Trending Products** – Most compared items in the area
- ⭐ **Reviews & Ratings** – Rate shops, write reviews, star ratings

### Shop Owner Dashboard
- 🔐 **Login** – Demo: `owner@faircart.com` / `owner123`
- 📊 **Dashboard** – Overview with stats, low-stock alerts
- 📦 **Product Management** – Add, edit, delete products with quantity & units
- 🧾 **Billing Interface** – Simulated billing machine; completing a sale updates inventory

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Sticky top nav with search & cart
│   ├── ProductCard.jsx     # Reusable product card
│   ├── ShopCard.jsx        # Reusable shop card
│   ├── RatingStars.jsx     # Star rating display + interactive
│   ├── SearchBar.jsx       # Search with autocomplete suggestions
│   ├── LoadingSkeleton.jsx # Shimmer loading placeholders
│   └── Toast.jsx           # Bottom notification toast
├── pages/
│   ├── HomePage.jsx        # Landing page
│   ├── ComparePage.jsx     # Product comparison
│   ├── ShopDetailsPage.jsx # Shop info + products + reviews
│   ├── LoginPage.jsx       # Owner login
│   └── DashboardPage.jsx   # Owner dashboard + billing
├── context/
│   └── AppContext.js       # Global state (cart, location, auth)
├── data/
│   └── mockData.js         # All mock data (shops, products, reviews)
├── App.js                  # Routes
└── index.css               # Global styles + Tailwind
```

---

## 🎨 Design

- **Framework**: React 18 + React Router 6
- **Styling**: Tailwind CSS
- **Fonts**: Syne (headings) + DM Sans (body)
- **Color**: Emerald green primary palette
- **Mobile-first** responsive design

---

## 🔮 Future Scope (Design-ready)

- 🍽️ Restaurants
- 🏨 Hotels
- 👗 Fashion Stores

---

## 📝 Notes

- No backend required — all data is mock JSON
- Cart persists during the session (React state)
- Owner dashboard at `/login` → `/dashboard`
- Billing simulation deducts from in-memory inventory

---

*Made with ❤️ in Nellore, Andhra Pradesh*
