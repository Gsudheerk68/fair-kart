/**
 * models/Product.js
 * Master product catalog — one document per unique product.
 * Prices per shop are stored separately in ProductPrice model.
 */

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },

    // Slug for clean URLs (e.g., "tata-salt-1kg")
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "grains-pulses",
        "spices-masala",
        "cooking-oil",
        "dairy",
        "snacks",
        "beverages",
        "cleaning",
        "personal-care",
        "fresh-produce",
        "bakery",
        "packaged-food",
        "frozen",
        "other",
      ],
    },

    subCategory: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    // Standard unit (e.g., "1kg", "500ml", "250g", "1 litre")
    unit: {
      type: String,
      required: [true, "Product unit is required"],
      trim: true,
    },

    // Barcode / SKU for billing machine integration
    barcode: {
      type: String,
      trim: true,
      index: true, // Fast lookup by barcode from billing machine
    },

    images: [
      {
        url: String,
        alt: String,
      },
    ],

    // Aggregated data (updated when ProductPrices change)
    lowestPrice: {
      type: Number,
      default: null,
    },

    highestPrice: {
      type: Number,
      default: null,
    },

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

    // Trending score — updated by TrendingService
    trendingScore: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ───── Indexes ─────
productSchema.index({ name: "text", brand: "text", tags: "text" }); // Full-text search
productSchema.index({ category: 1 });
productSchema.index({ trendingScore: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ lowestPrice: 1 });

// ───── Pre-save: Auto-generate slug ─────
productSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    
    // Append unit to slug to make it unique (e.g., "tata-salt-1kg")
    if (this.unit) {
      const unitSlug = this.unit.toLowerCase().replace(/\s+/g, "");
      this.slug = `${this.slug}-${unitSlug}`;
    }
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
