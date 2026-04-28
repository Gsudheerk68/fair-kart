import React from "react";
import { useNavigate } from "react-router-dom";
import RatingStars from "./RatingStars";

const tagColors = {
  "Fresh Produce": "bg-green-100 text-green-700",
  "Dairy": "bg-blue-100 text-blue-700",
  "Grains": "bg-amber-100 text-amber-700",
  "Organic": "bg-emerald-100 text-emerald-700",
  "Packaged Foods": "bg-purple-100 text-purple-700",
  "Beverages": "bg-cyan-100 text-cyan-700",
  "Snacks": "bg-orange-100 text-orange-700",
  "Spices": "bg-red-100 text-red-700",
  "Bulk": "bg-gray-100 text-gray-700",
  "Wholesale": "bg-indigo-100 text-indigo-700",
  "Health Foods": "bg-teal-100 text-teal-700",
};

export default function ShopCard({ shop }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={() => navigate(`/shop/${shop.id}`)}
    >
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-20 relative flex items-end px-4 pb-3">
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${shop.isOpen ? "bg-green-400 text-white" : "bg-gray-400 text-white"}`}>
            {shop.isOpen ? "● Open" : "● Closed"}
          </span>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-xl">
          🏪
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">{shop.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          <span>📍</span>{shop.address}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <RatingStars rating={shop.rating} count={shop.reviewCount} />
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">🚶 {shop.distance} km away</span>
          <span className="flex items-center gap-1">🕐 {shop.openTime}–{shop.closeTime}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {shop.tags.slice(0, 3).map(tag => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[tag] || "bg-gray-100 text-gray-600"}`}>
              {tag}
            </span>
          ))}
        </div>

        <button className="mt-3 w-full bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-xl py-2 text-xs font-semibold transition-all duration-200">
          View Products →
        </button>
      </div>
    </div>
  );
}
