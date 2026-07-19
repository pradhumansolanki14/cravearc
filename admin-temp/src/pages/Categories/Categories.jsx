import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import {
  FiFolder, FiPlus, FiX, FiUpload, FiTrash2, FiEdit2,
  FiPackage, FiAlertCircle, FiImage,
} from "react-icons/fi"
import { Card, ConfirmationModal } from "../../components/ui"

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"]

const Categories = ({ url }) => {
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editing, setEditing]           = useState(null)
  const [form, setForm]                 = useState({ name: "", description: "" })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [saving, setSaving]             = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null })
  const fileInputRef = useRef(null)

  const token = localStorage.getItem("adminToken")

  /* ── Fetch ── */
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${url}/api/categories`)
      if (res.data.success) setCategories(res.data.data)
      else toast.error("Failed to load categories")
    } catch {
      toast.error("Failed to load categories")
    }
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  /* ── Open add form ── */
  const openAdd = () => {
    setEditing(null)
    setForm({ name: "", description: "" })
    setImageFile(null)
    setImagePreview("")
    setShowForm(true)
  }

  /* ── Open edit form ── */
  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || "" })
    setImageFile(null)
    setImagePreview(cat.image ? cat.image : "")
    setShowForm(true)
  }

  /* ── Close form ── */
  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setImageFile(null)
    setImagePreview("")
  }

  /* ── Image pick ── */
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error("Invalid format — use PNG, JPG, or WebP")
      e.target.value = ""
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  /* ── Save (create or update) ── */
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error("Category name is required"); return }
    if (!editing && !imageFile) { toast.error("Category image is required"); return }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("name", form.name.trim())
      fd.append("description", form.description.trim())
      if (imageFile) fd.append("image", imageFile)

      let res
      if (editing) {
        res = await axios.put(`${url}/api/categories/${editing._id}`, fd, { headers: { token } })
      } else {
        res = await axios.post(`${url}/api/categories`, fd, { headers: { token } })
      }

      if (res.data.success) {
        toast.success(editing ? "Category updated!" : "Category created!")
        closeForm()
        fetchCategories()
      } else {
        toast.error(res.data.message || "Failed to save category")
      }
    } catch {
      toast.error("Connection failed")
    }
    setSaving(false)
  }

  /* ── Delete ── */
  const handleDelete = (cat) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Category",
      message: `Delete "${cat.name}"? This cannot be undone. Categories in use by food items cannot be deleted.`,
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }))
        try {
          const res = await axios.delete(`${url}/api/categories/${cat._id}`, { headers: { token } })
          if (res.data.success) {
            toast.success("Category deleted")
            fetchCategories()
          } else {
            toast.error(res.data.message || "Could not delete category")
          }
        } catch {
          toast.error("Connection failed")
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false })),
    })
  }

  const toggleFeatured = async (cat) => {
    try {
      const nextFeatured = !cat.featured;
      const res = await axios.put(
        `${url}/api/categories/${cat._id}`,
        { featured: nextFeatured },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(nextFeatured ? "Marked as featured" : "Removed from featured");
        fetchCategories();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const toggleActive = async (cat) => {
    try {
      const nextActive = !cat.isActive;
      const res = await axios.put(
        `${url}/api/categories/${cat._id}`,
        { isActive: nextActive },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(nextActive ? "Category activated" : "Category deactivated");
        fetchCategories();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to update active status");
    }
  };

  /* ── Style helpers ── */
  const labelClass = "block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1"
  const inpClass   = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-all"

  return (
    <div className="max-w-5xl space-y-6 animate-fadeUp">

      {/* Confirm modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />

      {/* ── Page header ── */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
            <FiFolder size={16} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">Categories</h1>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
              {loading ? "Loading…" : `${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <FiPlus size={13} />
          Add Category
        </button>
      </div>

      {/* ── Form modal ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn"
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <Card variant="default" radius="2xl" padding="none" className="bg-white shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn">
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <form onSubmit={handleSave} className="p-6 space-y-4">

              {/* Modal header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    {editing ? "Edit Category" : "New Category"}
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                    {editing ? "Update name or image" : "Fill in details and upload an image"}
                  </p>
                </div>
                <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-zinc-800 transition-colors">
                  <FiX size={16} />
                </button>
              </div>

              {/* Image upload zone */}
              <div>
                <label className={labelClass}>
                  Category Image {!editing && <span className="text-rose-400">*</span>}
                </label>
                <label className="cursor-pointer block">
                  <div className="w-full h-32 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center relative overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <FiUpload size={12} /> Change Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <FiImage size={24} />
                        <span className="text-[10px] font-semibold">Click to upload image</span>
                        <span className="text-[9px] text-zinc-300">PNG, JPG, WebP</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Name */}
              <div>
                <label className={labelClass}>Category Name <span className="text-rose-400">*</span></label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Burgers, Beverages, Desserts"
                  className={inpClass}
                />
              </div>

              {/* Description (optional) */}
              <div>
                <label className={labelClass}>Description <span className="text-zinc-300">(optional)</span></label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                  className={inpClass}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> Saving…</>
                ) : (
                  editing ? "Update Category" : "Create Category"
                )}
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-40 bg-white border border-zinc-200 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-300 mb-4">
            <FiPackage size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500">No categories yet</p>
          <p className="text-xs text-zinc-400 font-medium mt-1 mb-5">Create your first category to get started</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <FiPlus size={12} /> Create Category
          </button>
        </div>
      )}

      {/* ── Category grid ── */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="group bg-white border border-zinc-200/65 rounded-xl overflow-hidden shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-200"
            >
              {/* Image */}
              <div className="w-full h-28 bg-zinc-50 overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-200">
                    <FiImage size={28} />
                  </div>
                )}
              </div>

              {/* Info + Actions */}
              <div className="p-3.5 space-y-2.5">
                <div>
                  <p className="text-xs font-bold text-zinc-900 truncate">{cat.name}</p>
                  {cat.description && (
                    <p className="text-[10px] text-zinc-450 font-medium mt-0.5 truncate">{cat.description}</p>
                  )}
                  <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                    Created: {new Date(cat.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Toggles Row */}
                <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-zinc-100">
                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleActive(cat)}
                    className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border transition-colors ${
                      cat.isActive 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </button>

                  {/* Featured Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleFeatured(cat)}
                    className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border transition-colors flex items-center gap-0.5 ${
                      cat.featured 
                        ? 'bg-amber-50 border-amber-200 text-amber-700 font-black' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                    }`}
                  >
                    ★ {cat.featured ? 'Featured' : 'Standard'}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                  >
                    <FiEdit2 size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-rose-500 border border-rose-100 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-colors"
                  >
                    <FiTrash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Info notice ── */}
      {!loading && categories.length > 0 && (
        <div className="flex items-start gap-2.5 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
          <FiAlertCircle size={14} className="text-zinc-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold text-zinc-500 leading-relaxed">
            Categories that are referenced by existing food items cannot be deleted. Remove or reassign all food items in that category first.
          </p>
        </div>
      )}
    </div>
  )
}

export default Categories
