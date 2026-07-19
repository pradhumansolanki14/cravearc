import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import api from "../../lib/axios"
import {
  FiShoppingBag, FiClock, FiTruck, FiCheckCircle,
  FiRefreshCw, FiDollarSign, FiUser, FiMapPin, FiPhone, FiAlertCircle,
  FiTag
} from "react-icons/fi"
import { useAdmin } from "../../context/AdminContext"
import { Card, Badge } from "../../components/ui"

const statusConfig = {
  "Food Processing": {
    badge: "warning",
    icon: <FiClock size={14} />,
    colorClass: "text-amber-600 bg-amber-50 border-amber-100",
  },
  "Out for Delivery": {
    badge: "blue",
    icon: <FiTruck size={14} />,
    colorClass: "text-blue-600 bg-blue-50 border-blue-100",
  },
  "Delivered": {
    badge: "success",
    icon: <FiCheckCircle size={14} />,
    colorClass: "text-emerald-605 bg-emerald-50 border-emerald-100",
  },
}

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [restaurantFilter, setRestaurantFilter] = useState("All")
  const [restaurantMap, setRestaurantMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { adminRole, formatPrice } = useAdmin()
  const adminToken = localStorage.getItem("adminToken")

  const fetchAllOrders = async () => {
    setLoading(true)
    try {
      const response = await api.get("/api/order/list")
      if (response.data.success) {
        setOrders(response.data.data)
        // Auto-select first order if none selected
        if (response.data.data.length > 0) {
          setSelectedOrder(response.data.data[0])
        }
      } else {
        toast.error("Error fetching orders")
      }
    } catch {
      toast.error("Error fetching orders")
    }
    setLoading(false)
  }

  const fetchRestaurants = async () => {
    try {
      const res = await api.get(`/api/admin/restaurant/`)
      if (res.data.success) {
        setRestaurants(res.data.data)
        const mapping = {}
        res.data.data.forEach(r => {
          mapping[r._id] = r.name
        })
        setRestaurantMap(mapping)
      }
    } catch { }
  }

  const statusHandler = async (newStatus, orderId) => {
    try {
      const response = await api.post("/api/order/status", { orderId, status: newStatus })
      if (response.data.success) {
        toast.success("Order status updated!")

        // Update local list & selected state
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
        setSelectedOrder(prev => prev && prev._id === orderId ? { ...prev, status: newStatus } : prev)
      } else {
        toast.error(response.data.message || "Failed to update status")
      }
    } catch {
      toast.error("Error updating status")
    }
  }

  useEffect(() => {
    fetchAllOrders()
    if (adminRole === 'superadmin') {
      fetchRestaurants()
    }
  }, [adminRole])

  const currentOrders = (adminRole === 'superadmin' && restaurantFilter !== "All")
    ? orders.filter(o => o.restaurantId === restaurantFilter)
    : orders

  const filtered = filter === "All" ? currentOrders : currentOrders.filter(o => o.status === filter)

  const stats = {
    total: currentOrders.length,
    processing: currentOrders.filter(o => o.status === "Food Processing").length,
    delivery: currentOrders.filter(o => o.status === "Out for Delivery").length,
    delivered: currentOrders.filter(o => o.status === "Delivered").length,
    revenue: currentOrders.reduce((a, b) => a + b.amount, 0),
  }

  return (
    <div className="max-w-6xl space-y-6 animate-fadeUp">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-905">Orders Queue</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">{currentOrders.length} culinary order receipts</p>
        </div>
        <div className="flex items-center gap-2">
          {adminRole === 'superadmin' && (
            <select
              value={restaurantFilter}
              onChange={e => setRestaurantFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-500 outline-none cursor-pointer"
            >
              <option value="All">All Restaurants</option>
              {restaurants.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={fetchAllOrders}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-bold transition-all bg-white"
          >
            <FiRefreshCw size={12} />
            <span>Sync queue</span>
          </button>
        </div>
      </div>

      {/* ── Metric Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Gross Value", value: formatPrice(stats.revenue), icon: <FiTag size={14} />, color: "bg-emerald-50 text-emerald-655" },
          { label: "All Orders", value: stats.total, icon: <FiShoppingBag size={14} />, color: "bg-zinc-50 text-zinc-500" },
          { label: "In Kitchen", value: stats.processing, icon: <FiClock size={14} />, color: "bg-amber-50 text-amber-600" },
          { label: "In Transit", value: stats.delivery, icon: <FiTruck size={14} />, color: "bg-blue-50 text-blue-600" },
          { label: "Completed", value: stats.delivered, icon: <FiCheckCircle size={14} />, color: "bg-emerald-50 text-emerald-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200/60 p-4 shadow-premium flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-mono font-bold text-zinc-900 leading-none">{s.value}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters Filter pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {["All", "Food Processing", "Out for Delivery", "Delivered"].map((f) => {
          const qty = f === "All" ? stats.total : f === "Food Processing" ? stats.processing : f === "Out for Delivery" ? stats.delivery : stats.delivered
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all duration-200 ${filter === f
                  ? 'bg-zinc-950 text-white border-zinc-955 shadow-sm'
                  : 'bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-450 hover:text-zinc-700'
                }`}
            >
              <span>{f}</span>
              <span className="text-[9px] font-mono ml-1.5 opacity-60 font-bold">({qty})</span>
            </button>
          )
        })}
      </div>

      {/* ── Master Detail View split columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Master Orders List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-20 bg-white border border-zinc-200 rounded-xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-zinc-200/50 text-center p-6">
              <FiAlertCircle size={22} className="text-zinc-300 mb-2" />
              <p className="font-bold text-zinc-755 text-xs">No active orders</p>
            </div>
          ) : (
            filtered.map((order, idx) => {
              const sc = statusConfig[order.status] || statusConfig["Food Processing"]
              const isSelected = selectedOrder && selectedOrder._id === order._id
              return (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                      ? 'border-zinc-950 bg-zinc-50/50 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-zinc-800">
                        {order.address?.firstName} {order.address?.lastName}
                      </p>
                      <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">Order #{order._id?.slice(-6)}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-900">{formatPrice(order.amount)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
                      {order.items?.length} dish{order.items?.length !== 1 ? 'es' : ''}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${sc.colorClass}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right Column: Detail Order Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/60 rounded-xl shadow-premium p-6 space-y-6">
          {selectedOrder ? (
            <>
              {/* Top summary row */}
              <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Selected Receipt</span>
                  <h3 className="text-base font-bold text-zinc-900 mt-0.5">Order #{selectedOrder._id?.slice(-8)}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Total Price</span>
                  <p className="text-lg font-mono font-bold text-zinc-900 mt-0.5">{formatPrice(selectedOrder.amount)}</p>
                </div>
              </div>

              {/* Items listing card */}
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-zinc-450 uppercase tracking-widest">Items list</p>
                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 divide-y divide-zinc-200/50">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 text-xs font-semibold first:pt-0 last:pb-0">
                      <span className="text-zinc-800 flex items-center">
                        <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded mr-2 text-[10px] font-bold">×{item.quantity}</span>
                        {item.name}
                      </span>
                      <span className="font-mono text-zinc-500">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery client details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><FiUser /> Customer</p>
                  <p className="text-xs font-bold text-zinc-800">{selectedOrder.address?.firstName} {selectedOrder.address?.lastName}</p>
                  <p className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 mt-1"><FiPhone className="text-zinc-400" /> {selectedOrder.address?.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><FiMapPin /> Delivery Address</p>
                  <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
                    {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipcode}
                  </p>
                </div>
              </div>

              {/* Status Action controls */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-zinc-405 uppercase tracking-widest">Update State</p>
                  <p className="text-[10px] text-zinc-450 mt-0.5 font-semibold">Coordinate progress states</p>
                </div>
                <div className="flex gap-2">
                  {["Food Processing", "Out for Delivery", "Delivered"].map((st) => {
                    const isCurrent = selectedOrder.status === st
                    return (
                      <button
                        key={st}
                        onClick={() => statusHandler(st, selectedOrder._id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-colors ${isCurrent
                            ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                            : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800'
                          }`}
                      >
                        {st === "Food Processing" ? "Prepare" : st === "Out for Delivery" ? "Transit" : "Complete"}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-350 text-center">
              <FiShoppingBag size={28} className="text-zinc-250 mb-3" />
              <p className="text-xs font-bold text-zinc-500">No order selected</p>
              <p className="text-[10px] text-zinc-400 mt-1">Select an order row from the left panel to review details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

export default Orders
