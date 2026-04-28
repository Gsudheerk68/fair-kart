/**
 * routes/billingRoutes.js
 * Routes for billing machine integration.
 */
const express = require("express");
const router = express.Router();

const billingController = require("../controllers/billingController");
const billingAuth = require("../middleware/billingAuth");
const { protect, authorize } = require("../middleware/auth");

// Billing machine endpoints (authenticated via API key, not JWT)
router.post("/sale",         billingAuth, billingController.recordSale);
router.post("/stock-update", billingAuth, billingController.updateStock);

// Shop owner views logs via JWT
router.get("/logs", protect, authorize("shopOwner", "admin"), billingController.getBillingLogs);

module.exports = router;
