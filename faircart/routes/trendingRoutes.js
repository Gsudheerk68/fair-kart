/**
 * routes/trendingRoutes.js
 */
const express = require("express");
const router = express.Router();

const trendingController = require("../controllers/trendingController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", trendingController.getTrendingProducts);

// Admin
router.post("/recalculate", protect, authorize("admin"), trendingController.recalculateTrending);

module.exports = router;
