/**
 * middleware/billingAuth.js
 * Authenticates billing machine requests via API key.
 * The machine sends its shop's billing API key in the header.
 *
 * Header expected: X-Billing-Api-Key: <shop_billing_api_key>
 */

const Shop = require("../models/Shop");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const billingAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers["x-billing-api-key"];

  if (!apiKey) {
    return next(new AppError("Billing machine API key is required.", 401));
  }

  // Find shop with this billing API key
  const shop = await Shop.findOne({
    billingMachineApiKey: apiKey,
    isActive: true,
    billingMachineEnabled: true,
  }).select("+billingMachineApiKey");

  if (!shop) {
    return next(new AppError("Invalid billing machine API key or billing is not enabled for this shop.", 401));
  }

  // Attach shop to request for downstream use
  req.billingShop = shop;
  next();
});

module.exports = billingAuth;
