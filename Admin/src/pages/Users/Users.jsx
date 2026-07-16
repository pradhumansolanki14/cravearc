import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { FiUsers, FiShoppingBag, FiDollarSign, FiX, FiChevronRight, FiUser, FiPhone, FiMail, FiCalendar, FiSearch, FiAlertCircle, FiTag } from "react-icons/fi"
import { Card, Badge, ConfirmationModal } from "../../components/ui"
import { useAdmin } from "../../context/AdminContext"

const Users = ({ url }) => {
  const { formatPrice } = useAdmin()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null })

  const adminToken = localStorage.getItem("adminToken")

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${url}/api/admin/users`, { headers: { token: adminToken } })
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch {
      toast.error("Failed to load user directory")
    }
    setLoading(false)
  }

  const fetchUserDetail = async (id) => {
    setDetailLoading(true)
    try {
      const res = await axios.get(`${url}/api/admin/users/${id}`, { headers: { token: adminToken } })
      if (res.data.success) {
        setUserDetail(res.data.data)
      }
    } catch { }
    setDetailLoading(false)
  }

  const openUser = (user) => {
    setSelected(user)
    fetchUserDetail(user._id)
  }

  const handleToggleUserActive = (user) => {
    const actionText = user.isActive !== false ? "suspend" : "activate"
    setConfirmDialog({
      isOpen: true,
      title: `${user.isActive !== false ? "Suspend" : "Activate"} Account`,
      message: `Are you sure you want to suspend access credentials for customer "${user.name}"?`,
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }))
        try {
          const res = await axios.put(`${url}/api/admin/users/${user._id}`, { isActive: !user.isActive }, { headers: { token: adminToken } })
          if (res.data.success) {
            toast.success(res.data.message || `Customer access updated!`)
            fetchUsers()
          } else {
            toast.error(res.data.message || "Failed to update")
          }
        } catch {
          toast.error("Failed to update user status")
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false }))
    })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    totalRevenue: users.reduce((a, b) => a + (b.totalSpent || 0), 0),
    totalOrders: users.reduce((a, b) => a + (b.orderCount || 0), 0),
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fadeUp">

      {/* Rebuilt Customer Profile Drawer Detail view */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fadeIn"
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <Card variant="default" radius="2xl" padding="none" className="bg-white shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn max-h-[80vh] flex flex-col">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 font-mono font-bold text-white text-xs flex items-center justify-center flex-shrink-0">
                    {selected.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 leading-none">{selected.name}</h2>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">{selected.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-zinc-400 hover:text-zinc-800 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {/* High density Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Orders Count", value: selected.orderCount || 0, icon: <FiShoppingBag size={12} className="text-zinc-400" /> },
                  { label: "Net Spent", value: formatPrice(selected.totalSpent || 0), icon: <FiTag size={12} className="text-emerald-500" /> },
                  { label: "Contact Phone", value: selected.phone || "None", icon: <FiPhone size={12} className="text-zinc-400" /> },
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl text-center space-y-1">
                    <div className="flex justify-center">{s.icon}</div>
                    <p className="font-mono font-bold text-zinc-900 text-xs leading-none">{s.value}</p>
                    <p className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Order history timelines */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                  <FiShoppingBag /> Order History Logs
                </h3>

                {detailLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <div key={i} className="h-10 bg-zinc-50 rounded-xl animate-pulse" />)}
                  </div>
                ) : userDetail?.orders?.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {userDetail.orders.map((order, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-xl border border-zinc-150 transition-colors">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-zinc-800 truncate">{order.items?.map(it => it.name).join(", ")}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-zinc-900 text-xs">${order.amount.toFixed(2)}</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1 rounded mt-1 inline-block">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-zinc-400 text-2xs font-semibold">No order logs registered for customer</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
            <FiUsers size={16} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">User Directory</h1>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">{users.length} customer records indexed</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-3 py-2 w-full sm:w-72 focus-within:border-zinc-950 transition-colors shadow-premium">
          <FiSearch className="text-zinc-400 flex-shrink-0" size={14} />
          <input
            type="text"
            placeholder="Search accounts directory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs text-zinc-800 placeholder-zinc-405 outline-none font-medium"
          />
        </div>
      </div>

      {/* High density statistics indicators */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Net Registered", value: stats.total, icon: <FiUsers size={14} /> },
          { label: "Gross Receipts", value: stats.totalOrders, icon: <FiShoppingBag size={14} /> },
          { label: "Gross Spend value", value: formatPrice(stats.totalRevenue), icon: <FiTag size={14} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200/60 p-4 shadow-premium flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-505">{s.icon}</div>
            <div>
              <p className="text-sm font-mono font-bold text-zinc-900 leading-none">{s.value}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rebuilt Directory table */}
      <div className="bg-white border border-zinc-200/60 rounded-xl shadow-premium overflow-hidden">
        {/* Table head */}
        <div className="hidden sm:grid grid-cols-[2fr_2.5fr_0.8fr_0.8fr_1fr_auto] gap-4 px-6 py-4.5 bg-zinc-50/50 border-b border-zinc-150/80 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
          <span>Customer Identity</span>
          <span>Credential Email</span>
          <span className="text-center">Receipts</span>
          <span>Net Spend</span>
          <span>Access State</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-zinc-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiAlertCircle size={24} className="text-zinc-300 mb-3" />
            <p className="font-bold text-zinc-700 text-sm">No matches found</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filtered.map((user) => (
              <div
                key={user._id}
                className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[2fr_2.5fr_0.8fr_0.8fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-zinc-50/20 transition-all duration-200 cursor-pointer group"
                onClick={() => openUser(user)}
              >
                {/* User name info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center font-mono font-bold text-zinc-800 text-xs flex-shrink-0">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-805 text-xs sm:text-sm truncate group-hover:text-emerald-600 transition-colors">{user.name}</p>
                    <p className="sm:hidden text-[9px] text-zinc-400 font-bold truncate mt-0.5">{user.email}</p>
                  </div>
                </div>

                {/* Email address */}
                <p className="hidden sm:block text-xs font-semibold text-zinc-500 truncate">{user.email}</p>

                {/* Orders Count */}
                <span className="hidden sm:flex items-center justify-center w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono font-bold text-zinc-700 mx-auto">
                  {user.orderCount || 0}
                </span>

                {/* Spend value */}
                <p className="hidden sm:block font-mono font-bold text-zinc-900 text-xs">{formatPrice(user.totalSpent || 0)}</p>

                {/* State badge */}
                <div onClick={e => e.stopPropagation()} className="hidden sm:block">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${user.isActive !== false
                      ? 'bg-emerald-50 border-emerald-250/30 text-emerald-700'
                      : 'bg-rose-50 border-rose-250/30 text-rose-600'
                    }`}>
                    {user.isActive !== false ? "Active" : "Suspended"}
                  </span>
                </div>

                {/* Actions toggles */}
                <div onClick={e => e.stopPropagation()} className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleToggleUserActive(user)}
                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors ${user.isActive !== false
                        ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                        : "bg-emerald-50 border-emerald-200 text-emerald-705 hover:bg-emerald-100"
                      }`}
                  >
                    {user.isActive !== false ? "Suspend" : "Activate"}
                  </button>
                  <div
                    onClick={() => openUser(user)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 transition-colors ml-auto sm:ml-0"
                  >
                    <FiChevronRight size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        variant={confirmDialog.title?.startsWith("Suspend") ? "danger" : "warning"}
      />
    </div>
  )
}

export default Users
