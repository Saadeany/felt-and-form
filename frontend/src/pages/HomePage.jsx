import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getProducts, getCategories } from "../api/products";
import ProductCard from "../components/product/ProductCard";
import QuickViewModal from "../components/product/QuickViewModal";
import Loader from "../components/common/Loader";

const CATEGORY_ICONS = {
  Men: "👔", Women: "👗", Hoodies: "🧥", "T-Shirts": "👕",
  Pants: "👖", Oversized: "📦", Accessories: "🎒",
};

const SectionHeader = ({ eyebrow, title, to }) => (
  <div className="mb-10 flex items-end justify-between">
    <div>
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
      <div className="stitch-rule mt-3 w-24 text-ink" />
    </div>
    {to && (
      <Link to={to} className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-charcoal/70 hover:text-ink">
        View All <ArrowRight size={14} />
      </Link>
    )}
  </div>
);

const ProductSection = ({ eyebrow, title, to, products, onQuickView }) => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <SectionHeader eyebrow={eyebrow} title={title} to={to} />
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
      ))}
    </div>
  </section>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [na, bs, tr, sl, cats] = await Promise.all([
          getProducts({ tag: "new", limit: 4 }),
          getProducts({ tag: "best_seller", limit: 4 }),
          getProducts({ tag: "trending", limit: 4 }),
          getProducts({ tag: "sale", limit: 4 }),
          getCategories(),
        ]);
        setNewArrivals(na.data.products);
        setBestSellers(bs.data.products);
        setTrending(tr.data.products);
        setSaleItems(sl.data.products);
        setCategories(cats.data.categories);
      } catch {
        // ignore network errors — sections just stay empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-ink">
        {/* Stitched frame border */}
        <div
          className="pointer-events-none absolute inset-6 border border-dashed border-paper/20"
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center gap-6 px-4 text-center"
        >
          <p className="eyebrow text-paper/60">Cairo · Egypt</p>
          <h1 className="font-display text-6xl leading-none tracking-widest2 text-paper sm:text-8xl lg:text-[9rem]">
            FELT<br />&amp;<br />FORM
          </h1>
          <div className="stitch-rule w-28 text-paper/40" />
          <p className="max-w-sm text-sm leading-relaxed tracking-wide text-paper/70 sm:text-base">
            Heavyweight basics and considered silhouettes.<br />Built to outlast the season.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate("/shop")}
            className="mt-2 border border-paper px-10 py-4 text-xs uppercase tracking-widest text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            Shop Now
          </motion.button>
        </motion.div>

        {/* Ambient gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60" aria-hidden />
      </section>

      {/* ── Featured Categories ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Browse by" title="Categories" />
        {loading ? <Loader /> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-4 border border-ink/10 bg-cream p-6 text-center hover:border-ink transition-colors"
                >
                  <span className="text-3xl">{CATEGORY_ICONS[cat.name] || "🏷️"}</span>
                  <span className="text-sm uppercase tracking-wide">{cat.name}</span>
                  <ChevronRight size={14} className="text-charcoal/40 group-hover:text-ink transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── New Arrivals ───────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <div className="bg-cream">
          <ProductSection
            eyebrow="Just landed"
            title="New Arrivals"
            to="/shop?tag=new"
            products={newArrivals}
            onQuickView={setQuickViewProduct}
          />
        </div>
      )}

      {/* ── Split Banner ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2">
        <Link
          to="/shop?gender=men"
          className="group relative flex min-h-64 flex-col items-start justify-end overflow-hidden bg-charcoal p-8"
        >
          <div className="pointer-events-none absolute inset-4 border border-dashed border-paper/10 transition-all duration-500 group-hover:inset-2" aria-hidden />
          <p className="eyebrow text-paper/60 mb-2">Explore</p>
          <h3 className="font-display text-4xl text-paper">Men</h3>
          <ArrowRight size={20} className="mt-3 text-paper/60 transition-transform group-hover:translate-x-2" />
        </Link>
        <Link
          to="/shop?gender=women"
          className="group relative flex min-h-64 flex-col items-start justify-end overflow-hidden bg-stone p-8"
        >
          <div className="pointer-events-none absolute inset-4 border border-dashed border-ink/10 transition-all duration-500 group-hover:inset-2" aria-hidden />
          <p className="eyebrow text-ink/60 mb-2">Explore</p>
          <h3 className="font-display text-4xl text-ink">Women</h3>
          <ArrowRight size={20} className="mt-3 text-ink/60 transition-transform group-hover:translate-x-2" />
        </Link>
      </section>

      {/* ── Best Sellers ───────────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <ProductSection
          eyebrow="Crowd favourites"
          title="Best Sellers"
          to="/shop?tag=best_seller"
          products={bestSellers}
          onQuickView={setQuickViewProduct}
        />
      )}

      {/* ── Trending ───────────────────────────────────────────── */}
      {trending.length > 0 && (
        <div className="bg-cream">
          <ProductSection
            eyebrow="Right now"
            title="Trending"
            to="/shop?tag=trending"
            products={trending}
            onQuickView={setQuickViewProduct}
          />
        </div>
      )}

      {/* ── Sale ───────────────────────────────────────────────── */}
      {saleItems.length > 0 && (
        <>
          <section className="bg-ink py-10 text-center text-paper">
            <p className="eyebrow text-paper/50 mb-3">Limited time</p>
            <h2 className="font-display text-5xl">Sale</h2>
            <div className="stitch-rule mx-auto mt-4 w-20 text-paper/30" />
            <p className="mt-4 text-sm text-paper/60">Selected lines up to 20% off. While stocks last.</p>
          </section>
          <ProductSection
            eyebrow="Marked down"
            title="Sale Items"
            to="/shop?tag=sale"
            products={saleItems}
            onQuickView={setQuickViewProduct}
          />
        </>
      )}

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
};

export default HomePage;
