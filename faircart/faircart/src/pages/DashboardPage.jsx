import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getShopById, getShopProducts } from "../data/mockData";
import RatingStars from "../components/RatingStars";

const UNITS = ["kg", "grams", "litres", "millilitres", "pieces", "dozen", "packet"];

const initialProducts = () => getShopProducts("shop-1").map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.shopPrice.price,
  quantity: p.shopPrice.quantity,
  unit: p.unit,
  inStock: p.shopPrice.inStock,
}));

export default function DashboardPage() {
  const { isOwnerLoggedIn, ownerShopId, ownerLogout, showNotification } = useApp();
  const navigate = useNavigate();
  const shop = getShopById(ownerShopId);

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState(initialProducts());
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Grains", price: "", quantity: "", unit: "kg", inStock: true });

  // Billing
  const [billingItems, setBillingItems] = useState([]);
  const [billingSearch, setBillingSearch] = useState("");
  const [customerName, setCustomerName] = useState("");

  if (!isOwnerLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-5">Please log in as a shop owner.</p>
          <button onClick={() => navigate("/login")} className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors">
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  // Helpers
  const updateProduct = (id, field, value) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveEdit = (id) => {
    setEditingId(null);
    showNotification("Product updated successfully!");
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showNotification("Product removed.");
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) return;
    setProducts(prev => [...prev, { ...newProduct, id: `new-${Date.now()}`, price: +newProduct.price, quantity: +newProduct.quantity }]);
    setNewProduct({ name: "", category: "Grains", price: "", quantity: "", unit: "kg", inStock: true });
    setShowAddForm(false);
    showNotification("Product added successfully!");
  };

  // Billing helpers
  const billingFiltered = products.filter(p => p.inStock && p.name.toLowerCase().includes(billingSearch.toLowerCase()));

  const addToBill = (product) => {
    setBillingItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeBillItem = (id) => setBillingItems(prev => prev.filter(i => i.id !== id));
  const updateBillQty = (id, qty) => {
    if (qty <= 0) { removeBillItem(id); return; }
    setBillingItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const billTotal = billingItems.reduce((s, i) => s + i.price * i.qty, 0);

  const completeSale = () => {
    // Deduct from inventory
    setProducts(prev => prev.map(p => {
      const item = billingItems.find(i => i.id === p.id);
      if (!item) return p;
      const newQty = Math.max(0, p.quantity - item.qty);
      return { ...p, quantity: newQty, inStock: newQty > 0 };
    }));
    setBillingItems([]);
    setCustomerName("");
    showNotification(`Sale of ₹${billTotal.toFixed(2)} completed!`);
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "products", label: "Products", icon: "📦" },
    { key: "billing", label: "Billing", icon: "🧾" },
  ];

  const totalStock = products.reduce((s, p) => s + p.quantity, 0);
  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const lowStockItems = products.filter(p => p.quantity < 10 && p.inStock);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-xl shadow-md">
                🏪
              </div>
              <div>
                <h1 className="text-xl font-black">{shop?.name}</h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  📍 {shop?.address}
                  <RatingStars rating={shop?.rating || 4.5} size="sm" />
                </p>
              </div>
            </div>
            <button
              onClick={() => { ownerLogout(); navigate("/"); }}
              className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
            >
              Logout →
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/90 border-b border-gray-700 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.key ? "border-emerald-400 text-emerald-400" : "border-transparent text-gray-400 hover:text-white"}`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: "📦", label: "Total Products", value: products.length, color: "from-blue-500 to-blue-600" },
                { icon: "✅", label: "In Stock", value: products.filter(p => p.inStock).length, color: "from-emerald-500 to-emerald-600" },
                { icon: "🔢", label: "Total Stock Units", value: totalStock.toLocaleString(), color: "from-purple-500 to-purple-600" },
                { icon: "💰", label: "Inventory Value", value: `₹${totalValue.toLocaleString()}`, color: "from-amber-500 to-amber-600" },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 shadow-sm`}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-white/80 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {lowStockItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">⚠️ Low Stock Alert</h3>
                <div className="space-y-2">
                  {lowStockItems.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-amber-700 font-medium">{p.name}</span>
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        Only {p.quantity} {p.unit} left!
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button onClick={() => { setActiveTab("products"); setShowAddForm(true); }} className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100">
                  <span className="text-2xl">➕</span>
                  <span className="text-xs font-semibold text-emerald-700">Add Product</span>
                </button>
                <button onClick={() => setActiveTab("billing")} className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100">
                  <span className="text-2xl">🧾</span>
                  <span className="text-xs font-semibold text-blue-700">New Bill</span>
                </button>
                <button onClick={() => navigate(`/shop/${ownerShopId}`)} className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100">
                  <span className="text-2xl">👁️</span>
                  <span className="text-xs font-semibold text-purple-700">View My Shop</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Product Inventory</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                {showAddForm ? "✕ Cancel" : "＋ Add Product"}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 mb-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">➕ New Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Product name*" value={newProduct.name} onChange={e => setNewProduct(p => ({...p, name: e.target.value}))} />
                  <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" value={newProduct.category} onChange={e => setNewProduct(p => ({...p, category: e.target.value}))}>
                    {["Grains","Dairy","Oils","Pulses","Vegetables","Spices"].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Price (₹)*" type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({...p, price: e.target.value}))} />
                  <div className="flex gap-2">
                    <input className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Quantity*" type="number" value={newProduct.quantity} onChange={e => setNewProduct(p => ({...p, quantity: e.target.value}))} />
                    <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" value={newProduct.unit} onChange={e => setNewProduct(p => ({...p, unit: e.target.value}))}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addProduct} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">Save Product</button>
                  <button onClick={() => setShowAddForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Product table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="hidden md:grid grid-cols-7 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <div className="col-span-2">Product</div>
                <div>Category</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Unit</div>
                <div>Actions</div>
              </div>

              <div className="divide-y divide-gray-50">
                {products.map(product => (
                  <div key={product.id} className={`p-4 hover:bg-gray-50/50 transition-colors ${!product.inStock ? "opacity-60" : ""}`}>
                    {editingId === product.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
                        <div className="md:col-span-2">
                          <input className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 text-sm outline-none" value={product.name} onChange={e => updateProduct(product.id, "name", e.target.value)} />
                        </div>
                        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" value={product.category} onChange={e => updateProduct(product.id, "category", e.target.value)}>
                          {["Grains","Dairy","Oils","Pulses","Vegetables","Spices"].map(c => <option key={c}>{c}</option>)}
                        </select>
                        <input className="border border-emerald-300 rounded-lg px-3 py-1.5 text-sm outline-none" type="number" value={product.price} onChange={e => updateProduct(product.id, "price", +e.target.value)} />
                        <input className="border border-emerald-300 rounded-lg px-3 py-1.5 text-sm outline-none" type="number" value={product.quantity} onChange={e => updateProduct(product.id, "quantity", +e.target.value)} />
                        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" value={product.unit} onChange={e => updateProduct(product.id, "unit", e.target.value)}>
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(product.id)} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Mobile */}
                        <div className="flex md:hidden items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {product.inStock ? "In Stock" : "Out"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{product.category} · {product.quantity} {product.unit} · ₹{product.price}/{product.unit}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingId(product.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg text-sm">✏️</button>
                            <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                          </div>
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:grid grid-cols-7 items-center">
                          <div className="col-span-2 font-semibold text-sm text-gray-900">{product.name}</div>
                          <div><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category}</span></div>
                          <div className="font-bold text-emerald-600 text-sm">₹{product.price}</div>
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${product.quantity < 10 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              {product.quantity} {product.quantity < 10 ? "⚠️" : ""}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">{product.unit}</div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingId(product.id)} className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">Edit</button>
                            <button onClick={() => deleteProduct(product.id)} className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">Delete</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BILLING TAB ── */}
        {activeTab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Product selector */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">🛒 Select Products</h3>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  placeholder="Search products to add…"
                  value={billingSearch}
                  onChange={e => setBillingSearch(e.target.value)}
                />
              </div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {billingFiltered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToBill(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-base shrink-0">🛒</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.quantity} {p.unit} in stock</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-emerald-600 text-sm">₹{p.price}/{p.unit}</p>
                      <p className="text-xs text-gray-400 group-hover:text-emerald-500 transition-colors">+ Add</p>
                    </div>
                  </button>
                ))}
                {billingFiltered.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">No products found</div>
                )}
              </div>
            </div>

            {/* Bill */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Bill header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-base">🧾 Bill</h3>
                      <p className="text-gray-400 text-xs">{shop?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-sm font-semibold">{new Date().toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <input
                    className="mt-3 w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:bg-white/20"
                    placeholder="Customer name (optional)"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>

                {/* Bill items */}
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {billingItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <div className="text-3xl mb-2">🛒</div>
                      Add products to generate bill
                    </div>
                  ) : (
                    billingItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">₹{item.price}/{item.unit}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => updateBillQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm flex items-center justify-center font-bold transition-colors">−</button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                          <button onClick={() => updateBillQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm flex items-center justify-center font-bold transition-colors">+</button>
                        </div>
                        <div className="text-right shrink-0 w-16">
                          <p className="text-xs font-bold text-gray-900">₹{(item.price * item.qty).toFixed(0)}</p>
                          <button onClick={() => removeBillItem(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">remove</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bill total */}
                {billingItems.length > 0 && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Subtotal ({billingItems.reduce((s,i)=>s+i.qty,0)} items)</span>
                      <span className="font-semibold">₹{billTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-base mt-2 pt-2 border-t border-dashed border-gray-200">
                      <span>Total</span>
                      <span className="text-emerald-600">₹{billTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={completeSale}
                      className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
                    >
                      ✓ Complete Sale
                    </button>
                    <button onClick={() => setBillingItems([])} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-xs font-semibold transition-colors">
                      Clear Bill
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
