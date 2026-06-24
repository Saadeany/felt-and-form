import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, toggleSaveForLater } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCart();
      setItems(data.items);
      setSubtotal(data.subtotal);
    } catch {
      // fail silently — the cart icon just shows 0 until the next refresh
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (product_id, size, color, quantity = 1) => {
      await apiAddToCart({ product_id, size, color, quantity });
      await refreshCart();
    },
    [refreshCart]
  );

  const updateItem = useCallback(
    async (id, quantity) => {
      await updateCartItem(id, quantity);
      await refreshCart();
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (id) => {
      await removeCartItem(id);
      await refreshCart();
    },
    [refreshCart]
  );

  const saveForLater = useCallback(
    async (id) => {
      await toggleSaveForLater(id);
      await refreshCart();
    },
    [refreshCart]
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, subtotal, itemCount, loading, refreshCart, addItem, updateItem, removeItem, saveForLater }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
