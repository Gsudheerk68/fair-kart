// ── FairCart Service Utilities ─────────────────────────────────────────────

/**
 * Calculate distance between two lat/lng coords (Haversine formula)
 */
export function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

/**
 * Format price as Indian Rupees string
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Sort shop-price entries by the given criterion
 */
export function sortShopPrices(entries, sortBy) {
  return [...entries].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "rating") return b.quality - a.quality;
    if (sortBy === "distance") return (a.shop?.distance ?? 99) - (b.shop?.distance ?? 99);
    return 0;
  });
}

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category) {
  const map = {
    Grains: "🌾",
    Dairy: "🥛",
    Oils: "🫙",
    Pulses: "🫘",
    Vegetables: "🥦",
    Spices: "🌶️",
  };
  return map[category] || "🛒";
}
