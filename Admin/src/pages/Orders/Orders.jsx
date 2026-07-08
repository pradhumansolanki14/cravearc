import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { FiShoppingBag, FiClock, FiTruck, FiCheckCircle, FiRefreshCw, FiDollarSign, FiUser, FiMapPin, FiPhone, FiAlertCircle } from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import { Card, Badge, Button } from "../../components/ui";

const statusConfig = {
  "Food Processing": {
    badge: "warning",
    icon: <FiClock size={16} />,
    barClass: "bg-amber-400 w-1/3",
  },
  "Out for Delivery": {
    badge: "blue",
    icon: <FiTruck size={16} />,
    barClass: "bg-blue-400 w-2/3",
  },
  "Delivered": {
    badge: "success",
    icon: <FiCheckCircle size={16} />,
    barClass: "bg-emerald-500 w-full",
  },
};

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantFilter, setRestaurantFilter] = useState("All");
  const [restaurantMap, setRestaurantMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const { adminRole } = useAdmin();
  const adminToken = localStorage.getItem("adminToken");

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url + "/api/order/list", { headers: { token: adminToken } });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch {
      toast.error("Error fetching orders");
    }
    setLoading(false);
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${url}/api/admin/restaurant/`, { headers: { token: adminToken } });
      if (res.data.success) {
        setRestaurants(res.data.data);
        const mapping = {};
        res.data.data.forEach(r => {
          mapping[r._id] = r.name;
        });
        setRestaurantMap(mapping);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", { orderId, status: event.target.value }, { headers: { token: adminToken } });
      if (response.data.success) {
        toast.success("Order status updated successfully!");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch {
      toast.error("Error updating status");
    }
  };

  useEffect(() => { 
    fetchAllOrders(); 
    if (adminRole === 'superadmin') {
      fetchRestaurants();
    }
  }, [adminRole]);

  const currentOrders = (adminRole === 'superadmin' && restaurantFilter !== "All")
    ? orders.filter(o => o.restaurantId === restaurantFilter)
    : orders;

  const filtered = filter === "All" ? currentOrders : currentOrders.filter(o => o.status === filter);

  const stats = {
    total: currentOrders.length,
    processing: currentOrders.filter(o => o.status === "Food Processing").length,
    delivery: currentOrders.filter(o => o.status === "Out for Delivery").length,
    delivered: currentOrders.filter(o => o.status === "Delivered").length,
    revenue: currentOrders.reduce((a, b) => a + b.amount, 0),
  };

  return (
    <div className="max-w-5xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiShoppingBag size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Manage Orders</h1>
            <p className="text-slate-405 text-xs font-semibold">{currentOrders.length} total orders received</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {adminRole === 'superadmin' && (
            <select
              value={restaurantFilter}
              onChange={e => setRestaurantFilter(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-205 focus:border-emerald-500 rounded-xl text-2xs font-bold uppercase tracking-wider text-slate-655 outline-none cursor-pointer"
            >
              <option value="All">All Restaurants</option>
              {restaurants.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          )}
          <Button 
            onClick={fetchAllOrders}
            variant="outline" 
            size="sm"
            leftIcon={<FiRefreshCw size={12} />}
            className="font-bold border-slate-200 text-slate-655 bg-white hover:bg-slate-50"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stats block ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total, icon: <FiShoppingBag size={16} />, variant: "neutral" },
          { label: "Processing", value: stats.processing, icon: <FiClock size={16} />, variant: "warning" },
          { label: "On the Way", value: stats.delivery, icon: <FiTruck size={16} />, variant: "blue" },
          { label: "Delivered", value: stats.delivered, icon: <FiCheckCircle size={16} />, variant: "success" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100/70 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              s.variant === 'success' ? 'bg-emerald-50 text-emerald-600' :
              s.variant === 'warning' ? 'bg-amber-50 text-amber-600' :
              s.variant === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
            }`}>
              {s.icon}
            </div>
            <div>
              <p className="text-lg font-poppins font-extrabold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Summary Banner ── */}
      <Card variant="default" radius="2xl" padding="md" className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 flex items-center justify-between text-white border-0 shadow-emerald-lg">
        <div>
          <p className="text-emerald-100 text-2xs font-extrabold uppercase tracking-widest mb-1 leading-none">Restaurant Revenue Summary</p>
          <p className="font-poppins font-extrabold text-3xl tracking-tight">${stats.revenue.toFixed(2)}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
          <FiDollarSign size={24} />
        </div>
      </Card>

      {/* ── Filters Scroll Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {["All", "Food Processing", "Out for Delivery", "Delivered"].map((f) => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider border transition-all duration-200 ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white border border-slate-205 text-slate-500 hover:border-slate-350 hover:text-slate-700'
            }`}
          >
            <span>{f}</span>
            <span className="text-[10px] ml-1 bg-slate-100 text-slate-655 px-1.5 py-0.5 rounded font-extrabold">
              {f === "All" ? stats.total : f === "Food Processing" ? stats.processing : f === "Out for Delivery" ? stats.delivery : stats.delivered}
            </span>
          </button>
        ))}
      </div>

      {/* ── Orders Listing ── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center p-8">
          <FiAlertCircle size={28} className="text-slate-350 mb-3 animate-bounce" />
          <p className="font-bold text-slate-755 text-sm">No orders found</p>
          <p className="text-xs text-slate-400 mt-1">
            {filter !== "All" ? `You have no active orders in "${filter}" stage.` : "No customer orders have been received yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, index) => {
            const sc = statusConfig[order.status] || statusConfig["Food Processing"];
            return (
              <div 
                key={index}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-card transition-all duration-300 overflow-hidden animate-fadeUp"
              >
                {/* Status indicator Progress Line */}
                <div className="h-1.5 bg-slate-50 border-b border-slate-100 w-full">
                  <div className={`h-full ${sc.barClass} transition-all duration-500 rounded-full`} />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    
                    {/* Left icon marker block */}
                    <div className="flex items-center gap-3 lg:flex-col lg:items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-150/60 flex items-center justify-center text-slate-655 flex-shrink-0 shadow-3xs">
                        {sc.icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-2.5 bg-slate-100 px-2 py-0.5 rounded">
                        #{String(index + 1).padStart(4, '0')}
                      </span>
                    </div>

                    {/* Content grids split columns */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Items lists */}
                      <div>
                        {adminRole === 'superadmin' && order.restaurantId && (
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-705">
                              Store: {restaurantMap[order.restaurantId] || "Loading..."}
                            </span>
                          </div>
                        )}
                        <p className="text-[10px] font-bold text-slate-405 uppercase tracking-widest mb-3.5">Items Ordered</p>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                          {order.items.map((item, i) => (
                            <span key={i} className="block mb-1.5">
                              <span className="font-extrabold text-emerald-650 bg-emerald-50 px-1.5 py-0.5 rounded mr-1.5">×{item.quantity}</span>
                              {item.name}
                            </span>
                          ))}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3.5">
                          Total items: {order.items.length}
                        </p>
                      </div>

                      {/* Customer Address Details */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-405 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                          <FiUser className="text-slate-400" /> Customer & Delivery
                        </p>
                        <p className="text-xs font-bold text-slate-905">{order.address.firstName} {order.address.lastName}</p>
                        <div className="mt-2 space-y-1 text-slate-500 font-medium text-xs leading-relaxed">
                          <p className="flex items-center gap-1"><FiMapPin className="text-slate-350" size={11} /> {order.address.street}</p>
                          <p className="text-2xs text-slate-400 pl-4">{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                          <p className="flex items-center gap-1 mt-2 text-slate-700 font-semibold"><FiPhone className="text-slate-350" size={11} /> {order.address.phone}</p>
                        </div>
                      </div>

                      {/* Payment values & status select dropdowns */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-405 uppercase tracking-widest mb-2.5">Total & Status Action</p>
                          <p className="font-poppins font-extrabold text-2xl text-slate-900 leading-none mb-4">${order.amount.toFixed(2)}</p>
                        </div>
                        
                        <select
                          onChange={(e) => statusHandler(e, order._id)}
                          value={order.status}
                          className={`text-2xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border-2 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-350 transition-all duration-300 w-full ${
                            order.status === "Delivered" 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-805" 
                              : order.status === "Out for Delivery"
                                ? "bg-blue-50 border-blue-105 text-blue-805"
                                : "bg-amber-50 border-amber-105 text-amber-805"
                          }`}
                        >
                          <option value="Food Processing">Food Processing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
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
