/**
 * controllers/shopController.js
 * Shop discovery, nearby search, shop management for owners.
 */

const Shop = require("../models/Shop");
const ProductPrice = require("../models/ProductPrice");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess, sendError, getPaginationMeta } = require("../utils/apiResponse");
const RankingService = require("../services/rankingService");
const crypto = require("crypto");

// ─────────────────────────────────────────────
// @route   GET /api/v1/shops/nearby
// @access  Public
// Query params: lat, lng, radius (km), page, limit
// ─────────────────────────────────────────────
exports.getNearbyShops = asyncHandler(async (req, res, next) => {
  const { lat, lng, radius = 10, page = 1, limit = 20 } = req.query;

  if (!lat || !lng) {
    return next(new AppError("Please provide latitude (lat) and longitude (lng).", 400));
  }

  const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const shops = await Shop.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: radiusInMeters,
      },
    },
    isActive: true,
  })
    .skip(skip)
    .limit(parseInt(limit))
    .select("-billingMachineApiKey")
    .populate("owner", "name email");

  const total = await Shop.countDocuments({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radiusInMeters,
      },
    },
    isActive: true,
  });

  sendSuccess(res, 200, `Found ${shops.length} shops nearby.`, shops, getPaginationMeta(page, limit, total));
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/shops/ranked
// @access  Public
// Query: city, page, limit
// ─────────────────────────────────────────────
exports.getRankedShops = asyncHandler(async (req, res) => {
  const { city, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { isActive: true };
  if (city) filter["address.city"] = new RegExp(city, "i");

  const shops = await Shop.find(filter)
    .sort({ rankingScore: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select("-billingMachineApiKey");

  const total = await Shop.countDocuments(filter);

  sendSuccess(res, 200, "Ranked shops fetched.", shops, getPaginationMeta(page, limit, total));
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/shops/:id
// @access  Public
// ─────────────────────────────────────────────
exports.getShopById = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id)
    .select("-billingMachineApiKey")
    .populate("owner", "name email");

  if (!shop || !shop.isActive) {
    return next(new AppError("Shop not found.", 404));
  }

  // Fetch recent reviews
  const reviews = await Review.find({ targetType: "Shop", targetId: shop._id, isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name avatar");

  sendSuccess(res, 200, "Shop details fetched.", { shop, recentReviews: reviews });
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/shops
// @access  Private — shopOwner only
// ─────────────────────────────────────────────
exports.createShop = asyncHandler(async (req, res, next) => {
  // One shop per owner for now (scalable to multiple later)
  const existingShop = await Shop.findOne({ owner: req.user._id });
  if (existingShop) {
    return next(new AppError("You already have a registered shop. Update your existing shop instead.", 409));
  }

  const { name, description, category, address, location, phone, email, businessHours, tags } = req.body;

  if (!location?.coordinates || location.coordinates.length !== 2) {
    return next(new AppError("Valid location coordinates [longitude, latitude] are required.", 400));
  }

  const shop = await Shop.create({
    owner: req.user._id,
    name,
    description,
    category,
    address,
    location: { type: "Point", coordinates: location.coordinates },
    phone,
    email,
    businessHours,
    tags,
  });

  sendSuccess(res, 201, "Shop created successfully!", shop);
});

// ─────────────────────────────────────────────
// @route   PUT /api/v1/shops/:id
// @access  Private — shopOwner (own shop) or admin
// ─────────────────────────────────────────────
exports.updateShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) return next(new AppError("Shop not found.", 404));

  // Only the owner or admin can update
  if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You are not authorized to update this shop.", 403));
  }

  const allowedUpdates = ["name", "description", "address", "phone", "email", "businessHours", "tags", "images"];
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updatedShop = await Shop.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-billingMachineApiKey");

  // Recalculate ranking after update
  await RankingService.updateShopRanking(updatedShop._id);

  sendSuccess(res, 200, "Shop updated successfully.", updatedShop);
});

// ─────────────────────────────────────────────
// @route   DELETE /api/v1/shops/:id
// @access  Private — shopOwner or admin
// ─────────────────────────────────────────────
exports.deleteShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) return next(new AppError("Shop not found.", 404));

  if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You are not authorized to delete this shop.", 403));
  }

  // Soft delete
  shop.isActive = false;
  await shop.save();

  sendSuccess(res, 200, "Shop deactivated successfully.");
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/shops/my-shop
// @access  Private — shopOwner
// ─────────────────────────────────────────────
exports.getMyShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user._id }).select("+billingMachineApiKey");

  if (!shop) return next(new AppError("You don't have a shop yet. Create one first.", 404));

  sendSuccess(res, 200, "Your shop details.", shop);
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/shops/my-shop/generate-billing-key
// @access  Private — shopOwner
// ─────────────────────────────────────────────
exports.generateBillingKey = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findOne({ owner: req.user._id });

  if (!shop) return next(new AppError("Shop not found.", 404));

  // Generate a secure random API key
  const apiKey = `fc_bm_${crypto.randomBytes(32).toString("hex")}`;

  shop.billingMachineApiKey = apiKey;
  shop.billingMachineEnabled = true;
  await shop.save();

  sendSuccess(res, 200, "Billing machine API key generated. Store this securely — it won't be shown again.", {
    billingMachineApiKey: apiKey,
  });
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/shops/:id/favourite
// @access  Private — user
// ─────────────────────────────────────────────
exports.toggleFavourite = asyncHandler(async (req, res) => {
  const User = require("../models/User");
  const user = await User.findById(req.user._id);

  const shopId = req.params.id;
  const isFav = user.favouriteShops.includes(shopId);

  if (isFav) {
    user.favouriteShops = user.favouriteShops.filter((id) => id.toString() !== shopId);
  } else {
    user.favouriteShops.push(shopId);
  }

  await user.save();
  sendSuccess(res, 200, isFav ? "Removed from favourites." : "Added to favourites.", {
    isFavourite: !isFav,
  });
});
