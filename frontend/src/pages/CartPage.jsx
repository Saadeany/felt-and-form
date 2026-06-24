import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, BookmarkCheck, Bookmark } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getSavedForLater } from "../api/cart";
import { validateCoupon } from "../api/orders";
import { formatPrice, getFinalPrice, getPrimaryImage } from "../utils/format";
import Loader from "../components/common/Loader";

const TAX_RATE = 0.14;
const FLAT_SHIPPING = 60;
const FREE_SHIPPING_THRESHOLD = 1500;

const CartPage = () => {
  const { items, subtotal, loading, updateItem, removeItem, saveForLater } = useCart();
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    getSavedForLater().then(({ data }) => setSavedItems(data.items)).catch(() => {});
  }, [items]);

  const discount = coupon ? subtotal * (coupon.discount / 100) : 0;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * TAX_RATE;
  const shipping = taxableAmount >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? FLAT_SHIPPING : 0;
  const total = taxableAmount + tax + shipping;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await validateCoupon(couponCode);
      setCoupon(data.coupon);
    } catch (e) {
      setCouponError(e.response?.data?.message || "Invalid coupon.");
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  if (loading) return <Loader label="Loading cart" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-charcoal/40">Your cart is empty.</p>
          <Link to="/shop" className="btn-primary mt-6 inline-flex">Shop Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const fp = getFinalPrice(item.Product?.price, item.Product?.discount);
              return (
                <div key={item.id} className="flex gap-4 border border-ink/10 p-4">
                  <Link to={`/product/${item.Product?.slug}`} className="shrink-0">
                    <img src={getPrimaryImage(item.Product)} alt={item.Product?.name} className="h-28 w-22 object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex justify-between">
                      <Link to={`/product/${item.Product?.slug}`} className="text-sm hover:underline">{item.Product?.name}</Link>
                      <button onClick={() => removeItem(item.id)} className="text-charcoal/40 hover:text-ink"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex gap-3 text-xs text-charcoal/60">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-ink/20">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-3 py-1 text-sm disabled:opacity-30">−</button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} className="px-3 py-1 text-sm">+</button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice(fp * item.quantity)}</p>
                        {parseFloat(item.Product?.discount) > 0 && (
                          <p className="text-xs text-charcoal/50 line-through">{formatPrice(parseFloat(item.Product?.price) * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => saveForLater(item.id)} className="flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-ink self-start mt-1">
                      <Bookmark size={12} /> Save for later
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Saved for later */}
            {savedItems.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow mb-4">Saved for Later</p>
                {savedItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border border-ink/10 p-4 opacity-70">
                    <img src={getPrimaryImage(item.Product)} alt={item.Product?.name} className="h-16 w-14 object-cover" />
                    <div className="flex-1 flex items-center justify-between">
                      <p className="text-sm">{item.Product?.name}</p>
                      <button onClick={() => saveForLater(item.id)} className="flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-ink">
                        <BookmarkCheck size={12} /> Move to cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="h-fit border border-ink/10 p-6 space-y-4">
            <h2 className="font-display text-xl">Order Summary</h2>
            <div className="stitch-rule text-ink/20" />

            {/* Coupon */}
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="input-field flex-1 text-xs"
              />
              <button onClick={applyCoupon} disabled={couponLoading} className="btn-outline px-3 text-xs">
                Apply
              </button>
            </div>
            {coupon && <p className="text-xs text-green-600">✓ {coupon.code} — {coupon.discount}% off applied</p>}
            {couponError && <p className="text-xs text-red-500">{couponError}</p>}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-charcoal/60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-charcoal/60">Tax (14%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-charcoal/50">Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
              )}
              <div className="stitch-rule text-ink/20 !mt-4" />
              <div className="flex justify-between font-medium text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            <button
              onClick={() => navigate("/checkout", { state: { coupon } })}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>
            <Link to="/shop" className="block text-center text-xs text-charcoal/60 hover:text-ink">Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
