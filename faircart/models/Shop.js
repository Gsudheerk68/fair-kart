/**
 * models/Shop.js
 * Shop schema — grocery stores registered on FairCart.
 * Supports geospatial queries for nearby shop discovery.
 */

const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Shop must have an owner"],
    },

    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
      maxlength: [100, "Shop name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    category: {
      type: String,
      enum: ["grocery", "supermarket", "mini-market", "organic"],
      default: "grocery",
    },

    // Physical address
    address: {
      street: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: {
        type: String,
        required: true,
        match: [/^\d{6}$/, "Please provide a valid 6-digit pincode"],
      },
    },

    // GeoJSON location — required for $near and $geoWithin queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Shop location coordinates are required"],
      },
    },

    // Contact info
    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Shop images
    images: [
      {
        url: String,
        alt: String,
      },
    ],

    // Business hours
    businessHours: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "21:00" },
      daysOpen: {
        type: [String],
        default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
    },

    // Aggregated rating (updated via Review saves)
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalPurchases: {
      type: Number,
      default: 0,
    },

    // Shop Ranking Score (calculated by RankingService)
    rankingScore: {
      type: Number,
      default: 0,
    },

    // Whether billing machine integration is enabled
    billingMachineEnabled: {
      type: Boolean,
      default: false,
    },

    // API key for billing machine to authenticate stock updates
    billingMachineApiKey: {
      type: String,
      select: false, // Never expose in API responses
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Tags for search (e.g., "organic", "bulk", "discount")
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ───── Indexes ─────
shopSchema.index({ location: "2dsphere" }); // Required for geospatial queries
shopSchema.index({ owner: 1 });
shopSchema.index({ rankingScore: -1 });
shopSchema.index({ averageRating: -1 });
shopSchema.index({ isActive: 1, isVerified: 1 });
shopSchema.index({ "address.city": 1 });
shopSchema.index({ name: "text", description: "text", tags: "text" }); // Text search

module.exports = mongoose.model("Shop", shopSchema);
