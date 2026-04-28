import React from "react";
import { useNavigate } from "react-router-dom";
import RatingStars from "./RatingStars";

const categoryEmoji = {
  Grains: "🌾", Dairy: "🥛", Oils: "🫙", Pulses: "🫘",
  Vegetables: "🥦", Spices: "🌶️", default: "🛒",
};

export default function ProductCard({ product, compact = false }) {
  const navigate = useNavigate();
  const emoji = categoryEmoji[product.category] || categoryEmoji.default;
  const minPrice = Math.min(...product.shopPrices.map(sp => sp.price));
  const avgQuality = (product.shopPrices.reduce((s, sp) => s + sp.quality, 0) / product.shopPrices.length).toFixed(1);
  const availableCount = product.shopPrices.filter(sp => sp.inStock).length;

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => navigate(`/compare?q=${encodeURIComponent(product.name)}`)}
      >
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500">{product.category}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-emerald-600 font-bold text-sm">₹{minPrice}/{product.unit}</p>
          <p className="text-xs text-gray-400">{availableCount} shops</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={() => navigate(`/compare?q=${encodeURIComponent(product.name)}`)}
    >
      {/* Image area */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 h-36 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
        {emoji}
      </div>

      {product.trending && (
        <div className="absolute top-3 left-3 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          🔥 Trending
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.name}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">{product.category}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-emerald-600 font-black text-base">₹{minPrice}<span className="text-xs font-normal text-gray-400">/{product.unit}</span></p>
          </div>
          <div className="text-right">
            <RatingStars rating={parseFloat(avgQuality)} showNumber={true} />
            <p className="text-xs text-gray-400 mt-0.5">{availableCount} shops available</p>
          </div>
        </div>

        <button className="mt-3 w-full bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-xl py-2 text-xs font-semibold transition-all duration-200">
          Compare Prices →
        </button>
      </div>
    </div>
  );
}
