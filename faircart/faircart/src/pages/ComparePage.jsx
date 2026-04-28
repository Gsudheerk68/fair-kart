import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchProducts, products, shops, getShopById } from "../data/mockData";
import { useApp } from "../context/AppContext";
import RatingStars from "../components/RatingStars";
import ProductCard from "../components/ProductCard";
import { SkeletonRow } from "../components/LoadingSkeleton";
import SearchBar from "../components/SearchBar";

const SORT_OPTIONS = [
  { value: "price", label: "💰 Lowest Price" },
  { value: "rating", label: "⭐ Highest Rating" },
  { value: "distance", label: "📍 Nearest Shop" },
];

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("price");
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useApp();
  const navigate = useNavigate();

  const results = query ? searchProducts(query) : products;

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="max-w-lg">
            <SearchBar placeholder="Search another product…" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {query && (
          <div className="mb-5">
            <h1 className="text-2xl font-black text-gray-900">
              Results for "<span className="text-emerald-600">{query}</span>"
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Found {results.length} product{results.length !== 1 ? "s" : ""} across nearby shops
            </p>
          </div>
        )}

        {!query && (
          <div className="mb-5">
            <h1 className="text-2xl font-black text-gray-900">All Products</h1>
            <p className="text-sm text-gray-500 mt-1">Browse all available products</p>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm">Try searching for rice, milk, oil, dal, or vegetables.</p>
          </div>
        )}

        {results.map(product => (
          <ProductComparisonBlock
            key={product.id}
            product={product}
            sortBy={sortBy}
            setSortBy={setSortBy}
            loading={loading}
            addToCart={addToCart}
            cart={cart}
            navigate={navigate}
          />
        ))}

        {/* Browse all when specific result */}
        {query && results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">You might also need</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter(p => !results.includes(p)).slice(0, 3).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductComparisonBlock({ product, sortBy, setSortBy, loading, addToCart, cart, navigate }) {
  const getEntries = () => {
    return product.shopPrices.map(sp => ({
      ...sp,
      shop: getShopById(sp.shopId),
    })).sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.quality - a.quality;
      if (sortBy === "distance") return (a.shop?.distance || 0) - (b.shop?.distance || 0);
      return 0;
    });
  };

  const entries = getEntries();
  const minPrice = Math.min(...product.shopPrices.map(sp => sp.price));

  const isInCart = (shopId) => cart.some(c => c.productId === product.id && c.shopId === shopId);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      {/* Product header */}
      <div className="flex items-center gap-4 p-5 border-b border-gray-50 bg-gradient-to-r from-emerald-50 to-white">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
          {product.category === "Grains" ? "🌾" : product.category === "Dairy" ? "🥛" : product.category === "Oils" ? "🫙" : product.category === "Pulses" ? "🫘" : product.category === "Vegetables" ? "🥦" : "🌶️"}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-gray-900">{product.name}</h2>
            {product.trending && (
              <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">🔥 Trending</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{product.description}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{product.category}</span>
            <span className="text-emerald-600 font-bold text-sm">From ₹{minPrice}/{product.unit}</span>
            <span className="text-xs text-gray-400">{product.shopPrices.filter(sp => sp.inStock).length} shops in stock</span>
          </div>
        </div>

        {/* Sort */}
        <div className="shrink-0 hidden md:flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 outline-none bg-white font-medium text-gray-700 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile sort */}
      <div className="md:hidden px-4 py-2 border-b border-gray-50 flex gap-2 overflow-x-auto">
        {SORT_OPTIONS.map(o => (
          <button
            key={o.value}
            onClick={() => setSortBy(o.value)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              sortBy === o.value ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-6 px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
        <div className="col-span-2">Shop</div>
        <div>Price</div>
        <div>Quality</div>
        <div>Availability</div>
        <div>Action</div>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="p-4 space-y-3">
          {[1,2,3].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {entries.map((entry, idx) => (
            <ShopPriceRow
              key={entry.shopId}
              entry={entry}
              product={product}
              isLowest={entry.price === minPrice && entry.inStock}
              rank={idx}
              isInCart={isInCart(entry.shopId)}
              onAddCart={() => addToCart({ productId: product.id, shopId: entry.shopId, name: product.name, shopName: entry.shop?.name, price: entry.price, unit: product.unit })}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShopPriceRow({ entry, product, isLowest, rank, isInCart, onAddCart, navigate }) {
  const shop = entry.shop;
  if (!shop) return null;

  return (
    <div className={`px-5 py-4 hover:bg-emerald-50/50 transition-colors ${!entry.inStock ? "opacity-60" : ""} ${isLowest ? "bg-emerald-50/30" : ""}`}>
      {/* Mobile layout */}
      <div className="md:hidden flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg shrink-0">🏪</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/shop/${shop.id}`)} className="font-semibold text-sm text-gray-900 hover:text-emerald-600 transition-colors truncate">{shop.name}</button>
            {isLowest && <span className="shrink-0 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">Best Price</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span>📍 {shop.distance} km</span>
            <RatingStars rating={entry.quality} size="sm" />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-emerald-600">₹{entry.price}<span className="text-xs text-gray-400 font-normal">/{product.unit}</span></p>
          {entry.inStock ? (
            <button onClick={onAddCart} className={`mt-1 text-xs px-3 py-1 rounded-full font-semibold transition-all ${isInCart ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white"}`}>
              {isInCart ? "✓ Added" : "+ Add"}
            </button>
          ) : (
            <span className="text-xs text-red-400 font-medium">Out of stock</span>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-6 items-center">
        <div className="col-span-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg">🏪</div>
          <div>
            <button onClick={() => navigate(`/shop/${shop.id}`)} className="font-semibold text-sm text-gray-900 hover:text-emerald-600 transition-colors text-left">
              {shop.name}
            </button>
            <p className="text-xs text-gray-400 flex items-center gap-1">📍 {shop.distance} km · {shop.address.split(",")[0]}</p>
          </div>
        </div>
        <div>
          <span className="font-black text-emerald-600 text-base">₹{entry.price}</span>
          <span className="text-xs text-gray-400">/{product.unit}</span>
          {isLowest && <span className="ml-2 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">Best</span>}
        </div>
        <div>
          <RatingStars rating={entry.quality} size="sm" />
        </div>
        <div>
          {entry.inStock ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              ✓ In Stock ({entry.quantity} {product.unit})
            </span>
          ) : (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">✕ Out of Stock</span>
          )}
        </div>
        <div>
          {entry.inStock ? (
            <button
              onClick={onAddCart}
              className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all ${isInCart ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white"}`}
            >
              {isInCart ? "✓ Added to Cart" : "+ Add to Cart"}
            </button>
          ) : (
            <button className="text-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed">Unavailable</button>
          )}
        </div>
      </div>
    </div>
  );
}
