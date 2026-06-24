import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Users, Tag, Mail, RotateCcw, Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { label:"Dashboard",       to:"/admin",              icon:LayoutDashboard },
  { label:"Products",        to:"/admin/products",     icon:Package        },
  { label:"Categories",      to:"/admin/categories",   icon:FolderOpen     },
  { label:"Orders",          to:"/admin/orders",       icon:ShoppingCart   },
  { label:"Returns",         to:"/admin/returns",      icon:RotateCcw      },
  { label:"Customers",       to:"/admin/customers",    icon:Users          },
  { label:"Coupons",         to:"/admin/coupons",      icon:Tag            },
  { label:"Email Logs",      to:"/admin/email-logs",   icon:Mail           },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  const Sidebar = () => (
    <aside className="flex flex-col w-56 bg-ink text-paper h-full">
      <div className="p-5 pb-3 border-b border-paper/10">
        <p className="font-display text-lg tracking-widest2">FELT &amp; FORM</p>
        <p className="text-xs text-paper/50 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${active ? "bg-paper/15 text-paper" : "text-paper/60 hover:bg-paper/10 hover:text-paper"}`}>
              <Icon size={16} />{label}
            </Link>
          );
        })}
      </nav>
      <button onClick={handleLogout} className="flex items-center gap-3 p-5 text-sm text-paper/50 hover:text-paper transition-colors border-t border-paper/10">
        <LogOut size={16} /> Sign Out
      </button>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <div className="hidden lg:flex"><Sidebar /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10"><Sidebar /></div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-ink/10 bg-paper px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink"><Menu size={22} /></button>
          <div className="flex-1 lg:hidden" />
          <Link to="/" target="_blank" className="text-xs text-charcoal/60 hover:text-ink">View Store →</Link>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};
export default AdminLayout;
