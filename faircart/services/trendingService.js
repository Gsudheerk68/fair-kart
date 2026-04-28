/**
 * services/trendingService.js
 * Trending products algorithm per locality.
 *
 * Score formula:
 *   trendingScore = (purchases × 0.40) + (rating × 0.30) + (reviews × 0.20) + (localityPopularity × 0.10)
 */

const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const TrendingProduct = require("../models/TrendingProduct");
const Shop = require("../models/Shop");
const ProductPrice = require("../models/ProductPrice");
const logger = require("../utils/logger");

const WEIGHTS = {
  purchase: parseFloat(process.env.TRENDING_PURCHASE_WEIGHT) || 0.40,
  rating:   parseFloat(process.env.TRENDING_RATING_WEIGHT)   || 0.30,
  review:   parseFloat(process.env.TRENDING_REVIEW_WEIGHT)   || 0.20,
  locality: parseFloat(process.env.TRENDING_LOCALITY_WEIGHT) || 0.10,
};

// How far back to look for trending signals (7 days)
const TRENDING_WINDOW_DAYS = 7;

class TrendingService {
  /**
   * Recalculate trending products for a specific locality (city or pincode).
   * @param {string} locality — city name or pincode (lowercase)
   */
  static async calculateTrendingForLocality(locality) {
    try {
      logger.info(`📈 Calculating trending products for "${locality}"...`);

      // Find shops in this locality
      const shops = await Shop.find({
        $or: [
          { "address.city": new RegExp(locality, "i") },
          { "address.pincode": locality },
        ],
        isActive: true,
      }).select("_id");

      if (shops.length === 0) {
        logger.info(`No shops found in locality "${locality}".`);
        return;
      }

      const shopIds = shops.map((s) => s._id);
      const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

      // ── Step 1: Purchase count per product in this locality ──────────────
      const purchaseAgg = await Order.aggregate([
        {
          $match: {
            "items.shop": { $in: shopIds },
            createdAt: { $gte: since },
            status: "delivered",
          },
        },
        { $unwind: "$items" },
        { $match: { "items.shop": { $in: shopIds } } },
        {
          $group: {
            _id: "$items.product",
            totalPurchases: { $sum: "$items.quantity" },
          },
        },
      ]);

      // ── Step 2: Review count per product in this locality (last 7 days) ──
      const reviewAgg = await Review.aggregate([
        {
          $match: {
            targetType: "Product",
            shop: { $in: shopIds },
            createdAt: { $gte: since },
            isActive: true,
          },
        },
        {
          $group: {
            _id: "$targetId",
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      // ── Step 3: Get all products available in this locality ──────────────
      const availableProductPrices = await ProductPrice.find({
        shop: { $in: shopIds },
        isAvailable: true,
      }).distinct("product");

      const products = await Product.find({
        _id: { $in: availableProductPrices },
        isActive: true,
      }).select("_id averageRating totalReviews totalPurchases");

      if (products.length === 0) return;

      // ── Step 4: Build lookup maps ─────────────────────────────────────────
      const purchaseMap = {};
      purchaseAgg.forEach((p) => (purchaseMap[p._id.toString()] = p.totalPurchases));

      const reviewMap = {};
      reviewAgg.forEach((r) => (reviewMap[r._id.toString()] = r.totalReviews));

      // Find max values for normalization
      const maxPurchases = Math.max(...Object.values(purchaseMap), 1);
      const maxReviews   = Math.max(...Object.values(reviewMap), 1);
      const maxGlobalPurchases = Math.max(...products.map((p) => p.totalPurchases), 1);

      // ── Step 5: Calculate score for each product ──────────────────────────
      const scoredProducts = products.map((product) => {
        const pid = product._id.toString();

        const localPurchases = purchaseMap[pid] || 0;
        const localReviews   = reviewMap[pid]   || 0;

        // Normalized sub-scores (0–100)
        const purchaseScore = (localPurchases / maxPurchases) * 100;
        const ratingScore   = (product.averageRating / 5) * 100;
        const reviewScore   = (localReviews / maxReviews) * 100;
        const localityScore = (product.totalPurchases / maxGlobalPurchases) * 100; // Global popularity

        const totalScore =
          purchaseScore * WEIGHTS.purchase +
          ratingScore   * WEIGHTS.rating +
          reviewScore   * WEIGHTS.review +
          localityScore * WEIGHTS.locality;

        return {
          product: product._id,
          locality,
          scores: { purchaseScore, ratingScore, reviewScore, localityScore },
          totalScore: parseFloat(totalScore.toFixed(4)),
          snapshot: {
            purchases: localPurchases,
            averageRating: product.averageRating,
            totalReviews: localReviews,
          },
        };
      });

      // ── Step 6: Sort and assign ranks ─────────────────────────────────────
      scoredProducts.sort((a, b) => b.totalScore - a.totalScore);

      // ── Step 7: Determine trend direction (compare with previous rank) ────
      const previousTrending = await TrendingProduct.find({ locality })
        .select("product rank");
      const prevRankMap = {};
      previousTrending.forEach((t) => (prevRankMap[t.product.toString()] = t.rank));

      // ── Step 8: Upsert trending records ───────────────────────────────────
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const bulkOps = scoredProducts.map((item, idx) => {
        const currentRank = idx + 1;
        const prevRank = prevRankMap[item.product.toString()];
        let trend = "stable";
        if (prevRank && currentRank < prevRank) trend = "rising";
        if (prevRank && currentRank > prevRank) trend = "falling";

        return {
          updateOne: {
            filter: { product: item.product, locality },
            update: {
              $set: {
                ...item,
                rank: currentRank,
                trend,
                expiresAt: tomorrow,
              },
            },
            upsert: true,
          },
        };
      });

      if (bulkOps.length > 0) {
        await TrendingProduct.bulkWrite(bulkOps);
      }

      // Update trendingScore on Product model too
      for (let i = 0; i < scoredProducts.length; i++) {
        await Product.findByIdAndUpdate(scoredProducts[i].product, {
          trendingScore: scoredProducts[i].totalScore,
        });
      }

      logger.info(`✅ Trending: calculated ${scoredProducts.length} products for "${locality}".`);
    } catch (err) {
      logger.error(`Trending calculation failed for "${locality}": ${err.message}`);
    }
  }

  /**
   * Recalculate trending for all active cities.
   * Used by daily cron job.
   */
  static async recalculateAll() {
    const cities = await Shop.distinct("address.city", { isActive: true });
    for (const city of cities) {
      await TrendingService.calculateTrendingForLocality(city.toLowerCase());
    }
    logger.info(`✅ Trending recalculated for ${cities.length} localities.`);
  }
}

module.exports = TrendingService;
