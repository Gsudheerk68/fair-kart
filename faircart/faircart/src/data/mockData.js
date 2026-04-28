// ── FairCart Mock Data ──────────────────────────────────────────────────────

export const shops = [
  {
    id: "shop-1",
    name: "Lakshmi General Store",
    owner: "Ravi Kumar",
    address: "12, Market Street, Nellore",
    lat: 14.4426,
    lng: 79.9865,
    distance: 0.3,
    rating: 4.5,
    reviewCount: 128,
    image: null,
    category: "Grocery",
    isOpen: true,
    openTime: "7:00 AM",
    closeTime: "10:00 PM",
    phone: "+91 94400 12345",
    tags: ["Fresh Produce", "Dairy", "Grains"],
  },
  {
    id: "shop-2",
    name: "Sri Balaji Supermarket",
    owner: "Suresh Babu",
    address: "45, Gandhi Nagar, Nellore",
    lat: 14.4450,
    lng: 79.9880,
    distance: 0.7,
    rating: 4.2,
    reviewCount: 96,
    image: null,
    category: "Grocery",
    isOpen: true,
    openTime: "8:00 AM",
    closeTime: "9:00 PM",
    phone: "+91 98765 43210",
    tags: ["Packaged Foods", "Beverages", "Snacks"],
  },
  {
    id: "shop-3",
    name: "Annapurna Provisions",
    owner: "Meena Devi",
    address: "7, Temple Road, Nellore",
    lat: 14.4410,
    lng: 79.9850,
    distance: 1.1,
    rating: 4.7,
    reviewCount: 214,
    image: null,
    category: "Grocery",
    isOpen: false,
    openTime: "6:30 AM",
    closeTime: "8:30 PM",
    phone: "+91 99000 88776",
    tags: ["Organic", "Fresh Produce", "Spices"],
  },
  {
    id: "shop-4",
    name: "City Mart",
    owner: "Prakash Reddy",
    address: "22, Bypass Road, Nellore",
    lat: 14.4470,
    lng: 79.9910,
    distance: 1.5,
    rating: 3.9,
    reviewCount: 67,
    image: null,
    category: "Grocery",
    isOpen: true,
    openTime: "9:00 AM",
    closeTime: "9:00 PM",
    phone: "+91 90000 56789",
    tags: ["Bulk", "Wholesale"],
  },
  {
    id: "shop-5",
    name: "Green Valley Organic",
    owner: "Priya Sharma",
    address: "3, Park Avenue, Nellore",
    lat: 14.4395,
    lng: 79.9840,
    distance: 2.0,
    rating: 4.8,
    reviewCount: 189,
    image: null,
    category: "Grocery",
    isOpen: true,
    openTime: "7:00 AM",
    closeTime: "8:00 PM",
    phone: "+91 88800 11223",
    tags: ["Organic", "Health Foods", "Dairy"],
  },
];

export const products = [
  // Rice
  {
    id: "prod-1",
    name: "Sona Masoori Rice",
    category: "Grains",
    unit: "kg",
    image: null,
    description: "Premium quality Sona Masoori rice, freshly milled.",
    trending: true,
    shopPrices: [
      { shopId: "shop-1", price: 58, quality: 4.4, inStock: true, quantity: 200 },
      { shopId: "shop-2", price: 62, quality: 4.1, inStock: true, quantity: 150 },
      { shopId: "shop-3", price: 55, quality: 4.8, inStock: true, quantity: 300 },
      { shopId: "shop-4", price: 50, quality: 3.8, inStock: false, quantity: 0 },
      { shopId: "shop-5", price: 70, quality: 4.9, inStock: true, quantity: 80 },
    ],
  },
  {
    id: "prod-2",
    name: "Basmati Rice",
    category: "Grains",
    unit: "kg",
    image: null,
    description: "Long grain aromatic Basmati rice.",
    trending: true,
    shopPrices: [
      { shopId: "shop-1", price: 95, quality: 4.2, inStock: true, quantity: 100 },
      { shopId: "shop-2", price: 88, quality: 4.0, inStock: true, quantity: 120 },
      { shopId: "shop-3", price: 105, quality: 4.7, inStock: true, quantity: 60 },
      { shopId: "shop-5", price: 110, quality: 4.8, inStock: true, quantity: 40 },
    ],
  },
  // Milk
  {
    id: "prod-3",
    name: "Full Cream Milk",
    category: "Dairy",
    unit: "litre",
    image: null,
    description: "Fresh full cream cow milk, pasteurised.",
    trending: true,
    shopPrices: [
      { shopId: "shop-1", price: 58, quality: 4.5, inStock: true, quantity: 50 },
      { shopId: "shop-2", price: 60, quality: 4.3, inStock: true, quantity: 40 },
      { shopId: "shop-3", price: 55, quality: 4.9, inStock: true, quantity: 80 },
      { shopId: "shop-5", price: 65, quality: 4.8, inStock: true, quantity: 30 },
    ],
  },
  {
    id: "prod-4",
    name: "Toned Milk",
    category: "Dairy",
    unit: "litre",
    image: null,
    description: "Low-fat toned milk, ideal for daily use.",
    trending: false,
    shopPrices: [
      { shopId: "shop-1", price: 48, quality: 4.2, inStock: true, quantity: 60 },
      { shopId: "shop-2", price: 50, quality: 4.0, inStock: false, quantity: 0 },
      { shopId: "shop-4", price: 45, quality: 3.9, inStock: true, quantity: 100 },
    ],
  },
  // Oil
  {
    id: "prod-5",
    name: "Sunflower Oil",
    category: "Oils",
    unit: "litre",
    image: null,
    description: "Refined sunflower cooking oil.",
    trending: true,
    shopPrices: [
      { shopId: "shop-1", price: 140, quality: 4.3, inStock: true, quantity: 40 },
      { shopId: "shop-2", price: 135, quality: 4.1, inStock: true, quantity: 55 },
      { shopId: "shop-3", price: 145, quality: 4.6, inStock: true, quantity: 30 },
      { shopId: "shop-4", price: 128, quality: 3.7, inStock: true, quantity: 90 },
    ],
  },
  {
    id: "prod-6",
    name: "Cold Pressed Coconut Oil",
    category: "Oils",
    unit: "litre",
    image: null,
    description: "Pure cold-pressed virgin coconut oil.",
    trending: false,
    shopPrices: [
      { shopId: "shop-3", price: 320, quality: 4.8, inStock: true, quantity: 20 },
      { shopId: "shop-5", price: 340, quality: 4.9, inStock: true, quantity: 15 },
      { shopId: "shop-1", price: 299, quality: 4.4, inStock: false, quantity: 0 },
    ],
  },
  // Pulses
  {
    id: "prod-7",
    name: "Toor Dal",
    category: "Pulses",
    unit: "kg",
    image: null,
    description: "Split pigeon peas, best for sambar and dal.",
    trending: true,
    shopPrices: [
      { shopId: "shop-1", price: 145, quality: 4.3, inStock: true, quantity: 80 },
      { shopId: "shop-2", price: 138, quality: 4.1, inStock: true, quantity: 100 },
      { shopId: "shop-3", price: 155, quality: 4.7, inStock: true, quantity: 60 },
      { shopId: "shop-4", price: 130, quality: 3.8, inStock: true, quantity: 150 },
    ],
  },
  {
    id: "prod-8",
    name: "Chana Dal",
    category: "Pulses",
    unit: "kg",
    image: null,
    description: "Split Bengal gram, protein-rich pulse.",
    trending: false,
    shopPrices: [
      { shopId: "shop-1", price: 95, quality: 4.2, inStock: true, quantity: 70 },
      { shopId: "shop-2", price: 90, quality: 4.0, inStock: true, quantity: 90 },
      { shopId: "shop-4", price: 85, quality: 3.7, inStock: true, quantity: 200 },
    ],
  },
  // Vegetables
  {
    id: "prod-9",
    name: "Tomatoes",
    category: "Vegetables",
    unit: "kg",
    image: null,
    description: "Fresh red tomatoes, sourced locally.",
    trending: true,
    shopPrices: [
      { shopId: "shop-1", price: 40, quality: 4.1, inStock: true, quantity: 30 },
      { shopId: "shop-3", price: 35, quality: 4.6, inStock: true, quantity: 50 },
      { shopId: "shop-5", price: 45, quality: 4.8, inStock: true, quantity: 25 },
    ],
  },
  {
    id: "prod-10",
    name: "Onions",
    category: "Vegetables",
    unit: "kg",
    image: null,
    description: "Farm-fresh onions, pungent and flavourful.",
    trending: true,
    shopPrices: [
      { shopId: "shop-1", price: 30, quality: 4.2, inStock: true, quantity: 100 },
      { shopId: "shop-2", price: 28, quality: 4.0, inStock: true, quantity: 120 },
      { shopId: "shop-3", price: 32, quality: 4.5, inStock: true, quantity: 80 },
      { shopId: "shop-4", price: 25, quality: 3.6, inStock: true, quantity: 200 },
    ],
  },
  // Spices
  {
    id: "prod-11",
    name: "Turmeric Powder",
    category: "Spices",
    unit: "grams",
    image: null,
    description: "Pure ground turmeric, vibrant yellow colour.",
    trending: false,
    shopPrices: [
      { shopId: "shop-1", price: 18, quality: 4.3, inStock: true, quantity: 50 },
      { shopId: "shop-3", price: 22, quality: 4.8, inStock: true, quantity: 40 },
      { shopId: "shop-5", price: 25, quality: 4.9, inStock: true, quantity: 30 },
    ],
  },
  {
    id: "prod-12",
    name: "Red Chilli Powder",
    category: "Spices",
    unit: "grams",
    image: null,
    description: "Hot red chilli powder, ideal for curries.",
    trending: false,
    shopPrices: [
      { shopId: "shop-1", price: 22, quality: 4.2, inStock: true, quantity: 60 },
      { shopId: "shop-2", price: 20, quality: 4.0, inStock: true, quantity: 80 },
      { shopId: "shop-3", price: 28, quality: 4.7, inStock: true, quantity: 45 },
      { shopId: "shop-4", price: 18, quality: 3.5, inStock: true, quantity: 150 },
    ],
  },
];

export const reviews = [
  { id: "r-1", shopId: "shop-1", productId: null, userId: "u1", userName: "Ananya T.", rating: 5, comment: "Very fresh produce and fair prices. My go-to store!", date: "2026-04-01" },
  { id: "r-2", shopId: "shop-1", productId: "prod-1", userId: "u2", userName: "Ramesh P.", rating: 4, comment: "Good quality rice, always in stock.", date: "2026-03-28" },
  { id: "r-3", shopId: "shop-2", productId: null, userId: "u3", userName: "Sita L.", rating: 4, comment: "Clean store, decent prices. A bit far from my house.", date: "2026-04-05" },
  { id: "r-4", shopId: "shop-3", productId: "prod-3", userId: "u4", userName: "Vijay R.", rating: 5, comment: "The organic milk here is outstanding! Tastes so pure.", date: "2026-04-08" },
  { id: "r-5", shopId: "shop-3", productId: null, userId: "u5", userName: "Pooja M.", rating: 5, comment: "Annapurna is the best! Always fresh, always quality.", date: "2026-04-10" },
  { id: "r-6", shopId: "shop-5", productId: "prod-6", userId: "u6", userName: "Kiran B.", rating: 5, comment: "Best coconut oil in town, super pure!", date: "2026-04-03" },
  { id: "r-7", shopId: "shop-4", productId: null, userId: "u7", userName: "Deepak N.", rating: 4, comment: "Good for bulk buying, prices are low.", date: "2026-03-20" },
];

export const categories = ["All", "Grains", "Dairy", "Oils", "Pulses", "Vegetables", "Spices"];

export const trendingProducts = products.filter(p => p.trending);

// Helper: get shop by id
export const getShopById = (id) => shops.find(s => s.id === id);

// Helper: get product by id
export const getProductById = (id) => products.find(p => p.id === id);

// Helper: search products
export const searchProducts = (query) => {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
};

// Helper: get shop products
export const getShopProducts = (shopId) => {
  return products
    .filter(p => p.shopPrices.some(sp => sp.shopId === shopId))
    .map(p => ({
      ...p,
      shopPrice: p.shopPrices.find(sp => sp.shopId === shopId),
    }));
};

// Helper: get reviews for shop
export const getShopReviews = (shopId) => reviews.filter(r => r.shopId === shopId);
