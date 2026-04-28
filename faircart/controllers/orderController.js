/**
 * controllers/orderController.js
 * Order placement and history.
 */

const Order = require("../models/Order");
const ProductPrice = require("../models/ProductPrice");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess, getPaginationMeta } = require("../utils/apiResponse");

// ─────────────────────────────────────────────
// @route   POST /api/v1/orders
// @access  Private — user
// ─────────────────────────────────────────────
exports.placeOrder = asyncHandler(async (req, res, next) => {
  const { items, deliveryAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError("Order must have at least one item.", 400));
  }

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const priceRecord = await ProductPrice.findOne({
      product: item.productId,
      shop: item.shopId,
      isAvailable: true,
    }).populate("product", "name unit");

    if (!priceRecord) {
      return next(new AppError(`Product is not available at the selected shop.`, 400));
    }

    if (priceRecord.stockQuantity < item.quantity) {
      return next(new AppError(`Insufficient stock for "${priceRecord.product.name}". Available: ${priceRecord.stockQuantity}`, 400));
    }

    validatedItems.push({
      product: item.productId,
      shop: item.shopId,
      quantity: item.quantity,
      price: priceRecord.price,
      unit: priceRecord.product.unit,
    });

    totalAmount += priceRecord.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    items: validatedItems,
    totalAmount,
    deliveryAddress,
    paymentMethod: paymentMethod || "cash",
    source: "app",
    notes,
  });

  await order.populate([
    { path: "items.product", select: "name unit images" },
    { path: "items.shop", select: "name address phone" },
  ]);

  sendSuccess(res, 201, "Order placed successfully!", order);
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/orders/my-orders
// @access  Private — user
// ─────────────────────────────────────────────
exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("items.product", "name images unit")
    .populate("items.shop", "name address");

  const total = await Order.countDocuments(filter);

  sendSuccess(res, 200, "Your orders.", orders, getPaginationMeta(page, limit, total));
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/orders/:id
// @access  Private — order owner
// ─────────────────────────────────────────────
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product", "name images unit barcode")
    .populate("items.shop", "name address phone");

  if (!order) return next(new AppError("Order not found.", 404));
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("Not authorized to view this order.", 403));
  }

  sendSuccess(res, 200, "Order details.", order);
});

// ─────────────────────────────────────────────
// @route   PUT /api/v1/orders/:id/status
// @access  Private — shopOwner or admin
// ─────────────────────────────────────────────
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ["confirmed", "in-progress", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    return next(new AppError(`Invalid status. Allowed: ${validStatuses.join(", ")}`, 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));

  order.status = status;
  await order.save(); // Triggers post-save hook if delivered

  sendSuccess(res, 200, `Order status updated to "${status}".`, order);
});
