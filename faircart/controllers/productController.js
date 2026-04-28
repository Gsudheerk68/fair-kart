/**
 * controllers/productController.js
 * Product catalog management and price comparison.
 */

const Product = require("../models/Product");
const ProductPrice = require("../models/ProductPrice");
const Shop = require("../models/Shop");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess, getPaginationMeta } = require("../utils/apiResponse");

// ─────────────────────────────────────────────
// @route   GET /api/v1/products
// @access  Public
// Query: category, search, page, limit, sortBy
// ─────────────────────────────────────────────
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20, sortBy = "name" } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const sortOptions = {
    name: { name: 1 },
    "lowest-price": { lowestPrice: 1 },
    "highest-rated": { averageRating: -1 },
    trending: { trendingScore: -1 },
  };

  const products = await Product.find(filter)
    .sort(sortOptions[sortBy] || { name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(filter);

  sendSuccess(res, 200, "Products fetched.", products, getPaginationMeta(page, limit, total));
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/products/:id
// @access  Public
// ─────────────────────────────────────────────
exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) return next(new AppError("Product not found.", 404));

  sendSuccess(res, 200, "Product fetched.", product);
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/products/:id/compare
// @access  Public
// Returns all shops selling this product with prices sorted lowest first
// Optional query: lat, lng, radius (km) to filter by nearby shops
// ─────────────────────────────────────────────
exports.compareProductPrices = asyncHandler(async (req, res, next) => {
  const { lat, lng, radius = 10 } = req.query;

  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) return next(new AppError("Product not found.", 404));

  let shopFilter = { isActive: true };

  // If location provided, filter to nearby shops only
  if (lat && lng) {
    const nearbyShops = await Shop.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
      isActive: true,
    }).select("_id");

    const nearbyShopIds = nearbyShops.map((s) => s._id);
    shopFilter._id = { $in: nearbyShopIds };
  }

  const availableShops = await Shop.find(shopFilter).select("_id");
  const shopIds = availableShops.map((s) => s._id);

  // Fetch all prices for this product in those shops
  const prices = await ProductPrice.find({
    product: req.params.id,
    shop: { $in: shopIds },
    isAvailable: true,
  })
    .sort({ price: 1 }) // Cheapest first
    .populate("shop", "name address averageRating phone location");

  if (prices.length === 0) {
    return sendSuccess(res, 200, "No shops found selling this product in your area.", []);
  }

  // Build comparison response
  const comparison = prices.map((pp, idx) => ({
    rank: idx + 1,
    priceRecord: pp,
    isCheapest: idx === 0,
    isBestRated: false, // Flagged below
    savings: idx === 0 ? 0 : +(prices[idx].price - prices[0].price).toFixed(2),
  }));

  // Flag best rated shop
  const bestRatedIdx = prices.reduce(
    (bestIdx, curr, idx) =>
      curr.shop.averageRating > prices[bestIdx].shop.averageRating ? idx : bestIdx,
    0
  );
  comparison[bestRatedIdx].isBestRated = true;

  sendSuccess(res, 200, `Price comparison for "${product.name}" across ${prices.length} shops.`, {
    product,
    comparison,
    summary: {
      cheapestPrice: prices[0].price,
      cheapestShop: prices[0].shop.name,
      highestPrice: prices[prices.length - 1].price,
      maxSavings: +(prices[prices.length - 1].price - prices[0].price).toFixed(2),
      totalShops: prices.length,
    },
  });
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/products
// @access  Private — shopOwner or admin
// ─────────────────────────────────────────────
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, subCategory, brand, unit, barcode, images, tags } = req.body;

  const product = await Product.create({
    name, description, category, subCategory, brand, unit, barcode, images, tags,
  });

  sendSuccess(res, 201, "Product added to catalog.", product);
});

// ─────────────────────────────────────────────
// @route   PUT /api/v1/products/:id
// @access  Private — admin only
// ─────────────────────────────────────────────
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) return next(new AppError("Product not found.", 404));

  sendSuccess(res, 200, "Product updated.", product);
});

// ─────────────────────────────────────────────
// SHOP INVENTORY MANAGEMENT
// ─────────────────────────────────────────────

// @route   GET /api/v1/products/shop-inventory
// @access  Private — shopOwner
exports.getShopInventory = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return next(new AppError("You don't have a shop.", 404));

  const { page = 1, limit = 50, lowStock } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { shop: shop._id };
  if (lowStock === "true") {
    filter.$expr = { $lte: ["$stockQuantity", "$lowStockThreshold"] };
  }

  const inventory = await ProductPrice.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("product", "name category brand unit barcode images");

  const total = await ProductPrice.countDocuments(filter);

  sendSuccess(res, 200, "Inventory fetched.", inventory, getPaginationMeta(page, limit, total));
});

// @route   POST /api/v1/products/shop-inventory
// @access  Private — shopOwner
// Adds a product to shop's inventory with a price and stock
exports.addProductToShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return next(new AppError("You don't have a shop.", 404));

  const { productId, price, mrp, stockQuantity, stockUnit, lowStockThreshold } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found in catalog.", 404));

  const existing = await ProductPrice.findOne({ product: productId, shop: shop._id });
  if (existing) return next(new AppError("This product is already in your inventory. Use the update endpoint.", 409));

  const priceRecord = await ProductPrice.create({
    product: productId,
    shop: shop._id,
    price,
    mrp,
    stockQuantity: stockQuantity || 0,
    stockUnit: stockUnit || "units",
    lowStockThreshold: lowStockThreshold || 10,
    lastUpdatedBy: "manual",
  });

  // Update product's price range
  await updateProductPriceRange(productId);

  sendSuccess(res, 201, "Product added to your shop inventory.", priceRecord);
});

// @route   PUT /api/v1/products/shop-inventory/:priceId
// @access  Private — shopOwner
exports.updateShopInventory = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return next(new AppError("You don't have a shop.", 404));

  const priceRecord = await ProductPrice.findOne({ _id: req.params.priceId, shop: shop._id });
  if (!priceRecord) return next(new AppError("Inventory record not found.", 404));

  const allowedFields = ["price", "mrp", "stockQuantity", "stockUnit", "lowStockThreshold", "isAvailable"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) priceRecord[field] = req.body[field];
  });

  priceRecord.lastUpdatedBy = "manual";
  await priceRecord.save();

  // Update product's price range cache
  await updateProductPriceRange(priceRecord.product);

  sendSuccess(res, 200, "Inventory updated.", priceRecord);
});

// @route   DELETE /api/v1/products/shop-inventory/:priceId
// @access  Private — shopOwner
exports.removeProductFromShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return next(new AppError("You don't have a shop.", 404));

  const priceRecord = await ProductPrice.findOneAndDelete({ _id: req.params.priceId, shop: shop._id });
  if (!priceRecord) return next(new AppError("Inventory record not found.", 404));

  await updateProductPriceRange(priceRecord.product);

  sendSuccess(res, 200, "Product removed from your inventory.");
});

// ───── Internal helper: recalculate product lowest/highest price ─────
const updateProductPriceRange = async (productId) => {
  const prices = await ProductPrice.find({ product: productId, isAvailable: true }).select("price");
  if (prices.length === 0) return;

  const priceValues = prices.map((p) => p.price);
  await Product.findByIdAndUpdate(productId, {
    lowestPrice: Math.min(...priceValues),
    highestPrice: Math.max(...priceValues),
  });
};
