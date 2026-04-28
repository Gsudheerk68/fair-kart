import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { ownerLogin } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = ownerLogin(email, password);
      if (ok) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Use owner@faircart.com / owner123");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-3xl font-black text-emerald-600">F</span>
            </div>
            <h1 className="text-2xl font-black text-white">Shop Owner Login</h1>
            <p className="text-emerald-100 text-sm mt-1">Manage your store on FairCart</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {/* Demo hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700">
              <strong>Demo credentials:</strong><br />
              Email: owner@faircart.com<br />
              Password: owner123
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  placeholder="owner@faircart.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In to Dashboard →"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                ← Back to FairCart Home
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Not a shop owner? <button onClick={() => navigate("/")} className="text-emerald-600 font-semibold hover:underline">Browse as a shopper</button>
        </p>
      </div>
    </div>
  );
}
