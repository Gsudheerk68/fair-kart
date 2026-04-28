/**
 * routes/shopRoutes.js
 */
const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shopController");
const { protect, authorize } = require("../middleware/auth");

// Public
router.get("/nearby",        shopController.getNearbyShops);
router.get("/ranked",        shopController.getRankedShops);
router.get("/:id",           shopController.getShopById);

// Shop owner
router.use(protect);
router.get("/owner/my-shop",                           authorize("shopOwner", "admin"), shopController.getMyShop);
router.post("/",                                        authorize("shopOwner"),          shopController.createShop);
router.put("/:id",                                      authorize("shopOwner", "admin"), shopController.updateShop);
router.delete("/:id",                                   authorize("shopOwner", "admin"), shopController.deleteShop);
router.post("/owner/generate-billing-key",              authorize("shopOwner"),          shopController.generateBillingKey);
router.post("/:id/favourite",                           authorize("user"),               shopController.toggleFavourite);

module.exports = router;
