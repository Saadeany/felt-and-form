const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    coupon_code: { type: DataTypes.STRING(50), allowNull: true },
    tax: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    shipping_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    payment_method: {
      type: DataTypes.ENUM("cash_on_delivery", "credit_card", "vodafone_cash", "instapay"),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    shipping_full_name: { type: DataTypes.STRING(100), allowNull: false },
    shipping_phone: { type: DataTypes.STRING(20), allowNull: false },
    shipping_email: { type: DataTypes.STRING(150), allowNull: false },
    shipping_country: { type: DataTypes.STRING(100), allowNull: false },
    shipping_city: { type: DataTypes.STRING(100), allowNull: false },
    shipping_address: { type: DataTypes.STRING(255), allowNull: false },
  },
  { tableName: "orders" }
);

module.exports = Order;
