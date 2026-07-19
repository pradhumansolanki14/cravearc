import React, { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { FiEdit, FiTrash2, FiSearch, FiX, FiTag, FiClock, FiActivity, FiLayers, FiDollarSign, FiPlus, FiAlertCircle } from "react-icons/fi"
import { Card, Badge, Button, ConfirmationModal } from "../../components/ui"
import { useAdmin } from "../../context/AdminContext"

const categoryColors = {
  Salad: "bg-emerald-50 text-emerald-700 border-emerald-100", 
  Rolls: "bg-amber-50 text-amber-705 border-amber-100",
  Deserts: "bg-rose-50 text-rose-700 border-rose-100", 
  Sandwich: "bg-yellow-50 text-yellow-800 border-yellow-100",
  Cake: "bg-purple-50 text-purple-700 border-purple-100", 
  "Pure Veg": "bg-green-50 text-green-755 border-green-100",
  Pasta: "bg-orange-50 text-orange-700 border-orange-100", 
  Noodles: "bg-red-50 text-red-700 border-red-100",
}

// ─── Rebuilt Edit Modal (Clerk Styling) ──────────────────────────
const EditModal = ({ item, url, onClose, onSaved, categories }) => {
  const [data, setData] = useState({ 
    name: item.name || "", 
    description: item.description || "", 
    price: item.price || "", 
    category: item.category || (categories && categories[0]?.name) || "",
    preparationTime: item.preparationTime ?? "20",
    isVeg: item.isVeg ?? false,
    calories: item.calories || "",
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : "",
    isAvailable: item.isAvailable ?? true
  })
  const [newImage, setNewImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // Category Request Modal States
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [reqName, setReqName] = useState("")
  const [reqDesc, setReqDesc] = useState("")
  const [reqReason, setReqReason] = useState("")
  const [requesting, setRequesting] = useState(false)

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    if (!reqName.trim()) {
      toast.error("Category name is required")
      return
    }
    setRequesting(true)
    try {
      const token = localStorage.getItem("adminToken")
      const res = await axios.post(
        `${url}/api/categories/requests`,
        { name: reqName, description: reqDesc, reason: reqReason },
        { headers: { token } }
      )
      if (res.data.success) {
        toast.success("Category request submitted successfully.")
        setShowRequestModal(false)
        setReqName("")
        setReqDesc("")
        setReqReason("")
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed")
    }
    setRequesting(false)
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setData(d => ({ 
      ...d, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description)
      formData.append("price", Number(data.price))
      formData.append("category", data.category)
      formData.append("isAvailable", data.isAvailable)
      formData.append("preparationTime", Number(data.preparationTime))
      formData.append("isVeg", data.isVeg)
      if (data.calories) formData.append("calories", Number(data.calories))
      
      const parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean)
      formData.append("tags", JSON.stringify(parsedTags))

      if (newImage) formData.append("image", newImage)

      const token = localStorage.getItem("adminToken")
      const res = await axios.put(`${url}/api/food/${item._id}`, formData, { headers: { token } })
      if (res.data.success) {
        toast.success("Dish updated successfully!")
        onSaved()
        onClose()
      } else {
        toast.error(res.data.message || "Failed to update item")
      }
    } catch { 
      toast.error("Update failed") 
    }
    setLoading(false)
  }

  const labelClass = "block text-[9px] font-bold text-zinc-400 uppercase tracking-widest"
  const inpClass = "w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 transition-all"

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-955/40 backdrop-blur-xs animate-fadeIn" 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <Card variant="default" radius="2xl" padding="none" className="bg-white shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
        
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Edit Catalog Item</h2>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Modify properties & availability</p>
            </div>
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-800 text-xs font-bold">Close</button>
          </div>

          {/* Form fields */}
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className={labelClass}>Product Name</label>
              <input name="name" value={data.name} onChange={onChange} required className={inpClass} />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={data.description} onChange={onChange} required rows={2} className={`${inpClass} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Category</label>
                <select name="category" value={data.category} onChange={onChange} className={inpClass}>
                  {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>

                <div className="mt-2 pt-2 border-t border-dashed border-zinc-200">
                  <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Can't find your category?</p>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(true)}
                    className="text-[9px] font-extrabold text-emerald-600 hover:text-emerald-705 transition-colors mt-0.5 inline-block uppercase tracking-wider"
                  >
                    Request New Category
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Price (₹)</label>
                <input name="price" type="number" min="0.5" step="0.01" value={data.price} onChange={onChange} required placeholder="₹199" className={inpClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Prep Time (Mins)</label>
                <input name="preparationTime" type="number" min="1" value={data.preparationTime} onChange={onChange} className={inpClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Calories (Kcal)</label>
                <input name="calories" type="number" min="0" value={data.calories} onChange={onChange} placeholder="Optional" className={inpClass} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Tags (comma-separated)</label>
              <input name="tags" value={data.tags} onChange={onChange} placeholder="Spicy, Gluten-free..." className={inpClass} />
            </div>

            {/* Photo update */}
            <div className="space-y-1">
              <label className={labelClass}>Update Photo</label>
              <input type="file" accept="image/*" onChange={e => setNewImage(e.target.files[0])} className="text-2xs text-zinc-500 w-full" />
            </div>

            {/* Vegetarian toggle */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-150">
              <div>
                <p className="text-2xs font-bold text-zinc-800">Food Type</p>
                <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Mark this food item as Veg or Non Veg</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={() => setData(d => ({ ...d, isVeg: true }))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                    data.isVeg 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs' 
                      : 'bg-white border-zinc-200 text-zinc-500'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-2 h-2 border border-emerald-600 rounded bg-white">
                    <span className="w-1 h-1 rounded-full bg-emerald-600" />
                  </span>
                  <span>Veg</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setData(d => ({ ...d, isVeg: false }))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                    !data.isVeg 
                      ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs' 
                      : 'bg-white border-zinc-200 text-zinc-505'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-2 h-2 border border-rose-600 rounded bg-white">
                    <svg className="w-1 h-1 text-rose-600 fill-current" viewBox="0 0 24 24">
                      <path d="M12 3l10 17H2L12 3z" />
                    </svg>
                  </span>
                  <span>Non Veg</span>
                </button>
              </div>
            </div>

            {/* Availability toggles */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-150">
              <div>
                <p className="text-2xs font-bold text-zinc-800">In Stock & Available</p>
                <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Toggle catalog storefront visibility</p>
              </div>
              <button 
                type="button"
                onClick={() => setData(d => ({ ...d, isAvailable: !d.isAvailable }))}
                className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                  data.isAvailable 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-rose-50 border-rose-250/30 text-rose-600'
                }`}
              >
                {data.isAvailable ? 'In Stock' : 'Out of Stock'}
              </button>
            </div>
          </div>

          <div className="flex gap-2.5 pt-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold rounded-lg transition-colors">
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        {/* ── Category Request Modal Overlay ── */}
        {showRequestModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fadeIn" onClick={() => setShowRequestModal(false)}>
            <Card 
              radius="2xl" 
              padding="lg" 
              className="w-full max-w-sm bg-white border border-zinc-200 shadow-2xl relative animate-scaleIn space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div>
                <h3 className="font-poppins font-extrabold text-zinc-900 text-sm uppercase tracking-wide">Request New Category</h3>
                <p className="text-[10px] text-zinc-450 font-semibold mt-1">Submit a folder category suggestion to Platform Admin</p>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-405 uppercase tracking-widest block">Category Name</label>
                  <input 
                    type="text" 
                    value={reqName} 
                    onChange={e => setReqName(e.target.value)}
                    placeholder="e.g. Seafood, Fastfood"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 transition-all font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-405 uppercase tracking-widest block">Description</label>
                  <textarea 
                    value={reqDesc} 
                    onChange={e => setReqDesc(e.target.value)}
                    placeholder="What food items belong here?"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 transition-all font-semibold resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-405 uppercase tracking-widest block">Reason (Optional)</label>
                  <textarea 
                    value={reqReason} 
                    onChange={e => setReqReason(e.target.value)}
                    placeholder="Why is this category required?"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 transition-all font-semibold resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => setShowRequestModal(false)} 
                    className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-2xs font-bold rounded-lg transition-colors uppercase tracking-wider"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={requesting} 
                    className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-850 text-white text-2xs font-bold rounded-lg transition-colors uppercase tracking-wider"
                    type="submit"
                  >
                    {requesting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>
    </div>
  )
}

const List = ({ url }) => {
  const { adminRole, adminToken, formatPrice } = useAdmin()
  const [list, setList] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [sortBy, setSortBy] = useState("default")
  const [editItem, setEditItem] = useState(null)
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null })

  const fetchList = async () => {
    setLoading(true)
    try {
      const endpoint = adminRole === "vendor" ? `${url}/api/food/my/items` : `${url}/api/food/list`
      const headers = adminRole === "vendor" ? { headers: { token: adminToken } } : {}
      const response = await axios.get(endpoint, headers)
      if (response.data.success) {
        setList(response.data.data)
      } else {
        toast.error("Could not fetch product lists")
      }
    } catch {
      toast.error("Network connection failed")
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${url}/api/categories`)
      if (res.data.success) {
        setCategories(res.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  const removeFood = async (foodId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Catalog Product",
      message: "Are you sure you want to permanently delete this product? This action cannot be reversed.",
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }))
        try {
          const token = localStorage.getItem("adminToken")
          const res = await axios.post(`${url}/api/food/remove`, { id: foodId }, { headers: { token } })
          if (res.data.success) {
            toast.success("Dish deleted successfully!")
            fetchList()
          } else {
            toast.error(res.data.message || "Failed to remove item")
          }
        } catch {
          toast.error("Connection failed")
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false }))
    })
  }

  useEffect(() => { 
    if (adminRole) {
      fetchList() 
    }
    fetchCategories()
  }, [adminRole, adminToken])

  let filtered = list.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                        item.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "All" || item.category === categoryFilter
    return matchSearch && matchCat
  })

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))

  const stats = {
    total: list.length,
    categories: [...new Set(list.map(i => i.category))].length,
    avgPrice: list.length ? (list.reduce((a, b) => a + b.price, 0) / list.length) : 0
  }

  const categoryFilterList = ["All", ...categories.map(c => c.name)]

  return (
    <div className="max-w-5xl space-y-6 animate-fadeUp">
      {editItem && (
        <EditModal 
          item={editItem} 
          url={url} 
          onClose={() => setEditItem(null)} 
          onSaved={fetchList} 
          categories={categories}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Food Menu List</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">{list.length} item{list.length !== 1 ? 's' : ''} currently published</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-3 py-2 w-full sm:w-72 focus-within:border-zinc-950 transition-colors shadow-premium">
          <FiSearch className="text-zinc-400 flex-shrink-0" size={14} />
          <input 
            type="text" 
            placeholder="Search menu catalogue..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs text-zinc-800 placeholder-zinc-405 outline-none font-medium" 
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-700">
              <FiX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Items", value: stats.total, icon: <FiLayers size={14} /> },
          { label: "Categories", value: stats.categories, icon: <FiTag size={14} /> },
          { label: "Avg Price", value: formatPrice(stats.avgPrice), icon: <FiTag size={14} /> },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-zinc-200/60 p-4 shadow-premium flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-500">{stat.icon}</div>
            <div>
              <p className="text-base font-mono font-bold text-zinc-905 leading-none">{stat.value}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide w-full sm:w-auto">
          {categoryFilterList.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                categoryFilter === cat
                  ? "bg-zinc-950 text-white border-zinc-955 shadow-sm"
                  : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {/* Main product items catalogue cards */}
      <div className="bg-white border border-zinc-200/60 rounded-xl shadow-premium overflow-hidden">
        {/* Table Head */}
        <div className="hidden sm:grid grid-cols-[80px_2.5fr_1.2fr_1fr_1.2fr_1fr_auto] gap-4 px-6 py-4.5 bg-zinc-50/50 border-b border-zinc-150/80 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
          <span>Dish Preview</span>
          <span>Dish Name</span>
          <span>Category</span>
          <span>Compliance</span>
          <span>Details</span>
          <span>Price</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-zinc-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-50 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center p-8">
            <FiAlertCircle size={24} className="text-zinc-300 mb-3" />
            <p className="font-bold text-zinc-700 text-sm">No dishes found</p>
            <p className="text-xs text-zinc-400 mt-1">Add items to expose catalog menus.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filtered.map((item) => (
              <div 
                key={item._id} 
                className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[80px_2.5fr_1.2fr_1fr_1.2fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-zinc-50/20 transition-all duration-200 group"
              >
                {/* Photo */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-200 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-zinc-800 text-xs sm:text-sm truncate">{item.name}</p>
                    {!item.isAvailable && (
                      <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <p className="sm:hidden text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1 flex flex-wrap gap-1.5 items-center">
                    <span className={`px-1.5 py-0.5 rounded border border-zinc-200 ${categoryColors[item.category] || 'bg-zinc-50 text-zinc-550 border-zinc-150'}`}>{item.category}</span>
                    <span className="text-zinc-900 font-mono font-bold">{formatPrice(item.price)}</span>
                  </p>
                </div>

                {/* Category badge */}
                <span className={`hidden sm:inline-flex items-center justify-center px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-zinc-150 ${categoryColors[item.category] || 'bg-zinc-50 text-zinc-550 border-zinc-150'}`}>
                  {item.category}
                </span>

                {/* Veg status */}
                <span className="hidden sm:inline-block text-xs font-semibold">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    item.isVeg ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {item.isVeg ? (
                      <span className="inline-flex items-center justify-center w-2.5 h-2.5 border border-emerald-600 rounded-xs bg-white">
                        <span className="w-1 h-1 rounded-full bg-emerald-600" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-2.5 h-2.5 border border-rose-600 rounded-xs bg-white">
                        <svg className="w-1.5 h-1.5 text-rose-600 fill-current" viewBox="0 0 24 24">
                          <path d="M12 3l10 17H2L12 3z" />
                        </svg>
                      </span>
                    )}
                    <span>{item.isVeg ? 'Veg' : 'Non Veg'}</span>
                  </span>
                </span>

                {/* Details */}
                <div className="hidden sm:block text-zinc-500 text-xs font-semibold">
                  <p className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wide">
                    <FiClock size={11} className="text-zinc-400" /> 
                    <span>{item.preparationTime ?? 20} mins</span>
                  </p>
                  {item.calories && (
                    <p className="flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase tracking-wide mt-1">
                      <FiActivity size={11} className="text-zinc-400" /> 
                      <span>{item.calories} kcal</span>
                    </p>
                  )}
                </div>

                {/* Price */}
                <p className="hidden sm:block font-mono font-bold text-zinc-900 text-xs">{formatPrice(item.price)}</p>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                  <button 
                    onClick={() => setEditItem(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                  >
                    <FiEdit size={13} />
                  </button>
                  <button 
                    onClick={() => removeFood(item._id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-450 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <FiTrash2 size={13} />
                  </button>
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
      />
    </div>
  )
}

export default List
