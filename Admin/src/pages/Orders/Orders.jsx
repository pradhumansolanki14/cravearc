import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const statusConfig = {
  "Food Processing": {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: "👨‍🍳",
    bar: "bg-amber-400",
    width: "w-1/3",
  },
  "Out for Delivery": {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: "🛵",
    bar: "bg-blue-400",
    width: "w-2/3",
  },
  "Delivered": {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: "✅",
    bar: "bg-emerald-400",
    width: "w-full",
  },
};

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const adminToken = localStorage.getItem("adminToken");

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url + "/api/order/list", { headers: { token: adminToken } });
      if (response.data.success) setOrders(response.data.data);
      else toast.error("Error fetching orders");
    } catch {
      toast.error("Error fetching orders");
    }
    setLoading(false);
  };

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url + "/api/order/status", { orderId, status: event.target.value }, { headers: { token: adminToken } });
    if (response.data.success) await fetchAllOrders();
  };

  useEffect(() => { fetchAllOrders(); }, []);

  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === "Food Processing").length,
    delivery: orders.filter(o => o.status === "Out for Delivery").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    revenue: orders.reduce((a, b) => a + b.amount, 0),
  };

  return (
    <div className="max-w-5xl animate-fadeUp">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-xl">📦</div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-400 text-sm">{orders.length} total orders</p>
        </div>
        <button onClick={fetchAllOrders}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-500 text-xs font-semibold rounded-xl transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: stats.total, icon: "📋", color: "text-slate-900" },
          { label: "Processing", value: stats.processing, icon: "👨‍🍳", color: "text-amber-600" },
          { label: "On the Way", value: stats.delivery, icon: "🛵", color: "text-blue-600" },
          { label: "Delivered", value: stats.delivered, icon: "✅", color: "text-emerald-600" },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-card p-4 animate-fadeUp delay-${(i+1)*100}`}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-orange-100 text-sm font-medium mb-1">Total Revenue</p>
          <p className="font-display text-3xl font-bold text-white">${stats.revenue.toFixed(2)}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">💰</div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {["All", "Food Processing", "Out for Delivery", "Delivered"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              filter === f
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}>
            {f} {f === "All" ? `(${stats.total})` : f === "Food Processing" ? `(${stats.processing})` : f === "Out for Delivery" ? `(${stats.delivery})` : `(${stats.delivered})`}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-xl w-3/4" />
                  <div className="h-3 bg-slate-50 rounded-xl w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
          <span className="text-5xl mb-4">📭</span>
          <p className="font-semibold text-slate-700">No orders found</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter !== "All" ? `No "${filter}" orders` : "No orders placed yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, index) => {
            const sc = statusConfig[order.status] || statusConfig["Food Processing"];
            return (
              <div key={index}
                className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-slate-100 w-full">
                  <div className={`h-full ${sc.bar} ${sc.width} transition-all duration-500 rounded-full`} />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    {/* Icon + Order ID */}
                    <div className="flex items-center gap-3 lg:block">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0">
                        {sc.icon}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-2 hidden lg:block">
                        #{String(index + 1).padStart(4, '0')}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* Items */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Items Ordered</p>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                          {order.items.map((item, i) => (
                            <span key={i}>{item.name} <span className="text-slate-400">×{item.quantity}</span>{i < order.items.length - 1 ? ", " : ""}</span>
                          ))}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                      </div>

                      {/* Customer */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Customer</p>
                        <p className="text-sm font-bold text-slate-900">{order.address.firstName} {order.address.lastName}</p>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-slate-400">{order.address.street},</p>
                          <p className="text-xs text-slate-400">{order.address.city}, {order.address.state}</p>
                          <p className="text-xs text-slate-500 font-medium">{order.address.phone}</p>
                        </div>
                      </div>

                      {/* Amount + Status */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount & Status</p>
                        <p className="text-xl font-display font-bold text-slate-900 mb-3">${order.amount}</p>
                        <select
                          onChange={(e) => statusHandler(e, order._id)}
                          value={order.status}
                          className={`text-xs font-semibold px-3 py-2.5 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all w-full ${sc.badge}`}
                        >
                          <option value="Food Processing">👨‍🍳 Food Processing</option>
                          <option value="Out for Delivery">🛵 Out for Delivery</option>
                          <option value="Delivered">✅ Delivered</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
