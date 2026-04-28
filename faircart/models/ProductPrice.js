/**
 * models/ProductPrice.js
 * Per-shop product pricing and stock.
 * This is the core comparison table — one document per (product, shop) pair.
 */

const mongoose = require("mongoose");

const productPriceSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "Shop reference is required"],
    },

    // Current selling price
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Original MRP for discount display
    mrp: {
      type: Number,
      min: [0, "MRP cannot be negative"],
    },

    // Discount percentage (calculated or manually set)
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Stock management
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },

    stockUnit: {
      type: String,
      default: "units", // e.g., "kg", "litres", "units", "packets"
    },

    // Threshold for low-stock warnings
    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Source of last update — "manual" or "billing_machine"
    lastUpdatedBy: {
      type: String,
      enum: ["manual", "billing_machine"],
      default: "manual",
    },

    // Price history for trend graphs (last 30 days max)
    priceHistory: [
      {
        price: Number,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ───── Compound unique index: One price per product per shop ─────
productPriceSchema.index({ product: 1, shop: 1 }, { unique: true });
productPriceSchema.index({ shop: 1 });
productPriceSchema.index({ product: 1, price: 1 }); // For price comparison sorting
productPriceSchema.index({ isAvailable: 1 });

// ───── Pre-save: Calculate discount and record price history ─────
productPriceSchema.pre("save", function (next) {
  // Auto-calculate discount if MRP provided
  if (this.mrp && this.price && this.mrp > 0) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }

  // Record price history when price changes
  if (this.isModified("price") && !this.isNew) {
    // Keep only last 30 price changes
    if (this.priceHistory.length >= 30) {
      this.priceHistory.shift();
    }
    this.priceHistory.push({ price: this.price, updatedAt: new Date() });
  }

  // Mark unavailable if out of stock
  if (this.stockQuantity <= 0) {
    this.isAvailable = false;
  }

  next();
});

// ───── Virtual: Is stock low? ─────
productPriceSchema.virtual("isLowStock").get(function () {
  return this.stockQuantity > 0 && this.stockQuantity <= this.lowStockThreshold;
});

module.exports = mongoose.model("ProductPrice", productPriceSchema);
