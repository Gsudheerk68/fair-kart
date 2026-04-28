/**
 * routes/reviewRoutes.js
 */
const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// Public
router.get("/:targetType/:targetId", reviewController.getReviews);

// Authenticated
router.use(protect);
router.post("/",          reviewController.createReview);
router.put("/:id",        reviewController.updateReview);
router.delete("/:id",     reviewController.deleteReview);
router.post("/:id/helpful", reviewController.markHelpful);

module.exports = router;
