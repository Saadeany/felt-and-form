import React, { useState, useRef, useEffect } from "react";
import { Bell, Package, Tag, Megaphone, ShieldAlert, UserPlus, Mail, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";

const TYPE_CONFIG = {
  order_confirmed:  { icon: Package,   color: "text-green-600",  bg: "bg-green-50" },
  order_processing: { icon: Package,   color: "text-blue-600",   bg: "bg-blue-50" },
  order_shipped:    { icon: Package,   color: "text-purple-600", bg: "bg-purple-50" },
  order_delivered:  { icon: Package,   color: "text-green-700",  bg: "bg-green-50" },
  order_cancelled:  { icon: Package,   color: "text-red-600",    bg: "bg-red-50" },
  promo:            { icon: Megaphone, color: "text-amber-600",  bg: "bg-amber-50" },
  coupon:           { icon: Tag,       color: "text-teal-600",   bg: "bg-teal-50" },
  admin_new_order:  { icon: Package,   color: "text-ink",        bg: "bg-cream" },
  admin_low_stock:  { icon: ShieldAlert,color: "text-red-600",   bg: "bg-red-50" },
  admin_new_user:   { icon: UserPlus,  color: "text-blue-600",   bg: "bg-blue-50" },
  admin_contact:    { icon: Mail,      color: "text-ink",        bg: "bg-cream" },
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, read, readAll, remove, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative text-ink hover:text-charcoal"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-paper">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-3 w-80 bg-paper border border-ink/10 shadow-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
              <h3 className="text-sm font-medium">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={readAll} className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-ink">
                    <Check size={12} /> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-charcoal/50 hover:text-red-500">
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-ink/5">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={24} className="mx-auto mb-2 text-charcoal/20" />
                  <p className="text-xs text-charcoal/50">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const { icon: Icon, color, bg } = TYPE_CONFIG[n.type] || TYPE_CONFIG.promo;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.is_read ? "bg-paper" : "bg-cream/60"}`}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                        <Icon size={14} className={color} />
                      </div>
                      <button
                        onClick={() => !n.is_read && read(n.id)}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className={`text-xs font-medium leading-snug ${n.is_read ? "text-charcoal/70" : "text-ink"}`}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-charcoal/55 leading-snug">{n.message}</p>
                        <p className="mt-1 text-[10px] text-charcoal/40">{timeAgo(n.createdAt)}</p>
                      </button>
                      <button
                        onClick={() => remove(n.id)}
                        className="shrink-0 text-charcoal/30 hover:text-red-400 mt-0.5"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
