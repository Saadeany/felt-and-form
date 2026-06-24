const { sequelize, Order, OrderItem, Cart, Product, Coupon, User, ProductSize, Size } = require("../models");
const generateOrderNumber = require("../utils/generateOrderNumber");
const { sendOrderConfirmationEmail, sendOrderStatusEmail, sendAdminNewOrderEmail, sendAdminLowStockEmail } = require("../utils/emailService");
const { notifyOrderConfirmed, notifyOrderStatus, notifyAdminNewOrder, notifyAdminLowStock } = require("../utils/notificationService");

const TAX_RATE       = parseFloat(process.env.TAX_RATE       || "0.14");
const FLAT_SHIPPING  = parseFloat(process.env.FLAT_SHIPPING  || "60");
const FREE_SHIPPING_THRESHOLD = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || "1500");
const LOW_STOCK_THRESHOLD     = parseInt(process.env.LOW_STOCK_THRESHOLD || "5", 10);

const getAdminUser = () => User.findOne({ where: { role: "admin" } });

// @route POST /api/orders/checkout
const checkout = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      shipping_full_name, shipping_phone, shipping_email,
      shipping_country, shipping_city, shipping_address,
      payment_method, coupon_code,
    } = req.body;

    if (!shipping_full_name || !shipping_phone || !shipping_email ||
        !shipping_country || !shipping_city || !shipping_address || !payment_method) {
      await t.rollback();
      return res.status(400).json({ message: "All shipping fields and a payment method are required." });
    }

    // Email verification gate
    if (!req.user.is_email_verified) {
      await t.rollback();
      return res.status(403).json({ message: "Please verify your email address before placing an order.", code: "EMAIL_NOT_VERIFIED" });
    }

    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id, saved_for_later: false },
      include: [{ model: Product }],
      transaction: t,
    });
    if (cartItems.length === 0) { await t.rollback(); return res.status(400).json({ message: "Your cart is empty." }); }

    // Validate stock and subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      if (!item.Product || !item.Product.is_active) {
        await t.rollback();
        return res.status(400).json({ message: `"${item.Product?.name || "A product"}" is no longer available.` });
      }
      if (item.Product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Only ${item.Product.stock} unit(s) of "${item.Product.name}" left in stock.` });
      }
      // FIX #1: also validate per-size stock when a size is selected
      if (item.size) {
        const sizeRow = await ProductSize.findOne({
          include: [{ model: Size, where: { name: item.size } }],
          where: { product_id: item.Product.id },
          transaction: t,
        });
        if (sizeRow && sizeRow.stock < item.quantity) {
          await t.rollback();
          return res.status(400).json({ message: `Size ${item.size} of "${item.Product.name}" only has ${sizeRow.stock} unit(s) left.` });
        }
      }
      subtotal += item.Product.price * (1 - (item.Product.discount || 0) / 100) * item.quantity;
    }

    // Coupon
    let discountAmount = 0;
    let appliedCoupon = null;
    if (coupon_code) {
      const coupon = await Coupon.findOne({ where: { code: coupon_code.toUpperCase().trim() }, transaction: t });
      const today = new Date().toISOString().slice(0, 10);
      if (!coupon || !coupon.is_active || today < coupon.start_date || today > coupon.expiry_date || coupon.times_used >= coupon.usage_limit) {
        await t.rollback(); return res.status(400).json({ message: "Coupon code is invalid or expired." });
      }
      // FIX: coupon minimum order amount check
      if (coupon.minimum_order_amount && subtotal < parseFloat(coupon.minimum_order_amount)) {
        await t.rollback();
        return res.status(400).json({ message: `This coupon requires a minimum order of ${coupon.minimum_order_amount} EGP.` });
      }
      discountAmount = subtotal * (coupon.discount / 100);
      appliedCoupon = coupon;
    }

    const taxable = subtotal - discountAmount;
    const tax = taxable * TAX_RATE;
    const shippingCost = taxable >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const total = taxable + tax + shippingCost;

    const order = await Order.create({
      order_number: generateOrderNumber(), user_id: req.user.id,
      subtotal: subtotal.toFixed(2), discount_amount: discountAmount.toFixed(2),
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      tax: tax.toFixed(2), shipping_cost: shippingCost.toFixed(2), total_amount: total.toFixed(2),
      payment_method, shipping_full_name, shipping_phone, shipping_email,
      shipping_country, shipping_city, shipping_address,
    }, { transaction: t });

    const orderItemsData = [];
    const lowStockProducts = [];

    for (const item of cartItems) {
      const fp = item.Product.price * (1 - (item.Product.discount || 0) / 100);
      const oi = await OrderItem.create({
        order_id: order.id, product_id: item.Product.id, product_name: item.Product.name,
        size: item.size, color: item.color, quantity: item.quantity, price: fp.toFixed(2),
      }, { transaction: t });
      orderItemsData.push(oi);

      // FIX #1: decrement BOTH product-level stock AND per-size stock atomically
      item.Product.stock -= item.quantity;
      await item.Product.save({ transaction: t });

      if (item.size) {
        await sequelize.query(
          `UPDATE product_sizes ps
           JOIN sizes s ON s.id = ps.size_id
           SET ps.stock = GREATEST(0, ps.stock - :qty)
           WHERE ps.product_id = :pid AND s.name = :size`,
          { replacements: { qty: item.quantity, pid: item.Product.id, size: item.size }, transaction: t }
        );
      }

      if (item.Product.stock <= LOW_STOCK_THRESHOLD) lowStockProducts.push(item.Product);
    }

    if (appliedCoupon) { appliedCoupon.times_used += 1; await appliedCoupon.save({ transaction: t }); }
    await Cart.destroy({ where: { user_id: req.user.id, saved_for_later: false }, transaction: t });
    await t.commit();

    const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: "items" }] });

    // Post-commit notifications (fire and forget)
    sendOrderConfirmationEmail(req.user, fullOrder, fullOrder.items).catch(() => {});
    notifyOrderConfirmed(req.user.id, fullOrder).catch(() => {});
    getAdminUser().then((admin) => {
      if (!admin) return;
      sendAdminNewOrderEmail(fullOrder, req.user, fullOrder.items).catch(() => {});
      notifyAdminNewOrder(admin.id, fullOrder, req.user).catch(() => {});
      if (lowStockProducts.length > 0) {
        sendAdminLowStockEmail(lowStockProducts).catch(() => {});
        lowStockProducts.forEach((p) => notifyAdminLowStock(admin.id, p).catch(() => {}));
      }
    }).catch(() => {});

    res.status(201).json({ message: "Order placed successfully.", order: fullOrder });
  } catch (error) { await t.rollback(); next(error); }
};

// @route GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ orders });
  } catch (error) { next(error); }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== "admin") where.user_id = req.user.id;
    const order = await Order.findOne({
      where,
      include: [{ model: OrderItem, as: "items" }, { model: User, attributes: ["id","first_name","last_name","email"] }],
    });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (error) { next(error); }
};

// @route GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const { Op } = require("sequelize");
    if (search) {
      where[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { shipping_full_name: { [Op.like]: `%${search}%` } },
        { shipping_email: { [Op.like]: `%${search}%` } },
        { shipping_phone: { [Op.like]: `%${search}%` } },
      ];
    }
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: "items" },
        { model: User, attributes: ["id","first_name","last_name","email"] },
      ],
      order: [["createdAt","DESC"]], limit: limitNum, offset: (pageNum - 1) * limitNum, distinct: true,
    });
    res.json({ orders: rows, pagination: { total: count, page: pageNum, limit: limitNum, total_pages: Math.ceil(count / limitNum) } });
  } catch (error) { next(error); }
};

// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending","processing","shipped","delivered","cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status value." });

    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: "items" }] });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await Product.increment("stock", { by: item.quantity, where: { id: item.product_id } });
        if (item.size) {
          await sequelize.query(
            `UPDATE product_sizes ps JOIN sizes s ON s.id = ps.size_id
             SET ps.stock = ps.stock + :qty
             WHERE ps.product_id = :pid AND s.name = :size`,
            { replacements: { qty: item.quantity, pid: item.product_id, size: item.size } }
          );
        }
      }
    }

    order.status = status;
    await order.save();

    const customer = await User.findByPk(order.user_id);
    if (customer) {
      sendOrderStatusEmail(customer, order).catch(() => {});
      notifyOrderStatus(customer.id, order).catch(() => {});
    }

    res.json({ message: "Order status updated.", order });
  } catch (error) { next(error); }
};

module.exports = { checkout, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
