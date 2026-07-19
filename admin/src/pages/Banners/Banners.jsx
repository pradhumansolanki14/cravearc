import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { FiLayers, FiPlus, FiX, FiUpload, FiTrash2, FiEdit, FiClock } from "react-icons/fi"
import { Card, Badge, ConfirmationModal } from "../../components/ui"

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"]

const Banners = ({ url }) => {
  const [banners, setBanners] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: "", subtitle: "", restaurantId: "", order: 0, isActive: true })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [saving, setSaving] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null })
  
  const token = localStorage.getItem("adminToken")

  const fetchData = async () => {
    setLoading(true)
    try {
      const bannerRes = await axios.get(`${url}/api/banners`)
      if (bannerRes.data.success) setBanners(bannerRes.data.data)
      
      const restRes = await axios.get(`${url}/api/admin/restaurant/`, { headers: { token } })
      if (restRes.data.success) setRestaurants(restRes.data.data)
    } catch { 
      toast.error("Failed to load banners metadata") 
    }
    setLoading(false)
  }

  useEffect(() => { 
    fetchData() 
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ title: "", subtitle: "", restaurantId: "", order: 0, isActive: true })
    setImageFile(null) 
    setImagePreview("")
    setShowForm(true)
  }

  const openEdit = (b) => {
    setEditing(b)
    setForm({ 
      title: b.title, 
      subtitle: b.subtitle || "", 
      restaurantId: b.restaurantId?._id || b.restaurantId || "", 
      order: b.order || 0, 
      isActive: b.isActive 
    })
    setImageFile(null)
    setImagePreview(b.image ? b.image : "")
    setShowForm(true)
  }

  const closeForm = () => { 
    setShowForm(false) 
    setEditing(null) 
    setImageFile(null) 
    setImagePreview("") 
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error("Invalid image format (PNG, JPG, WEBP only)")
      e.target.value = ""
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (!editing && !imageFile) { 
      toast.error("Promotion hero image file is required") 
      return 
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("subtitle", form.subtitle)
      if (form.restaurantId) fd.append("restaurantId", form.restaurantId)
      fd.append("order", form.order)
      if (editing) fd.append("isActive", form.isActive)
      if (imageFile) fd.append("image", imageFile)

      let res
      if (editing) {
        res = await axios.put(`${url}/api/banners/${editing._id}`, fd, { headers: { token } })
      } else {
        res = await axios.post(`${url}/api/banners`, fd, { headers: { token } })
      }
      if (res.data.success) {
        toast.success(editing ? "Promotion banner updated!" : "Homepage banner created successfully!")
        closeForm()
        fetchData()
      } else {
        toast.error(res.data.message || "Failed to save details")
      }
    } catch {
      toast.error("Server update failed")
    }
    setSaving(false)
  }

  const handleDelete = (b) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Promo Banner",
      message: `Are you sure you want to delete banner "${b.title}"?`,
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }))
        try {
          const res = await axios.delete(`${url}/api/banners/${b._id}`, { headers: { token } })
          if (res.data.success) {
            toast.success("Banner deleted")
            fetchData()
          } else {
            toast.error(res.data.message || "Could not delete banner")
          }
        } catch {
          toast.error("Connection failed")
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false }))
    })
  }

  const labelClass = "block text-[9px] font-bold text-zinc-400 uppercase tracking-widest"
  const inpClass = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-all"

  return (
    <div className="max-w-5xl space-y-6 animate-fadeUp">
      
      {/* Rebuilt Form Dialog Overlay */}
      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-955/40 backdrop-blur-xs animate-fadeIn"
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <Card variant="default" radius="2xl" padding="none" className="bg-white shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn max-h-[85vh] flex flex-col">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    {editing ? "Edit Promotion Banner" : "Add Promo Banner"}
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Manage carousel settings</p>
                </div>
                <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-zinc-800 text-xs font-bold">Cancel</button>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                
                {/* Upload Zone */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Banner Image File *</label>
                  <label className="cursor-pointer block">
                    <div className="w-full h-32 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center relative overflow-hidden p-4 text-center">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <span className="text-white text-xs font-bold uppercase tracking-wider">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <FiUpload className="mx-auto text-zinc-400" size={16} />
                          <p className="text-2xs font-bold text-zinc-600">Click to upload banner</p>
                        </div>
                      )}
                    </div>
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Banner Title</label>
                  <input name="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Special Weekend Deal" className={inpClass} />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Subtitle Description</label>
                  <input name="subtitle" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g. 50% discount on first 10 orders" className={inpClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Linked Restaurant</label>
                    <select value={form.restaurantId} onChange={e => setForm(f => ({ ...f, restaurantId: e.target.value }))} className={inpClass}>
                      <option value="">No linked store</option>
                      {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Priority Index</label>
                    <input type="number" min="0" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className={inpClass} />
                  </div>
                </div>

                {editing && (
                  <div className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-150 rounded-lg">
                    <div>
                      <p className="text-2xs font-bold text-zinc-800">Banner Visibility</p>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Toggle active state checks</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        form.isActive 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-zinc-100 border-zinc-200 text-zinc-550'
                      }`}
                    >
                      {form.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                )}

              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={closeForm} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-705 text-xs font-bold rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold rounded-lg transition-colors">
                  {saving ? "Saving..." : "Publish Banner"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
            <FiLayers size={16} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-905">Promo Banners</h1>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">{banners.length} promotional graphics active</p>
          </div>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-955 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <FiPlus size={13} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-44 bg-white border border-zinc-200 rounded-xl animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiLayers size={24} className="text-zinc-300 mb-2" />
          <p className="font-bold text-zinc-755 text-xs font-poppins">No banner advertisements registered</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {banners.map(b => (
            <div 
              key={b._id} 
              className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-premium group hover:border-zinc-350 transition-colors flex flex-col justify-between"
            >
              <div className="h-32 bg-zinc-100 relative">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xs text-zinc-400 font-bold">No Image Banner</div>
                )}
                
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                  b.isActive 
                    ? 'bg-emerald-50 border-emerald-250/20 text-emerald-705 shadow-sm' 
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
                }`}>
                  {b.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-zinc-800 text-xs truncate leading-none mb-1">{b.title}</p>
                  {b.subtitle && <p className="text-[10px] text-zinc-405 truncate leading-none">{b.subtitle}</p>}
                  
                  <div className="flex items-center gap-2 mt-3 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    <span className="px-1.5 py-0.5 bg-zinc-50 border border-zinc-150 rounded">
                      Index: {b.order}
                    </span>
                    {b.restaurantId && (
                      <span className="px-1.5 py-0.5 bg-emerald-50/50 border border-emerald-100 rounded text-emerald-700">
                        Vendor Linked
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEdit(b)} 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
                  >
                    <FiEdit size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(b)} 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default Banners
