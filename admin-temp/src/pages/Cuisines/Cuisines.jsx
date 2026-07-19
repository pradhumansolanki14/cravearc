import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import {
  FiBookOpen, FiPlus, FiX, FiUpload, FiTrash2, FiEdit2,
  FiPackage, FiAlertCircle, FiImage,
} from "react-icons/fi"
import { Card, ConfirmationModal } from "../../components/ui"

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"]

const Cuisines = ({ url }) => {
  const [cuisines, setCuisines]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editing, setEditing]           = useState(null)
  const [form, setForm]                 = useState({ name: "" })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [saving, setSaving]             = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null })
  const fileInputRef = useRef(null)

  const token = localStorage.getItem("adminToken")

  /* ── Fetch ── */
  const fetchCuisines = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${url}/api/cuisines`)
      if (res.data.success) setCuisines(res.data.data)
      else toast.error("Failed to load cuisines")
    } catch {
      toast.error("Failed to load cuisines")
    }
    setLoading(false)
  }

  useEffect(() => { fetchCuisines() }, [])

  /* ── Open add form ── */
  const openAdd = () => {
    setEditing(null)
    setForm({ name: "" })
    setImageFile(null)
    setImagePreview("")
    setShowForm(true)
  }

  /* ── Open edit form ── */
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name })
    setImageFile(null)
    setImagePreview(c.image ? c.image : "")
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
    if (!form.name.trim()) { toast.error("Cuisine name is required"); return }
    if (!editing && !imageFile) { toast.error("Cuisine image is required"); return }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("name", form.name.trim())
      if (imageFile) fd.append("image", imageFile)

      let res
      if (editing) {
        res = await axios.put(`${url}/api/cuisines/${editing._id}`, fd, { headers: { token } })
      } else {
        res = await axios.post(`${url}/api/cuisines`, fd, { headers: { token } })
      }

      if (res.data.success) {
        toast.success(editing ? "Cuisine details updated!" : "Cuisine category created!")
        closeForm()
        fetchCuisines()
      } else {
        toast.error(res.data.message || "Failed to save cuisine")
      }
    } catch {
      toast.error("Connection failed")
    }
    setSaving(false)
  }

  /* ── Delete ── */
  const handleDelete = (c) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Cuisine",
      message: `Delete "${c.name}"? This cannot be undone. Cuisines in use by restaurants cannot be deleted.`,
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }))
        try {
          const res = await axios.delete(`${url}/api/cuisines/${c._id}`, { headers: { token } })
          if (res.data.success) {
            toast.success("Cuisine deleted")
            fetchCuisines()
          } else {
            toast.error(res.data.message || "Could not delete cuisine")
          }
        } catch (err) {
          if (err.response?.status === 409) {
            toast.error("Cannot delete: Cuisine is active in restaurant catalogs")
          } else {
            toast.error("Connection failed")
          }
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false })),
    })
  }

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
            <FiBookOpen size={16} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">Regional Cuisines</h1>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
              {loading ? "Loading…" : `${cuisines.length} regional cuisine${cuisines.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-955 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <FiPlus size={13} />
          Add Cuisine
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
                    {editing ? "Edit Cuisine" : "New Cuisine"}
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                    {editing ? "Update regional info" : "Add a regional classification"}
                  </p>
                </div>
                <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-zinc-800 transition-colors">
                  <FiX size={16} />
                </button>
              </div>

              {/* Image upload zone */}
              <div>
                <label className={labelClass}>
                  Cuisine Image {!editing && <span className="text-rose-400">*</span>}
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
                <label className={labelClass}>Cuisine Region Name <span className="text-rose-400">*</span></label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Italian, Thai, Mediterranean"
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
                  editing ? "Update Cuisine" : "Create Cuisine"
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
      {!loading && cuisines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-300 mb-4">
            <FiPackage size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500">No regional classifications yet</p>
          <p className="text-xs text-zinc-400 font-medium mt-1 mb-5">Create your first cuisine regional filter to get started</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <FiPlus size={12} /> Create Cuisine
          </button>
        </div>
      )}

      {/* ── Cuisine Grid ── */}
      {!loading && cuisines.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cuisines.map(c => (
            <div
              key={c._id}
              className="bg-white border border-zinc-200/70 rounded-2xl overflow-hidden shadow-premium flex flex-col group hover:border-zinc-350 hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Image box */}
              <div className="h-28 bg-zinc-50 relative overflow-hidden border-b border-zinc-100 flex items-center justify-center">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-zinc-300 flex flex-col items-center gap-1">
                    <FiImage size={24} />
                    <span className="text-[9px] font-semibold">No Image</span>
                  </div>
                )}
                <span className={`absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold uppercase tracking-wider border ${
                  c.isActive !== false
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-700 backdrop-blur-2xs"
                    : "bg-zinc-100/90 border-zinc-200 text-zinc-500 backdrop-blur-2xs"
                }`}>
                  {c.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Title & Action footer */}
              <div className="p-3.5 flex items-center justify-between min-w-0">
                <span className="font-bold text-zinc-800 text-xs truncate mr-2 capitalize">{c.name.toLowerCase()}</span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-850 hover:bg-zinc-50 transition-all"
                    title="Edit region properties"
                  >
                    <FiEdit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Delete regional class"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Cuisines
