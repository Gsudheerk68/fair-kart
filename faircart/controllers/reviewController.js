/**
 * controllers/reviewController.js
 * User reviews for products and shops.
 */

const Review = require("../models/Review");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess, getPaginationMeta } = require("../utils/apiResponse");

// ─────────────────────────────────────────────
// @route   GET /api/v1/reviews/:targetType/:targetId
// @access  Public
// targetType: "Product" or "Shop"
// ─────────────────────────────────────────────
exports.getReviews = asyncHandler(async (req, res, next) => {
  const { targetType, targetId } = req.params;
  const { page = 1, limit = 10, sort = "recent" } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  if (!["Product", "Shop"].includes(targetType)) {
    return next(new AppError("targetType must be 'Product' or 'Shop'.", 400));
  }

  const sortOptions = {
    recent: { createdAt: -1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
    helpful: { helpfulVotes: -1 },
  };

  const reviews = await Review.find({ targetType, targetId, isActive: true })
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name avatar");

  const total = await Review.countDocuments({ targetType, targetId, isActive: true });

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { targetType, targetId: require("mongoose").Types.ObjectId(targetId), isActive: true } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  sendSuccess(res, 200, "Reviews fetched.", { reviews, ratingDistribution: distribution }, getPaginationMeta(page, limit, total));
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/reviews
// @access  Private — user
// ─────────────────────────────────────────────
exports.createReview = asyncHandler(async (req, res, next) => {
  const { targetType, targetId, shopId, rating, title, comment, images } = req.body;

  if (!["Product", "Shop"].includes(targetType)) {
    return next(new AppError("targetType must be 'Product' or 'Shop'.", 400));
  }

  // Check if user already reviewed this
  const existing = await Review.findOne({ user: req.user._id, targetType, targetId });
  if (existing) {
    return next(new AppError("You have already reviewed this. Edit your existing review instead.", 409));
  }

  // Check if it's a verified purchase (if reviewing a product)
  let isVerifiedPurchase = false;
  if (targetType === "Product") {
    const order = await Order.findOne({
      user: req.user._id,
      "items.product": targetId,
      status: "delivered",
    });
    isVerifiedPurchase = !!order;
  }

  const review = await Review.create({
    user: req.user._id,
    targetType,
    targetId,
    shop: shopId || null,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase,
  });

  await review.populate("user", "name avatar");

  sendSuccess(res, 201, "Review submitted. Thank you for your feedback!", review);
});

// ─────────────────────────────────────────────
// @route   PUT /api/v1/reviews/:id
// @access  Private — review author
// ─────────────────────────────────────────────
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError("Review not found.", 404));
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only edit your own reviews.", 403));
  }

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;

  await review.save(); // Triggers post-save hook to update averageRating

  sendSuccess(res, 200, "Review updated.", review);
});

// ─────────────────────────────────────────────
// @route   DELETE /api/v1/reviews/:id
// @access  Private — review author or admin
// ─────────────────────────────────────────────
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError("Review not found.", 404));
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You can only delete your own reviews.", 403));
  }

  review.isActive = false;
  await review.save();

  sendSuccess(res, 200, "Review removed.");
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private — user
// ─────────────────────────────────────────────
exports.markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError("Review not found.", 404));

  const alreadyVoted = review.helpfulVotedBy.includes(req.user._id);

  if (alreadyVoted) {
    review.helpfulVotedBy.pull(req.user._id);
    review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
  } else {
    review.helpfulVotedBy.push(req.user._id);
    review.helpfulVotes += 1;
  }

  await review.save();

  sendSuccess(res, 200, alreadyVoted ? "Helpful vote removed." : "Marked as helpful.", {
    helpfulVotes: review.helpfulVotes,
    voted: !alreadyVoted,
  });
});
