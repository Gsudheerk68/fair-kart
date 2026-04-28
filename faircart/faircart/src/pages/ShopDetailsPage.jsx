import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShopById, getShopProducts, getShopReviews } from "../data/mockData";
import { useApp } from "../context/AppContext";
import RatingStars, { InteractiveStars } from "../components/RatingStars";

export default function ShopDetailsPage() {
  const { shopId } = useParams();
  const shop = getShopById(shopId);
  const products = getShopProducts(shopId);
  const baseReviews = getShopReviews(shopId);
  const { reviews: userReviews, addReview, addToCart, cart } = useApp();
  const navigate = useNavigate();

  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "", userName: "" });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  if (!shop) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🏪</div>
        <h2 className="text-xl font-bold text-gray-700">Shop not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-emerald-600 underline">← Back to Home</button>
      </div>
    </div>
  );

  const allReviews = [
    ...baseReviews,
    ...userReviews.filter(r => r.shopId === shopId),
  ];

  const handleSubmitReview = () => {
    if (!reviewForm.rating || !reviewForm.comment.trim() || !reviewForm.userName.trim()) return;
    addReview({ shopId, ...reviewForm });
    setReviewForm({ rating: 0, comment: "", userName: "" });
    setShowForm(false);
    setActiveTab("reviews");
  };

  const isInCart = (productId) => cart.some(c => c.productId === productId && c.shopId === shopId);

  const categoryEmoji = { Grains: "🌾", Dairy: "🥛", Oils: "🫙", Pulses: "🫘", Vegetables: "🥦", Spices: "🌶️" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-6">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
            ← Back
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl shrink-0">
              🏪
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{shop.name}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${shop.isOpen ? "bg-green-400 text-white" : "bg-gray-400 text-white"}`}>
                  {shop.isOpen ? "● Open Now" : "● Closed"}
                </span>
              </div>
              <p className="text-emerald-100 text-sm flex items-center gap-1">📍 {shop.address}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <RatingStars rating={shop.rating} count={shop.reviewCount} size="md" />
                <span className="text-emerald-100 text-sm flex items-center gap-1">🚶 {shop.distance} km away</span>
                <span className="text-emerald-100 text-sm flex items-center gap-1">📞 {shop.phone}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {shop.tags.map(tag => (
              <span key={tag} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full border border-white/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-2">🕐 Hours: <strong>{shop.openTime} – {shop.closeTime}</strong></span>
          <span className="flex items-center gap-2">👤 Owner: <strong>{shop.owner}</strong></span>
          <span className="flex items-center gap-2">📦 {products.length} products listed</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
          {[
            { key: "products", label: `Products (${products.length})` },
            { key: "reviews", label: `Reviews (${allReviews.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-white shadow-sm text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {activeTab === "products" && (
          <div className="space-y-3">
            {products.map(product => {
              const sp = product.shopPrice;
              const emoji = categoryEmoji[product.category] || "🛒";
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl shrink-0">{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{product.category}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <RatingStars rating={sp.quality} size="sm" />
                      {sp.inStock ? (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          In Stock · {sp.quantity} {product.unit}
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-emerald-600 text-base">₹{sp.price}<span className="text-xs text-gray-400 font-normal">/{product.unit}</span></p>
                    {sp.inStock ? (
                      <button
                        onClick={() => addToCart({ productId: product.id, shopId: shopId, name: product.name, shopName: shop.name, price: sp.price, unit: product.unit })}
                        className={`mt-1 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${isInCart(product.id) ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white"}`}
                      >
                        {isInCart(product.id) ? "✓ In Cart" : "+ Add"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "reviews" && (
          <div>
            {/* Rating summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-black text-gray-900">{shop.rating.toFixed(1)}</div>
                <RatingStars rating={shop.rating} size="lg" showNumber={false} />
                <p className="text-xs text-gray-400 mt-1">{shop.reviewCount} reviews</p>
              </div>
              <div className="flex-1">
                {[5,4,3,2,1].map(star => {
                  const pct = star === 5 ? 55 : star === 4 ? 25 : star === 3 ? 12 : star === 2 ? 5 : 3;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 w-3">{star}</span>
                      <span className="text-amber-400 text-xs">★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-6">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add review */}
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="w-full border-2 border-dashed border-emerald-200 hover:border-emerald-400 text-emerald-600 hover:bg-emerald-50 py-4 rounded-2xl text-sm font-semibold transition-all mb-4">
                + Write a Review
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Leave a Review</h3>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-emerald-400"
                  placeholder="Your name"
                  value={reviewForm.userName}
                  onChange={e => setReviewForm(f => ({...f, userName: e.target.value}))}
                />
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Your Rating</p>
                  <InteractiveStars value={reviewForm.rating} onChange={r => setReviewForm(f => ({...f, rating: r}))} />
                </div>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400 resize-none"
                  rows={3}
                  placeholder="Share your experience…"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                />
                <div className="flex gap-2">
                  <button onClick={handleSubmitReview} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                    Submit Review
                  </button>
                  <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reviews list */}
            <div className="space-y-3">
              {allReviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700">
                        {r.userName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{r.userName}</p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                      </div>
                    </div>
                    <RatingStars rating={r.rating} size="sm" showNumber={false} />
                  </div>
                  <p className="text-sm text-gray-700">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
