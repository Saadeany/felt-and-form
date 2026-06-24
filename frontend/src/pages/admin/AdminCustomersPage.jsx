import React, { useState, useEffect, useCallback } from "react";
import { Search, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { getAdminUsers, toggleBlockUser, deleteUser } from "../../api/admin";
import Loader from "../../components/common/Loader";

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ search, page, limit: 20 });
      setUsers(data.users); setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Customers</h1>
      <div className="flex items-center gap-2 border border-ink/15 px-3 py-2 max-w-xs">
        <Search size={15} className="text-charcoal/40 shrink-0" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..." className="w-full bg-transparent text-sm outline-none" />
      </div>
      {loading ? <Loader /> : (
        <div className="overflow-x-auto border border-ink/10">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-cream">
              <tr>{["Name","Email","Phone","Status","Joined",""].map((h) => <th key={h} className="px-4 py-3 text-left eyebrow text-charcoal/60 font-normal">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-charcoal/70">{u.email}</td>
                  <td className="px-4 py-3 text-charcoal/60">{u.phone || "—"}</td>
                  <td className="px-4 py-3"><span className={u.is_blocked ? "text-red-500" : "text-green-600"}>{u.is_blocked ? "Blocked" : "Active"}</span></td>
                  <td className="px-4 py-3 text-charcoal/50 text-xs">{new Date(u.createdAt).toLocaleDateString("en-EG")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={async () => { await toggleBlockUser(u.id); fetch(); }} title={u.is_blocked ? "Unblock" : "Block"} className="text-charcoal/50 hover:text-ink">
                        {u.is_blocked ? <ShieldCheck size={15} /> : <ShieldBan size={15} />}
                      </button>
                      <button onClick={async () => { if (window.confirm("Delete this customer?")) { await deleteUser(u.id); fetch(); } }} className="text-charcoal/50 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
