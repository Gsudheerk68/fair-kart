/**
 * models/BillingLog.js
 * Audit log for every billing machine update.
 * Tracks what changed, when, and from which machine.
 */

const mongoose = require("mongoose");

const billingLogSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    // Billing machine identifier (e.g., terminal ID)
    machineId: {
      type: String,
      required: true,
      trim: true,
    },

    // Type of operation performed
    action: {
      type: String,
      enum: [
        "stock_update",    // Stock quantity changed
        "price_update",    // Price changed
        "sale_recorded",   // A product was sold (decrements stock)
        "stock_added",     // New stock received
        "product_added",   // New product added via machine
      ],
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Snapshot of what changed
    changes: {
      previousPrice: Number,
      newPrice: Number,
      previousStock: Number,
      newStock: Number,
      quantitySold: Number,
    },

    status: {
      type: String,
      enum: ["success", "failed", "partial"],
      default: "success",
    },

    errorMessage: {
      type: String,
      default: null,
    },

    // Raw payload sent by machine (for debugging)
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ───── Indexes ─────
billingLogSchema.index({ shop: 1, createdAt: -1 });
billingLogSchema.index({ machineId: 1 });
billingLogSchema.index({ action: 1 });
billingLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BillingLog", billingLogSchema);
