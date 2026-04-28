import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { cartCount, isOwnerLoggedIn, ownerLogout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const navigate = useNavigate();
  const loc = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/compare?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ("");
      setMenuOpen(false);
    }
  };

  const isHome = loc.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-emerald-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-base font-black">F</span>
          </div>
          <span className="font-black text-xl text-gray-900 tracking-tight">
            Fair<span className="text-emerald-500">Cart</span>
          </span>
        </Link>

        {/* Desktop Search */}
        {!isHome && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="flex w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <input
                className="flex-1 px-4 py-2 text-sm outline-none bg-gray-50"
                placeholder="Search rice, milk, oil…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 transition-colors text-sm font-semibold">
                Search
              </button>
            </div>
          </form>
        )}

        <div className="flex-1" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all">Home</Link>
          <Link to="/compare" className="text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all">Compare</Link>
          {isOwnerLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all">Dashboard</Link>
              <button onClick={ownerLogout} className="text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">Logout</button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all">Owner Login</Link>
          )}
          <Link to="/compare" className="relative bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                {cartCount}
              </span>
            )}
            <span>Cart</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-2 shadow-lg">
          <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden border border-gray-200 mb-2">
            <input
              className="flex-1 px-4 py-2 text-sm outline-none bg-gray-50"
              placeholder="Search products…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <button className="bg-emerald-500 text-white px-4 text-sm font-semibold">Search</button>
          </form>
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2 text-gray-700">🏠 Home</Link>
          <Link to="/compare" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2 text-gray-700">⚖️ Compare</Link>
          {isOwnerLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2 text-gray-700">📊 Dashboard</Link>
              <button onClick={() => { ownerLogout(); setMenuOpen(false); }} className="text-sm font-medium py-2 text-red-500 text-left">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2 text-gray-700">🔐 Owner Login</Link>
          )}
          <Link to="/compare" onClick={() => setMenuOpen(false)} className="text-sm font-semibold py-2 text-emerald-600">🛒 Cart {cartCount > 0 && `(${cartCount})`}</Link>
        </div>
      )}
    </nav>
  );
}
