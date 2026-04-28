import React from "react";
import { useApp } from "../context/AppContext";

export default function Toast() {
  const { notification } = useApp();
  if (!notification) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-fade-up flex items-center gap-2">
      <span className="text-emerald-400">✓</span>
      {notification}
    </div>
  );
}
