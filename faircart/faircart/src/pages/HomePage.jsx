import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { trendingProducts, shops, categories, products } from "../data/mockData";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import ShopCard from "../components/ShopCard";
import LoadingGrid from "../components/LoadingSkeleton";

export default function HomePage() {
  const { location, detectLocation, locationError } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    detectLocation();
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filteredProducts = activeCategory === "All"
    ? trendingProducts
    : products.filter(p => p.category === activeCategory);

  const topShops = [...shops].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-10 left-1/4 w-16 h-16 bg-emerald-300/20 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-20">
          {/* Location bar */}
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-white/20 text-white/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
              📍 {location ? "Nellore, Andhra Pradesh" : "Detecting location…"}
              {locationError && <span className="text-yellow-200 text-xs">(approximate)</span>}
            </span>
            {!location && (
              <button onClick={detectLocation} className="text-xs text-white/80 underline underline-offset-2">
                Allow location
              </button>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
            Compare Grocery Prices<br />
            <span className="text-emerald-100">Across Nearby Shops</span>
          </h1>
          <p className="text-emerald-100 text-base md:text-lg mb-8 max-w-xl">
            Find the best prices, freshest produce, and trusted shops in your neighbourhood — all in one place.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl">
            <SearchBar large placeholder="What are you looking for? Rice, milk, oil…" />
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["Sona Masoori Rice", "Full Cream Milk", "Sunflower Oil", "Toor Dal", "Tomatoes"].map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/compare?q=${encodeURIComponent(tag)}`)}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all border border-white/20 font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-50" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </div>

      {/* Stats bar */}
      <div className="max-w-6xl mx-auto px-4 -mt-1">
        <div className="grid grid-cols-3 gap-3 py-6">
          {[
            { emoji: "🏪", value: "5+", label: "Nearby Shops" },
            { emoji: "📦", value: "12+", label: "Products Listed" },
            { emoji: "💰", value: "₹0", label: "No Hidden Fees" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="font-black text-gray-900 text-lg">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Products */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">🔥 Trending in Your Area</h2>
            <p className="text-sm text-gray-500">Most compared products near you</p>
          </div>
          <button onClick={() => navigate("/compare")} className="text-emerald-600 text-sm font-semibold hover:underline">
            See all →
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingGrid count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(filteredProducts.length > 0 ? filteredProducts : products.filter(p => p.category === activeCategory)).slice(0, 6).map(product => (
              <div key={product.id} className="relative">
                {product.trending && (
                  <div className="absolute top-3 left-3 z-10 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    🔥 Trending
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Nearby Shops */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">⭐ Top Nearby Shops</h2>
            <p className="text-sm text-gray-500">Highly rated stores within 2 km</p>
          </div>
        </div>

        {loading ? (
          <LoadingGrid count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topShops.map(shop => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* Future scope banner */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Coming Soon</span>
            <h3 className="text-2xl font-black text-white mt-1 mb-2">More Than Just Groceries</h3>
            <p className="text-gray-400 text-sm mb-5 max-w-lg">
              FairCart is expanding. Soon you'll be able to compare prices at restaurants, hotels, and fashion stores near you.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "🍽️", label: "Restaurants" },
                { icon: "🏨", label: "Hotels" },
                { icon: "👗", label: "Fashion Stores" },
              ].map(item => (
                <div key={item.label} className="bg-white/10 border border-white/10 text-white/80 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Soon</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">F</span>
          </div>
          <span className="font-bold text-gray-700">FairCart</span>
        </div>
        <p>Connecting you to the best prices in your neighbourhood.</p>
        <p className="mt-1 text-xs text-gray-300">© 2026 FairCart · Made with ❤️ in Nellore</p>
      </footer>
    </div>
  );
}
