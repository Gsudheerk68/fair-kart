/**
 * models/TrendingProduct.js
 * Cached trending product scores per locality.
 * Updated periodically by the TrendingService.
 */

const mongoose = require("mongoose");

const trendingProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Locality (city or pincode) where this product is trending
    locality: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Score breakdown (for transparency and debugging)
    scores: {
      purchaseScore: { type: Number, default: 0 },
      ratingScore: { type: Number, default: 0 },
      reviewScore: { type: Number, default: 0 },
      localityScore: { type: Number, default: 0 },
    },

    // Final composite score
    totalScore: {
      type: Number,
      default: 0,
    },

    // Rank within this locality
    rank: {
      type: Number,
      default: 0,
    },

    // Trend direction compared to last update
    trend: {
      type: String,
      enum: ["rising", "stable", "falling"],
      default: "stable",
    },

    // Stats snapshot at time of calculation
    snapshot: {
      purchases: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },

    // When this trending record expires (recalculated daily)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  {
    timestamps: true,
  }
);

// ───── Indexes ─────
trendingProductSchema.index({ locality: 1, totalScore: -1 });
trendingProductSchema.index({ locality: 1, rank: 1 });
trendingProductSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index — auto-deletes expired docs
trendingProductSchema.index({ product: 1, locality: 1 }, { unique: true });

module.exports = mongoose.model("TrendingProduct", trendingProductSchema);
