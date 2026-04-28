/**
 * models/Order.js
 * Purchase/Order records.
 * Used for trending algorithm and verified purchase badges on reviews.
 * NOTE: FairCart v1 tracks orders for analytics — not for payment processing.
 */

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number, // Price at time of purchase
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },

    items: {
      type: [orderItemSchema],
      required: [true, "Order must have at least one item"],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "Order must have at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Delivery location
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "delivered", "cancelled"],
      default: "pending",
    },

    // Payment info (for future integration)
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "wallet"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Source of order
    source: {
      type: String,
      enum: ["app", "billing_machine"],
      default: "app",
    },

    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// ───── Indexes ─────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.product": 1 });
orderSchema.index({ "items.shop": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// ───── Post-save: Increment purchase counters ─────
orderSchema.post("save", async function () {
  if (this.status === "delivered") {
    const Product = mongoose.model("Product");
    const Shop = mongoose.model("Shop");

    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { totalPurchases: item.quantity },
      });
      await Shop.findByIdAndUpdate(item.shop, {
        $inc: { totalPurchases: item.quantity },
      });
    }
  }
});

module.exports = mongoose.model("Order", orderSchema);
