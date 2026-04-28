/**
 * services/rankingService.js
 * Shop ranking algorithm.
 *
 * Score formula:
 *   score = (priceScore × 0.30) + (ratingScore × 0.30) + (purchaseScore × 0.25) + (availabilityScore × 0.15)
 *
 * Higher score = better ranked shop.
 */

const Shop = require("../models/Shop");
const ProductPrice = require("../models/ProductPrice");
const logger = require("../utils/logger");

class RankingService {
  /**
   * Recalculate and persist ranking score for one shop.
   * @param {ObjectId|string} shopId
   */
  static async updateShopRanking(shopId) {
    try {
      const shop = await Shop.findById(shopId);
      if (!shop) return;

      const score = await RankingService.calculateScore(shop);

      await Shop.findByIdAndUpdate(shopId, { rankingScore: score });
      logger.debug(`🏆 Ranking updated for shop "${shop.name}": ${score.toFixed(3)}`);

      return score;
    } catch (err) {
      logger.error(`Ranking update failed for shop ${shopId}: ${err.message}`);
    }
  }

  /**
   * Recalculate ranking for ALL active shops.
   * Called by a cron job or manually by admin.
   */
  static async recalculateAllShops() {
    logger.info("🔄 Starting full shop ranking recalculation...");

    const shops = await Shop.find({ isActive: true }).select("_id name");
    let updated = 0;

    for (const shop of shops) {
      await RankingService.updateShopRanking(shop._id);
      updated++;
    }

    logger.info(`✅ Ranking recalculated for ${updated} shops.`);
    return updated;
  }

  /**
   * Calculate composite score for a shop.
   * @param {object} shop - Mongoose Shop document
   * @returns {number} score between 0 and 100
   */
  static async calculateScore(shop) {
    // ── 1. Price Score (lower avg price = higher score) ──────────────────
    const priceRecords = await ProductPrice.find({ shop: shop._id, isAvailable: true }).select("price");
    let priceScore = 0;

    if (priceRecords.length > 0) {
      const avgPrice = priceRecords.reduce((sum, p) => sum + p.price, 0) / priceRecords.length;

      // Get global average price across all shops
      const globalPriceAgg = await ProductPrice.aggregate([
        { $match: { isAvailable: true } },
        { $group: { _id: null, globalAvg: { $avg: "$price" } } },
      ]);

      const globalAvg = globalPriceAgg[0]?.globalAvg || avgPrice;

      // Lower price than global average = higher score (max 100)
      priceScore = Math.min(100, Math.max(0, ((globalAvg - avgPrice) / globalAvg + 1) * 50));
    }

    // ── 2. Rating Score (0–5 scale mapped to 0–100) ───────────────────────
    const ratingScore = (shop.averageRating / 5) * 100;

    // ── 3. Purchase Score (normalized — more purchases = higher score) ────
    const maxPurchases = await Shop.findOne({ isActive: true }).sort({ totalPurchases: -1 }).select("totalPurchases");
    const maxP = maxPurchases?.totalPurchases || 1;
    const purchaseScore = Math.min(100, (shop.totalPurchases / maxP) * 100);

    // ── 4. Availability Score (% of listed products that are in stock) ────
    const totalListings = await ProductPrice.countDocuments({ shop: shop._id });
    const availableListings = await ProductPrice.countDocuments({ shop: shop._id, isAvailable: true });
    const availabilityScore = totalListings > 0 ? (availableListings / totalListings) * 100 : 0;

    // ── Weighted Composite Score ──────────────────────────────────────────
    const WEIGHTS = {
      price: 0.30,
      rating: 0.30,
      purchase: 0.25,
      availability: 0.15,
    };

    const finalScore =
      priceScore * WEIGHTS.price +
      ratingScore * WEIGHTS.rating +
      purchaseScore * WEIGHTS.purchase +
      availabilityScore * WEIGHTS.availability;

    return parseFloat(finalScore.toFixed(4));
  }

  /**
   * Get top-ranked shops for a city.
   * @param {string} city
   * @param {number} limit
   */
  static async getTopShopsForCity(city, limit = 10) {
    return Shop.find({
      "address.city": new RegExp(city, "i"),
      isActive: true,
    })
      .sort({ rankingScore: -1 })
      .limit(limit)
      .select("name address averageRating totalReviews rankingScore totalPurchases");
  }
}

module.exports = RankingService;
