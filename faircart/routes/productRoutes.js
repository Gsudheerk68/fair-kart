/**
 * routes/productRoutes.js
 */
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");

// Public
router.get("/",               productController.getAllProducts);
router.get("/:id",            productController.getProductById);
router.get("/:id/compare",    productController.compareProductPrices);

// Shop owner — inventory management
router.use(protect);
router.get(  "/inventory/list",           authorize("shopOwner"), productController.getShopInventory);
router.post( "/inventory/add",            authorize("shopOwner"), productController.addProductToShop);
router.put(  "/inventory/:priceId",       authorize("shopOwner"), productController.updateShopInventory);
router.delete("/inventory/:priceId",      authorize("shopOwner"), productController.removeProductFromShop);

// Admin — manage master product catalog
router.post("/",         authorize("admin", "shopOwner"), productController.createProduct);
router.put("/:id",       authorize("admin"),              productController.updateProduct);

module.exports = router;
