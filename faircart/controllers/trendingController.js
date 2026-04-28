/**
 * controllers/trendingController.js
 * Trending products per locality.
 */

const TrendingProduct = require("../models/TrendingProduct");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const TrendingService = require("../services/trendingService");

// ─────────────────────────────────────────────
// @route   GET /api/v1/trending
// @access  Public
// Query: locality (city/pincode), limit
// ─────────────────────────────────────────────
exports.getTrendingProducts = asyncHandler(async (req, res, next) => {
  const { locality, limit = 10 } = req.query;

  if (!locality) {
    return next(new AppError("Please provide a locality (city or pincode).", 400));
  }

  const localityKey = locality.toLowerCase().trim();

  // Fetch from cache first
  let trending = await TrendingProduct.find({ locality: localityKey })
    .sort({ rank: 1 })
    .limit(parseInt(limit))
    .populate("product", "name category brand unit images averageRating lowestPrice totalPurchases");

  // If no cache, generate on the fly
  if (trending.length === 0) {
    await TrendingService.calculateTrendingForLocality(localityKey);
    trending = await TrendingProduct.find({ locality: localityKey })
      .sort({ rank: 1 })
      .limit(parseInt(limit))
      .populate("product", "name category brand unit images averageRating lowestPrice totalPurchases");
  }

  sendSuccess(res, 200, `Top trending products in "${locality}".`, trending);
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/trending/recalculate
// @access  Private — admin
// ─────────────────────────────────────────────
exports.recalculateTrending = asyncHandler(async (req, res) => {
  const { locality } = req.body;
  await TrendingService.calculateTrendingForLocality(locality?.toLowerCase());
  sendSuccess(res, 200, "Trending scores recalculated.");
});
