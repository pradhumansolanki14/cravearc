import React, { useState, useEffect, useRef } from "react"
import api from "../../lib/axios"
import { toast } from "react-hot-toast"
import { 
  FiTag, FiPlus, FiTrash2, FiX, FiCalendar, FiClock, 
  FiActivity, FiAlertCircle, FiEdit2, FiSearch, FiSliders, FiCheck 
} from "react-icons/fi"
import { Card, Badge, ConfirmationModal } from "../../components/ui"
import { useAdmin } from "../../context/AdminContext"

const Coupons = ({ url }) => {
  const { adminRole, adminToken, restaurantId: vendorRestaurantId, formatPrice } = useAdmin()
  const [coupons, setCoupons] = useState([])
  const [restaurantsList, setRestaurantsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  
  const [form, setForm] = useState({ 
    code: "", 
    discountType: "percent", 
    discount: "", 
    minOrder: "", 
    maxUses: "100", 
    expiresAt: "", 
    description: "",
    restaurantId: "" // Empty string = Platform-Wide for superadmin
  })
  
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [restaurantFilter, setRestaurantFilter] = useState("all")
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null })

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/coupons/list`)
      if (res.data.success) {
        setCoupons(res.data.data)
      }
    } catch { 
      toast.error("Failed to load coupons database") 
    }
    setLoading(false)
  }

  const fetchRestaurants = async () => {
    if (adminRole === "superadmin") {
      try {
        const res = await api.get(`/api/food/restaurants`)
        if (res.data.success) {
          setRestaurantsList(res.data.data)
        }
      } catch (err) {
        console.error("Failed to load restaurants list:", err)
      }
    }
  }

  useEffect(() => { 
    fetchCoupons()
    fetchRestaurants()
  }, [adminToken])

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ 
      code: "", 
      discountType: "percent", 
      discount: "", 
      minOrder: "", 
      maxUses: "100", 
      expiresAt: "", 
      description: "",
      restaurantId: ""
    })
    setShowForm(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    const restId = typeof c.restaurantId === "object" ? c.restaurantId?._id : c.restaurantId
    setForm({
      code: c.code,
      discountType: c.discountType,
      discount: c.discount.toString(),
      minOrder: c.minOrder.toString(),
      maxUses: c.maxUses.toString(),
      expiresAt: formatDateTimeLocal(c.expiresAt),
      description: c.description || "",
      restaurantId: restId || ""
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.code.trim()) { toast.error("Coupon code is required"); return }
    if (!form.discount) { toast.error("Discount value is required"); return }
    if (!form.expiresAt) { toast.error("Expiration date is required"); return }

    setSaving(true)
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discount: Number(form.discount),
        minOrder: Number(form.minOrder) || 0,
        maxUses: Number(form.maxUses) || 100,
        expiresAt: new Date(form.expiresAt),
        description: form.description.trim()
      }

      // If Platform Admin, pass the selected restaurantId (or null for platform-wide)
      if (adminRole === "superadmin") {
        payload.restaurantId = form.restaurantId || null
      }

      let res
      if (editing) {
        res = await api.put(`/api/coupons/${editing._id}`, payload)
      } else {
        res = await api.post(`/api/coupons/create`, payload)
      }

      if (res.data.success) {
        toast.success(editing ? "Coupon updated successfully!" : "Promo coupon created!")
        closeForm()
        fetchCoupons()
      } else {
        toast.error(res.data.message || "Failed to save coupon")
      }
    } catch {
      toast.error("Failed to save coupon")
    }
    setSaving(false)
  }

  const toggleCoupon = async (id) => {
    try {
      const res = await api.patch(`/api/coupons/${id}/toggle`, {});
      if (res.data.success) { 
        toast.success(res.data.message || "Status updated") 
        fetchCoupons() 
      } else {
        toast.error(res.data.message || "Authorization failed")
      }
    } catch { 
      toast.error("Failed to change status") 
    }
  }

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Coupon",
      message: "Are you sure you want to permanently delete this promotional coupon? Customers won't be able to apply it after deletion.",
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }))
        try {
          const res = await api.delete(`/api/coupons/${id}`)
          if (res.data.success) { 
            toast.success("Coupon code deleted") 
            fetchCoupons() 
          } else {
            toast.error(res.data.message || "Delete failed")
          }
        } catch { 
          toast.error("Failed to delete coupon") 
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false }))
    })
  }

  // Client-side search and filters
  const filteredCoupons = coupons.filter(c => {
    // 1. Search code & description
    const matchesSearch = !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))

    // 2. Status filter
    const isExpired = new Date() > new Date(c.expiresAt)
    let matchesStatus = true
    if (statusFilter === "active") {
      matchesStatus = c.isActive && !isExpired
    } else if (statusFilter === "inactive") {
      matchesStatus = !c.isActive
    } else if (statusFilter === "expired") {
      matchesStatus = isExpired
    }

    // 3. Restaurant filter (Platform Admin only)
    let matchesRestaurant = true
    if (adminRole === "superadmin" && restaurantFilter !== "all") {
      if (restaurantFilter === "platform") {
        matchesRestaurant = !c.restaurantId
      } else {
        const restId = typeof c.restaurantId === "object" ? c.restaurantId?._id : c.restaurantId
        matchesRestaurant = restId === restaurantFilter
      }
    }

    return matchesSearch && matchesStatus && matchesRestaurant
  })

  const labelClass = "block text-[9px] font-bold text-zinc-400 uppercase tracking-widest"
  const inpClass = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-all"

  return (
    <div className="max-w-5xl space-y-6 animate-fadeUp">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
            <FiTag size={16} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">Promo Coupons</h1>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
              {loading ? "Searching coupons..." : `${filteredCoupons.length} coupon${filteredCoupons.length === 1 ? "" : "s"} found`}
            </p>
          </div>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <FiPlus size={13} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200/60 rounded-2xl">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-zinc-200 focus-within:border-zinc-950 transition-all">
          <FiSearch className="text-zinc-400" size={14} />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search coupon code or descriptions..."
            className="w-full bg-transparent border-none outline-none text-xs text-zinc-800 placeholder-zinc-400 font-semibold"
          />
          {search && <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-700"><FiX size={14} /></button>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 outline-none cursor-pointer hover:border-zinc-350 transition-colors"
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          {/* Restaurant filter (Platform Admin only) */}
          {adminRole === "superadmin" && (
            <select
              value={restaurantFilter}
              onChange={e => setRestaurantFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 outline-none cursor-pointer hover:border-zinc-350 transition-colors"
            >
              <option value="all">Restaurant: All</option>
              <option value="platform">Platform-Wide</option>
              {restaurantsList.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Form Modal Overlay ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn"
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <Card variant="default" radius="2xl" padding="none" className="bg-white shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">{editing ? "Edit Coupon" : "Create Coupon"}</h2>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                    {editing ? "Update coupon parameters" : "Fill in coupon rules and publish discount"}
                  </p>
                </div>
                <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-zinc-800 transition-all">
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Coupon Code</label>
                  <input 
                    required
                    name="code"
                    value={form.code} 
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
                    placeholder="e.g. SPECIAL50" 
                    className={`${inpClass} font-mono uppercase font-bold`}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className={labelClass}>Discount Type</label>
                  <select 
                    name="discountType"
                    value={form.discountType} 
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                    className={inpClass}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Flat INR (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Discount Value</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    name="discount"
                    value={form.discount} 
                    onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} 
                    placeholder={form.discountType === 'percent' ? '30' : '15.00'} 
                    className={inpClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Min Order Limit (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    name="minOrder"
                    value={form.minOrder} 
                    onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} 
                    placeholder="0.00" 
                    className={inpClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Max Usage Limit</label>
                  <input 
                    type="number"
                    min="1"
                    name="maxUses"
                    value={form.maxUses} 
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} 
                    className={inpClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Expiration Date</label>
                  <input 
                    required
                    type="datetime-local"
                    name="expiresAt"
                    value={form.expiresAt} 
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} 
                    className={inpClass}
                  />
                </div>

                {/* Restaurant Selection (Platform Admin only) */}
                {adminRole === "superadmin" && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className={labelClass}>Associate Restaurant</label>
                    <select
                      value={form.restaurantId}
                      onChange={e => setForm(f => ({ ...f, restaurantId: e.target.value }))}
                      className={inpClass}
                    >
                      <option value="">Platform-Wide (No restaurant limitation)</option>
                      {restaurantsList.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2 space-y-1.5">
                  <label className={labelClass}>Offer Description</label>
                  <input 
                    name="description"
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                    placeholder="e.g. 50% discount on order above ₹300" 
                    className={inpClass}
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-zinc-100">
                <button type="button" onClick={closeForm} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold rounded-lg transition-colors">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Coupon Cards Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-zinc-50 border border-zinc-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl">
          <FiTag className="mx-auto text-zinc-350 mb-3" size={32} />
          <p className="font-extrabold text-zinc-755 text-sm">No coupons found</p>
          <p className="text-2xs text-zinc-400 font-semibold mt-1">Try widening search parameters or create a new coupon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCoupons.map(c => {
            const isExpired = new Date() > new Date(c.expiresAt)
            
            // Check status tags
            let statusLabel = "Active"
            let statusStyle = "bg-emerald-50 border-emerald-150 text-emerald-700"
            if (isExpired) {
              statusLabel = "Expired"
              statusStyle = "bg-rose-50 border-rose-155 text-rose-600"
            } else if (!c.isActive) {
              statusLabel = "Inactive"
              statusStyle = "bg-zinc-50 border-zinc-200 text-zinc-500"
            }

            const usagePercent = Math.min(100, Math.round((c.usedCount / c.maxUses) * 100))

            return (
              <div 
                key={c._id} 
                className="bg-white border border-zinc-200/70 rounded-2xl overflow-hidden shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-44"
              >
                {/* Left side: Discount Indicator (Gradient) */}
                <div className={`w-full sm:w-36 flex-shrink-0 flex flex-col items-center justify-center text-white py-6 sm:py-0 relative select-none ${
                  isExpired 
                    ? 'bg-gradient-to-br from-zinc-400 to-zinc-500' 
                    : !c.isActive 
                      ? 'bg-gradient-to-br from-zinc-300 to-zinc-400' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  <span className="text-3xl font-black tracking-tight leading-none">
                    {c.discountType === 'percent' ? `${c.discount}%` : formatPrice(c.discount)}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest mt-1 opacity-90">OFF</span>
                  
                  {/* Perforated Notches for Ticket Illusion (visible on desktop) */}
                  <div className="hidden sm:block absolute -right-2 -top-2 w-4 h-4 bg-zinc-50 border border-zinc-200/80 rounded-full" />
                  <div className="hidden sm:block absolute -right-2 -bottom-2 w-4 h-4 bg-zinc-50 border border-zinc-200/80 rounded-full" />
                </div>

                {/* Right side: Coupon Details */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  {/* Top info line */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-mono text-2xs font-extrabold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 rounded cursor-pointer select-all uppercase tracking-widest text-zinc-805 transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(c.code)
                            toast.success("Coupon code copied!")
                          }}
                          title="Click to copy coupon code"
                        >
                          {c.code}
                        </span>
                        
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border ${statusStyle}`}>
                          {statusLabel}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-[11px] font-semibold text-zinc-400 mt-1.5 leading-snug truncate" title={c.description}>
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mid stats line */}
                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-dashed border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FiCalendar size={12} className="text-zinc-350 flex-shrink-0" />
                      <span className="truncate">{new Date(c.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end min-w-0">
                      <FiClock size={12} className="text-zinc-350 flex-shrink-0" />
                      <span className="truncate">Min: {formatPrice(c.minOrder)}</span>
                    </div>
                  </div>

                  {/* Bottom metrics and actions */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="min-w-0 flex-1">
                      {c.restaurantId ? (
                        <span className="inline-block text-[10px] font-bold text-zinc-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded max-w-[130px] truncate" title={c.restaurantId?.name}>
                          {c.restaurantId?.name}
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold text-zinc-500 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded">
                          Platform-Wide
                        </span>
                      )}
                      
                      {/* Usage bar */}
                      <div className="mt-2 space-y-1 max-w-[150px]">
                        <div className="flex justify-between text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                          <span>Uses</span>
                          <span>{c.usedCount}/{c.maxUses}</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              usagePercent >= 100 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`} 
                            style={{ width: `${usagePercent}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleCoupon(c._id)}
                        className={`px-2 py-1 rounded text-[8px] font-extrabold uppercase tracking-widest border transition-all ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                            : 'bg-white text-zinc-450 border-zinc-250 hover:bg-zinc-100'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
                        title="Edit details"
                      >
                        <FiEdit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete code"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    </div>
  )
}

export default Coupons
