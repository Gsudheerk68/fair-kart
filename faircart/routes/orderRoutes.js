/**
 * routes/orderRoutes.js
 */
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.post("/",                    orderController.placeOrder);
router.get("/my-orders",            orderController.getMyOrders);
router.get("/:id",                  orderController.getOrderById);
router.put("/:id/status",           authorize("shopOwner", "admin"), orderController.updateOrderStatus);

module.exports = router;
