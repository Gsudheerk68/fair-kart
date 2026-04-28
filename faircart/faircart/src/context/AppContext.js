import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [ownerShopId, setOwnerShopId] = useState("shop-1");
  const [reviews, setReviews] = useState([]);
  const [notification, setNotification] = useState(null);

  const detectLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        // fallback to Nellore
        setLocation({ lat: 14.4426, lng: 79.9865 });
        setLocationError("Using default location: Nellore");
        setLocationLoading(false);
      },
      { timeout: 5000 }
    );
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find(
        (c) => c.productId === item.productId && c.shopId === item.shopId
      );
      if (exists) {
        return prev.map((c) =>
          c.productId === item.productId && c.shopId === item.shopId
            ? { ...c, qty: c.qty + 1 }
            : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    showNotification(`Added to cart!`);
  };

  const removeFromCart = (productId, shopId) => {
    setCart((prev) => prev.filter((c) => !(c.productId === productId && c.shopId === shopId)));
  };

  const updateQty = (productId, shopId, qty) => {
    if (qty <= 0) { removeFromCart(productId, shopId); return; }
    setCart((prev) =>
      prev.map((c) =>
        c.productId === productId && c.shopId === shopId ? { ...c, qty } : c
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const ownerLogin = (email, password) => {
    if (email === "owner@faircart.com" && password === "owner123") {
      setIsOwnerLoggedIn(true);
      return true;
    }
    return false;
  };

  const ownerLogout = () => setIsOwnerLoggedIn(false);

  const addReview = (review) => {
    setReviews((prev) => [{ ...review, id: `r-${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...prev]);
    showNotification("Review submitted! Thank you.");
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2800);
  };

  return (
    <AppContext.Provider value={{
      location, locationError, locationLoading, detectLocation,
      cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount,
      isOwnerLoggedIn, ownerShopId, ownerLogin, ownerLogout,
      reviews, addReview,
      notification, showNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
