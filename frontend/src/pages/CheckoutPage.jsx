import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { checkout } from "../api/orders";
import { formatPrice, getFinalPrice, getPrimaryImage } from "../utils/format";

const TAX_RATE = 0.14;
const FLAT_SHIPPING = 60;
const FREE_SHIPPING_THRESHOLD = 1500;

const PAYMENT_METHODS = [
  { value: "cash_on_delivery", label: "Cash on Delivery" },
  { value: "credit_card", label: "Credit Card" },
  { value: "vodafone_cash", label: "Vodafone Cash" },
  { value: "instapay", label: "InstaPay" },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const coupon = location.state?.coupon || null;
  const { items, subtotal, refreshCart } = useCart();

  const discount = coupon ? subtotal * (coupon.discount / 100) : 0;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * TAX_RATE;
  const shipping = taxableAmount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = taxableAmount + tax + shipping;

  const [form, setForm] = useState({
    shipping_full_name: "", shipping_phone: "", shipping_email: "",
    shipping_country: "Egypt", shipping_city: "", shipping_address: "",
    payment_method: "cash_on_delivery",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (coupon) payload.coupon_code = coupon.code;
      const { data } = await checkout(payload);
      await refreshCart();
      navigate(`/order-success/${data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const Field = ({ label, name, type = "text", required = true }) => (
    <div>
      <label className="eyebrow mb-1 block">{label}</label>
      <input
        type={type}
        required={required}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        className="input-field"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Shipping form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-ink/10 p-6">
              <h2 className="font-display text-xl mb-5">Shipping Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name" name="shipping_full_name" />
                <Field label="Phone" name="shipping_phone" type="tel" />
                <Field label="Email" name="shipping_email" type="email" />
                <Field label="Country" name="shipping_country" />
                <Field label="City" name="shipping_city" />
                <div className="sm:col-span-2">
                  <label className="eyebrow mb-1 block">Address</label>
                  <input
                    required
                    value={form.shipping_address}
                    onChange={(e) => update("shipping_address", e.target.value)}
                    className="input-field"
                    placeholder="Street, building number, apartment"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="border border-ink/10 p-6">
              <h2 className="font-display text-xl mb-5">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-3 cursor-pointer border p-3 transition-colors ${
                      form.payment_method === pm.value ? "border-ink bg-cream" : "border-ink/15 hover:border-ink/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={pm.value}
                      checked={form.payment_method === pm.value}
                      onChange={(e) => update("payment_method", e.target.value)}
                    />
                    <span className="text-sm">{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 p-3 border border-red-200">{error}</p>}
          </div>

          {/* Order summary sidebar */}
          <div className="h-fit space-y-4 border border-ink/10 p-6">
            <h2 className="font-display text-xl">Order Summary</h2>
            <div className="stitch-rule text-ink/20" />
            <div className="space-y-3 max-h-52 overflow-y-auto">
              {items.map((item) => {
                const fp = getFinalPrice(item.Product?.price, item.Product?.discount);
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={getPrimaryImage(item.Product)} alt={item.Product?.name} className="h-14 w-11 object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{item.Product?.name}</p>
                      {item.size && <p className="text-xs text-charcoal/50">Size: {item.size}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs">×{item.quantity}</p>
                      <p className="text-xs font-medium">{formatPrice(fp * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="stitch-rule text-ink/20" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-charcoal/60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({coupon.code})</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-charcoal/60">Tax (14%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-charcoal/60">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
              <div className="stitch-rule text-ink/20 !my-3" />
              <div className="flex justify-between font-medium text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Placing Order…" : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
