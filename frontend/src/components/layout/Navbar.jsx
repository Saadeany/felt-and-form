import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getSearchSuggestions } from "../../api/products";
import { formatPrice, getFinalPrice, getPrimaryImage } from "../../utils/format";
import NotificationBell from "../common/NotificationBell";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Men", to: "/shop?gender=men" },
  { label: "Women", to: "/shop?gender=women" },
  { label: "New Collection", to: "/shop?tag=new" },
  { label: "Best Sellers", to: "/shop?tag=best_seller" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const RECENT_KEY = "ff_recent_searches";

const Navbar = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")); } catch { setRecent([]); }
  }, []);

  const fetchSuggestions = useCallback((v) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!v.trim()) return setSuggestions([]);
      try { const { data } = await getSearchSuggestions(v); setSuggestions(data.suggestions); } catch { setSuggestions([]); }
    }, 250);
  }, []);

  const saveRecent = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recent.filter(t => t !== term)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const submitSearch = (term) => {
    const v = term ?? query;
    if (!v.trim()) return;
    saveRecent(v.trim());
    setSearchOpen(false); setQuery(""); setSuggestions([]);
    navigate(`/shop?search=${encodeURIComponent(v.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-xl tracking-widest2">FELT &amp; FORM</Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to}
              className="stitch-underline bg-no-repeat pb-1 text-sm text-ink/80 transition-colors hover:text-ink"
              style={{ backgroundSize: "0 1.5px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundSize = "100% 1.5px")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundSize = "0 1.5px")}
            >{link.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Search" onClick={() => setSearchOpen(v => !v)} className="text-ink hover:text-charcoal"><Search size={20} /></button>
          <Link to="/wishlist" aria-label="Wishlist" className="relative text-ink hover:text-charcoal">
            <Heart size={20} />
            {wishlistItems.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-paper">{wishlistItems.length}</span>}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative text-ink hover:text-charcoal">
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-paper">{itemCount}</span>}
          </Link>
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated ? (
            <Link to={isAdmin ? "/admin" : "/profile"} aria-label="Account" className="text-ink hover:text-charcoal"><User size={20} /></Link>
          ) : (
            <Link to="/login" className="hidden text-xs uppercase tracking-wide text-ink underline sm:block">Login / Register</Link>
          )}
          <button className="text-ink lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-ink/10 bg-paper">
            <div className="mx-auto max-w-3xl px-4 py-5">
              <div className="flex items-center gap-3 border-b border-ink pb-2">
                <Search size={18} className="text-charcoal/50" />
                <input autoFocus value={query} onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value); }}
                  onKeyDown={e => e.key === "Enter" && submitSearch()}
                  placeholder="Search products, categories, colors..."
                  className="w-full bg-transparent py-1 text-sm outline-none" />
                <button onClick={() => setSearchOpen(false)} aria-label="Close"><X size={18} /></button>
              </div>
              {!query && recent.length > 0 && (
                <div className="mt-4">
                  <p className="eyebrow mb-2">Recent</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map(t => <button key={t} onClick={() => submitSearch(t)} className="border border-ink/15 px-3 py-1 text-xs text-charcoal/70 hover:border-ink">{t}</button>)}
                  </div>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="mt-4 divide-y divide-ink/10">
                  {suggestions.map(p => (
                    <Link key={p.id} to={`/product/${p.slug}`} onClick={() => { saveRecent(query); setSearchOpen(false); setQuery(""); }} className="flex items-center gap-3 py-2.5 hover:bg-cream">
                      <img src={getPrimaryImage(p)} alt={p.name} className="h-12 w-10 object-cover" />
                      <div><p className="text-sm">{p.name}</p><p className="text-xs text-charcoal/60">{formatPrice(getFinalPrice(p.price, p.discount))}</p></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }}
              onClick={e => e.stopPropagation()} className="absolute right-0 top-0 flex h-full w-72 flex-col gap-1 bg-paper p-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-lg tracking-widest2">MENU</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close"><X size={22} /></button>
              </div>
              {NAV_LINKS.map(link => <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="border-b border-ink/10 py-3 text-sm">{link.label}</Link>)}
              {!isAuthenticated && <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-6 text-center">Login / Register</Link>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
