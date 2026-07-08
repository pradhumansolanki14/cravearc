import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUsers, FiShoppingBag, FiDollarSign, FiX, FiChevronRight, FiUser, FiPhone, FiMail, FiCalendar, FiSearch, FiAlertCircle } from "react-icons/fi";
import { Card, Badge, Button, Input } from "../../components/ui";

const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const adminToken = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/admin/users`, { headers: { token: adminToken } });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const fetchUserDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${url}/api/admin/users/${id}`, { headers: { token: adminToken } });
      if (res.data.success) {
        setUserDetail(res.data.data);
      }
    } catch {}
    setDetailLoading(false);
  };

  const openUser = (user) => {
    setSelected(user);
    fetchUserDetail(user._id);
  };

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    totalRevenue: users.reduce((a, b) => a + (b.totalSpent || 0), 0),
    totalOrders: users.reduce((a, b) => a + (b.orderCount || 0), 0),
  };

  return (
    <div className="max-w-5xl animate-fadeUp space-y-6">
      
      {/* User detail modal */}
      {selected && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(5px)" }} 
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <Card variant="default" radius="3xl" padding="none" className="bg-white shadow-2xl w-full max-w-lg overflow-hidden animate-fadeUp max-h-[85vh] flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
            
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-lg flex-shrink-0">
                    {selected.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-poppins font-extrabold text-base text-slate-905 leading-none">{selected.name}</h2>
                    <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider mt-1">{selected.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Orders Placed", value: selected.orderCount || 0, icon: <FiShoppingBag size={14} className="text-blue-500" /> },
                  { label: "Total Spent", value: `$${(selected.totalSpent || 0).toFixed(0)}`, icon: <FiDollarSign size={14} className="text-emerald-500" /> },
                  { label: "Phone Number", value: selected.phone || "N/A", icon: <FiPhone size={14} className="text-amber-500" /> },
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100/50 rounded-2xl text-center">
                    <div className="flex justify-center mb-1.5">{s.icon}</div>
                    <p className="font-poppins font-bold text-slate-900 text-sm leading-none">{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <FiShoppingBag className="text-slate-400" /> Order History
                </h3>
                
                {detailLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                  </div>
                ) : userDetail?.orders?.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
                    {userDetail.orders.map((order, i) => {
                      const statusColors = { 
                        "Food Processing": "warning", 
                        "Out for Delivery": "blue", 
                        "Delivered": "success" 
                      };
                      return (
                        <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150/45 transition-colors">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-xs font-bold text-slate-750 truncate">{order.items?.map(it => it.name).join(", ")}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-poppins font-extrabold text-slate-900 text-sm leading-none">${order.amount}</p>
                            <div className="mt-1.5">
                              <Badge variant={statusColors[order.status] || 'neutral'} size="sm">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-xs font-semibold">No order history found for this account.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiUsers size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Users</h1>
            <p className="text-slate-405 text-xs font-semibold">{users.length} registered user profiles</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full sm:w-72 focus-within:border-emerald-450 transition-colors shadow-2xs">
          <FiSearch className="text-slate-400 flex-shrink-0" size={16} />
          <input 
            type="text" 
            placeholder="Search users by name/email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium" 
          />
        </div>
      </div>

      {/* ── Stats Indicators ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: stats.total, icon: <FiUsers size={16} />, color: "bg-blue-50/50 border-blue-105 text-blue-650" },
          { label: "Total Orders", value: stats.totalOrders, icon: <FiShoppingBag size={16} />, color: "bg-amber-50/50 border-amber-105 text-amber-650" },
          { label: "Net Platform Revenue", value: `$${stats.totalRevenue.toFixed(0)}`, icon: <FiDollarSign size={16} />, color: "bg-emerald-50/50 border-emerald-105 text-emerald-650" },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 shadow-sm ${s.color}`}>
            <div className="w-9 h-9 bg-white border border-slate-100/80 rounded-xl flex items-center justify-center">
              {s.icon}
            </div>
            <div>
              <p className="text-lg font-poppins font-extrabold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Grid view ── */}
      <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[2.5fr_2.5fr_1fr_1fr_auto] gap-4 px-6 py-4.5 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          <span>Customer Name</span>
          <span>Email Address</span>
          <span className="text-center">Orders</span>
          <span>Total Spent</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-440 text-center p-8">
            <FiAlertCircle size={28} className="text-slate-350 mb-3" />
            <p className="font-bold text-slate-705 text-sm">{search ? 'No users matched' : 'No users registered yet'}</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filter query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <div 
                key={user._id} 
                className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[2.5fr_2.5fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-slate-50/40 transition-colors cursor-pointer group" 
                onClick={() => openUser(user)}
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-805 text-xs sm:text-sm truncate group-hover:text-emerald-650 transition-colors">{user.name}</p>
                    <p className="sm:hidden text-2xs text-slate-400 font-bold truncate mt-0.5">{user.email}</p>
                  </div>
                </div>

                {/* Email */}
                <p className="hidden sm:block text-xs font-semibold text-slate-500 truncate">{user.email}</p>

                {/* Orders count */}
                <span className="hidden sm:flex items-center justify-center w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 mx-auto">
                  {user.orderCount || 0}
                </span>

                {/* Total spent */}
                <p className="hidden sm:block font-poppins font-extrabold text-emerald-650 text-sm">${(user.totalSpent || 0).toFixed(0)}</p>

                {/* Open detail arrow */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-350 hover:text-emerald-600 hover:bg-emerald-50 transition-colors ml-auto sm:ml-0">
                  <FiChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default Users;
