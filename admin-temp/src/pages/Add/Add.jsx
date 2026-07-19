import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { FiPlus, FiCamera, FiTrash2, FiTag, FiClock, FiActivity, FiCheck, FiFolder } from "react-icons/fi"
import { Card, Button, Input } from "../../components/ui"

const Add = ({ url }) => {
  const [image, setImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [data, setData] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    category: "",
    preparationTime: "20",
    isVeg: false,
    calories: "",
    tags: ""
  })

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${url}/api/categories`)
        if (res.data.success) {
          setCategories(res.data.data)
          if (res.data.data.length > 0) {
            setData(d => ({ ...d, category: res.data.data[0].name }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }
    fetchCategories()
  }, [url])

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target
    setData(d => ({ 
      ...d, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    if (!image) {
      toast.error("Dish photo is required")
      return
    }
    if (!data.category) {
      toast.error("Please select a category")
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("price", Number(data.price))
    formData.append("category", data.category)
    formData.append("image", image)
    
    // Additional attributes
    formData.append("preparationTime", Number(data.preparationTime))
    formData.append("isVeg", data.isVeg)
    if (data.calories) formData.append("calories", Number(data.calories))
    if (data.tags) {
      const parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean)
      parsedTags.forEach(t => formData.append("tags", t))
    }

    try {
      const token = localStorage.getItem("adminToken")
      const response = await axios.post(`${url}/api/food/add`, formData, { headers: { token } })
      if (response.data.success) {
        setData({ 
          name: "", 
          description: "", 
          price: "", 
          category: categories[0]?.name || "",
          preparationTime: "20",
          isVeg: false,
          calories: "",
          tags: ""
        })
        setImage(false)
        toast.success(response.data.message || "Dish successfully created!")
      } else {
        toast.error(response.data.message || "Could not save details")
      }
    } catch (err) {
      toast.error("Could not add new food item.")
    } finally {
      setLoading(false)
    }
  }

  const formSectionClass = "bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-premium space-y-5"
  const labelClass = "block text-[10px] font-bold text-zinc-450 uppercase tracking-widest"
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-800 placeholder-zinc-450 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200/50 pb-5">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
          <FiPlus size={16} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900">Add Product</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">Expose new items to your restaurant storefront catalog</p>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-6">
        
        {/* Upload card container */}
        <div className={formSectionClass}>
          <label className={labelClass}>Dish Visual Photo *</label>
          
          <label htmlFor="image" className="cursor-pointer block">
            <div className={`relative w-full h-44 rounded-xl border border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 ${
              image 
                ? 'border-emerald-500 bg-emerald-50/10' 
                : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-450'
            }`}>
              {image ? (
                <>
                  <img src={URL.createObjectURL(image)} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Change photo</span>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-white border border-zinc-250/30 flex items-center justify-center text-zinc-400 shadow-3xs">
                    <FiCamera size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-700">Click to upload product image</p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">PNG, JPG or WEBP (max 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden accept="image/*" />
          
          {image && (
            <button 
              type="button" 
              onClick={() => setImage(false)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 transition-colors"
            >
              <FiTrash2 size={11} />
              <span>Remove attachment</span>
            </button>
          )}
        </div>

        {/* Section 2: Details */}
        <div className={formSectionClass}>
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide border-b border-zinc-100 pb-2 mb-1">Product Details</h3>
          
          <div className="space-y-1.5">
            <label className={labelClass}>Product Name</label>
            <input 
              name="name"
              value={data.name}
              onChange={onChangeHandler}
              required
              placeholder="e.g. Garlic Herb Pasta"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Product Description</label>
            <textarea 
              name="description"
              value={data.description}
              onChange={onChangeHandler}
              required
              placeholder="Detailed description of flavors, ingredients, allergens, or preparation details..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Category Catalog</label>
              <select
                name="category"
                value={data.category}
                onChange={onChangeHandler}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              <div className="mt-2.5 pt-2.5 border-t border-dashed border-zinc-200">
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Can't find your category?</p>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-705 transition-colors mt-0.5 inline-block uppercase tracking-wider"
                >
                  Request New Category
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className={labelClass}>Price (₹)</label>
              <input 
                name="price"
                type="number"
                min="0.5"
                step="0.01"
                value={data.price}
                onChange={onChangeHandler}
                required
                placeholder="₹199"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Parameters */}
        <div className={formSectionClass}>
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide border-b border-zinc-100 pb-2 mb-1">Additional Parameters</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Prep Time (Mins)</label>
              <div className="relative flex items-center">
                <FiClock className="absolute left-3 text-zinc-400" size={13} />
                <input 
                  name="preparationTime"
                  type="number"
                  min="1"
                  value={data.preparationTime}
                  onChange={onChangeHandler}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Calories (Kcal)</label>
              <div className="relative flex items-center">
                <FiActivity className="absolute left-3 text-zinc-400" size={13} />
                <input 
                  name="calories"
                  type="number"
                  min="0"
                  value={data.calories}
                  onChange={onChangeHandler}
                  placeholder="e.g. 240"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Tags (comma-separated)</label>
            <div className="relative flex items-center">
              <FiTag className="absolute left-3 text-zinc-400" size={13} />
              <input 
                name="tags"
                value={data.tags}
                onChange={onChangeHandler}
                placeholder="e.g. Organic, Recommended, Gluten Free"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
            <div>
              <p className="text-xs font-bold text-zinc-800">Food Type</p>
              <p className="text-[10px] text-zinc-450 mt-0.5 font-semibold">Mark this food item as Veg or Non Veg</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setData(d => ({ ...d, isVeg: true }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wider transition-all ${
                  data.isVeg 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs' 
                    : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                <span className="inline-flex items-center justify-center w-2.5 h-2.5 border border-emerald-600 rounded bg-white">
                  <span className="w-1 h-1 rounded-full bg-emerald-600" />
                </span>
                <span>Veg</span>
              </button>
              
              <button
                type="button"
                onClick={() => setData(d => ({ ...d, isVeg: false }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wider transition-all ${
                  !data.isVeg 
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs' 
                    : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                <span className="inline-flex items-center justify-center w-2.5 h-2.5 border border-rose-600 rounded bg-white">
                  <svg className="w-1.5 h-1.5 text-rose-600 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3l10 17H2L12 3z" />
                  </svg>
                </span>
                <span>Non Veg</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-850 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
        >
          {loading ? "Adding to catalog..." : "Publish Product"}
        </button>

      </form>

      {/* ── Category Request Modal Overlay ── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fadeIn" onClick={() => setShowRequestModal(false)}>
          <Card 
            radius="2xl" 
            padding="lg" 
            className="w-full max-w-sm bg-white border border-zinc-200 shadow-2xl relative animate-scaleIn space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="font-poppins font-extrabold text-zinc-900 text-sm uppercase tracking-wide">Request New Category</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1">Submit a folder category suggestion to Platform Admin</p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Category Name</label>
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
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Description</label>
                <textarea 
                  value={reqDesc} 
                  onChange={e => setReqDesc(e.target.value)}
                  placeholder="What food items belong here?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-zinc-950 transition-all font-semibold resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Reason (Optional)</label>
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
    </div>
  )
}

export default Add
