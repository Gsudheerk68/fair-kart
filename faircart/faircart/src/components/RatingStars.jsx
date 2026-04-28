import React from "react";

export default function RatingStars({ rating, size = "sm", showNumber = true, count }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const sz = size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm";

  return (
    <span className={`inline-flex items-center gap-0.5 ${sz}`}>
      {Array(full).fill(0).map((_, i) => (
        <span key={`f${i}`} className="text-amber-400">★</span>
      ))}
      {half && <span className="text-amber-400">⯨</span>}
      {Array(empty).fill(0).map((_, i) => (
        <span key={`e${i}`} className="text-gray-300">★</span>
      ))}
      {showNumber && (
        <span className="ml-1 text-gray-600 text-xs font-medium">
          {rating.toFixed(1)}{count !== undefined && ` (${count})`}
        </span>
      )}
    </span>
  );
}

export function InteractiveStars({ value, onChange }) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <span className="inline-flex gap-1 text-2xl cursor-pointer">
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={(hovered || value) >= n ? "text-amber-400" : "text-gray-300"}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >★</span>
      ))}
    </span>
  );
}
