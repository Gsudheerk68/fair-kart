/**
 * models/Review.js
 * Reviews for both Products and Shops.
 * Uses a polymorphic "targetType" field for flexibility.
 */

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },

    // Polymorphic reference — can target a product OR a shop
    targetType: {
      type: String,
      enum: ["Product", "Shop"],
      required: [true, "Review target type is required"],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Review target ID is required"],
      refPath: "targetType", // Mongoose dynamically resolves the ref based on targetType
    },

    // If reviewing a product, which shop did they buy from?
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    title: {
      type: String,
      trim: true,
      maxlength: [100, "Review title cannot exceed 100 characters"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },

    images: [
      {
        url: String,
      },
    ],

    // Helpful votes from other users
    helpfulVotes: {
      type: Number,
      default: 0,
    },

    helpfulVotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isVerifiedPurchase: {
      type: Boolean,
      default: false, // Set to true if user has an Order for this product
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ───── Indexes ─────
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });

// ───── Prevent duplicate reviews from same user for same target ─────
reviewSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// ───── Post-save: Update average rating on the parent document ─────
reviewSchema.statics.updateAverageRating = async function (targetType, targetId) {
  const Model = mongoose.model(targetType); // "Product" or "Shop"

  const stats = await this.aggregate([
    { $match: { targetType, targetId: mongoose.Types.ObjectId(targetId), isActive: true } },
    {
      $group: {
        _id: "$targetId",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Model.findByIdAndUpdate(targetId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats[0].count,
    });
  } else {
    await Model.findByIdAndUpdate(targetId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.updateAverageRating(this.targetType, this.targetId);
});

reviewSchema.post("remove", async function () {
  await this.constructor.updateAverageRating(this.targetType, this.targetId);
});

module.exports = mongoose.model("Review", reviewSchema);
