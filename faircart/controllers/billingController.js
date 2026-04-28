/**
 * controllers/billingController.js
 * Billing machine integration API.
 * Hardware-agnostic — the machine POSTs updates here.
 */

const Product = require("../models/Product");
const ProductPrice = require("../models/ProductPrice");
const BillingLog = require("../models/BillingLog");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

// ─────────────────────────────────────────────
// @route   POST /api/v1/billing/sale
// @access  Billing machine (API key auth)
// Called when a product is sold at the billing counter.
// Decrements stock and records a billing log.
// ─────────────────────────────────────────────
exports.recordSale = asyncHandler(async (req, res, next) => {
  const { items, machineId } = req.body;
  const shop = req.billingShop;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError("Sale items are required.", 400));
  }

  const logs = [];
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const { barcode, productId, quantitySold, price } = item;

    // Find product by barcode or ID
    let product;
    if (barcode) {
      product = await Product.findOne({ barcode });
    } else if (productId) {
      product = await Product.findById(productId);
    }

    if (!product) {
      logs.push({ error: `Product not found: barcode=${barcode}, id=${productId}` });
      continue;
    }

    // Find price record for this shop
    const priceRecord = await ProductPrice.findOne({ product: product._id, shop: shop._id });

    if (!priceRecord) {
      logs.push({ error: `Product "${product.name}" not in shop inventory.` });
      continue;
    }

    const previousStock = priceRecord.stockQuantity;
    const newStock = Math.max(0, previousStock - quantitySold);

    priceRecord.stockQuantity = newStock;
    priceRecord.lastUpdatedBy = "billing_machine";
    if (price) priceRecord.price = price; // Update price if machine sends it
    await priceRecord.save();

    // Audit log
    const log = await BillingLog.create({
      shop: shop._id,
      machineId,
      action: "sale_recorded",
      product: product._id,
      changes: { previousStock, newStock, quantitySold, previousPrice: priceRecord.price, newPrice: price || priceRecord.price },
      status: "success",
      rawPayload: item,
    });

    logs.push({ product: product.name, previousStock, newStock, log: log._id });

    orderItems.push({
      product: product._id,
      shop: shop._id,
      quantity: quantitySold,
      price: priceRecord.price,
      unit: product.unit,
    });

    totalAmount += priceRecord.price * quantitySold;
  }

  // Record as a delivered order for analytics
  if (orderItems.length > 0) {
    await Order.create({
      user: shop.owner, // Placeholder — billing machine orders are shop-initiated
      items: orderItems,
      totalAmount,
      status: "delivered",
      source: "billing_machine",
      paymentMethod: "cash",
      paymentStatus: "paid",
    });
  }

  sendSuccess(res, 200, "Sale recorded. Stock updated.", { processed: logs });
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/billing/stock-update
// @access  Billing machine (API key auth)
// Called when new stock arrives or inventory is manually updated.
// ─────────────────────────────────────────────
exports.updateStock = asyncHandler(async (req, res, next) => {
  const { items, machineId } = req.body;
  const shop = req.billingShop;

  if (!items || !Array.isArray(items)) {
    return next(new AppError("Stock items array is required.", 400));
  }

  const results = [];

  for (const item of items) {
    const { barcode, productId, newStock, addStock, newPrice, mrp } = item;

    let product;
    if (barcode) product = await Product.findOne({ barcode });
    else if (productId) product = await Product.findById(productId);

    if (!product) {
      results.push({ error: `Product not found: ${barcode || productId}` });
      continue;
    }

    let priceRecord = await ProductPrice.findOne({ product: product._id, shop: shop._id });

    if (!priceRecord) {
      // Auto-create if doesn't exist
      priceRecord = new ProductPrice({
        product: product._id,
        shop: shop._id,
        price: newPrice || 0,
        stockQuantity: 0,
        lastUpdatedBy: "billing_machine",
      });
    }

    const previousStock = priceRecord.stockQuantity;
    const previousPrice = priceRecord.price;

    // Set or add stock
    if (newStock !== undefined) priceRecord.stockQuantity = newStock;
    if (addStock !== undefined) priceRecord.stockQuantity += addStock;
    if (newPrice !== undefined) priceRecord.price = newPrice;
    if (mrp !== undefined) priceRecord.mrp = mrp;

    priceRecord.lastUpdatedBy = "billing_machine";
    await priceRecord.save();

    await BillingLog.create({
      shop: shop._id,
      machineId,
      action: newPrice !== undefined ? "price_update" : "stock_update",
      product: product._id,
      changes: {
        previousStock,
        newStock: priceRecord.stockQuantity,
        previousPrice,
        newPrice: priceRecord.price,
      },
      status: "success",
      rawPayload: item,
    });

    results.push({ product: product.name, stock: priceRecord.stockQuantity, price: priceRecord.price });
  }

  sendSuccess(res, 200, "Stock updated from billing machine.", { updated: results });
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/billing/logs
// @access  Private — shopOwner
// ─────────────────────────────────────────────
exports.getBillingLogs = asyncHandler(async (req, res, next) => {
  const Shop = require("../models/Shop");
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return next(new AppError("Shop not found.", 404));

  const { page = 1, limit = 50, action } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { shop: shop._id };
  if (action) filter.action = action;

  const logs = await BillingLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("product", "name barcode unit");

  sendSuccess(res, 200, "Billing logs fetched.", logs);
});
