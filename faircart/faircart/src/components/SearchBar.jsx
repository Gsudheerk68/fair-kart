import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const suggestions = ["Rice", "Milk", "Sunflower Oil", "Toor Dal", "Tomatoes", "Onions", "Turmeric", "Coconut Oil"];

export default function SearchBar({ large = false, placeholder = "Search for rice, milk, oil…" }) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const filtered = suggestions.filter(s => query && s.toLowerCase().includes(query.toLowerCase()));

  const handleSearch = (q = query) => {
    const term = (q || query).trim();
    if (term) {
      navigate(`/compare?q=${encodeURIComponent(term)}`);
      setQuery("");
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className={`flex rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 bg-white/95 backdrop-blur-sm ${large ? "text-base" : "text-sm"}`}>
        <div className="flex items-center px-4 text-gray-400">
          <span className="text-lg">🔍</span>
        </div>
        <input
          className={`flex-1 ${large ? "py-4 text-base" : "py-3 text-sm"} outline-none bg-transparent text-gray-800 placeholder-gray-400 font-medium`}
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => query && setShowSuggestions(true)}
        />
        <button
          onClick={() => handleSearch()}
          className={`bg-emerald-500 hover:bg-emerald-600 text-white ${large ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"} font-bold transition-colors shrink-0`}
        >
          Search
        </button>
      </div>

      {/* Suggestions */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {filtered.map(s => (
            <button
              key={s}
              className="w-full text-left px-5 py-3 hover:bg-emerald-50 text-sm text-gray-700 flex items-center gap-3 transition-colors"
              onMouseDown={() => handleSearch(s)}
            >
              <span className="text-gray-400">🔍</span> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
