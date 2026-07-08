import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiSearch, FiX, FiTag, FiClock, FiActivity, FiLayers, FiDollarSign, FiPlus, FiAlertCircle } from "react-icons/fi";
import { Card, Badge, Button, Input, Select, ConfirmationModal } from "../../components/ui";

const CATEGORIES = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];

const categoryColors = {
  Salad: "bg-emerald-50 text-emerald-700 border-emerald-100/50", 
  Rolls: "bg-amber-50 text-amber-700 border-amber-100/50",
  Deserts: "bg-rose-50 text-rose-700 border-rose-100/50", 
  Sandwich: "bg-yellow-50 text-yellow-800 border-yellow-100/50",
  Cake: "bg-purple-50 text-purple-700 border-purple-100/50", 
  "Pure Veg": "bg-green-50 text-green-705 border-green-100/50",
  Pasta: "bg-orange-50 text-orange-700 border-orange-100/50", 
  Noodles: "bg-red-50 text-red-700 border-red-100/50",
};

// ─── Edit Modal ───────────────────────────────────────────────
const EditModal = ({ item, url, onClose, onSaved }) => {
  const [data, setData] = useState({ 
    name: item.name || "", 
    description: item.description || "", 
    price: item.price || "", 
    category: item.category || "Salad",
    preparationTime: item.preparationTime ?? "20",
    isVeg: item.isVeg ?? false,
    calories: item.calories || "",
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : "",
    isAvailable: item.isAvailable ?? true
  });
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(d => ({ 
      ...d, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("isAvailable", data.isAvailable);
      
      // Additional fields supported by backend schemas
      formData.append("preparationTime", Number(data.preparationTime));
      formData.append("isVeg", data.isVeg);
      if (data.calories) formData.append("calories", Number(data.calories));
      
      // Parse tags
      const parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(parsedTags)); // Pass tags array

      if (newImage) formData.append("image", newImage);

      const token = localStorage.getItem("adminToken");
      const res = await axios.put(`${url}/api/food/${item._id}`, formData, { headers: { token } });
      if (res.data.success) {
        toast.success("Dish updated successfully!");
        onSaved();
        onClose();
      } else {
        toast.error(res.data.message);
      }
    } catch { 
      toast.error("Update failed"); 
    }
    setLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(5px)" }} 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <Card variant="default" radius="3xl" padding="none" className="bg-white shadow-2xl w-full max-w-lg overflow-hidden animate-fadeUp">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
        
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650">
                <FiEdit size={16} />
              </div>
              <div>
                <h2 className="font-poppins font-extrabold text-lg text-slate-905 leading-none">Edit Dish</h2>
                <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider mt-1">Update item properties</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            
            {/* Dish Photo Uploader preview */}
            <div>
              <label className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block mb-2">Dish Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                  <img src={newImage ? URL.createObjectURL(newImage) : `${url}/images/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <label htmlFor="edit-image" className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-2xs font-bold uppercase tracking-wider text-slate-600 transition-all">
                    <FiLayers size={12} />
                    <span>Upload New</span>
                  </label>
                  <input id="edit-image" type="file" accept="image/*" hidden onChange={e => setNewImage(e.target.files[0])} />
                </div>
              </div>
            </div>

            <Input name="name" value={data.name} onChange={onChange} required label="Dish Name" placeholder="Dish name" />
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Description *</label>
              <textarea name="description" value={data.description} onChange={onChange} rows={3} required className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-emerald-455 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 resize-none" placeholder="Description" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" name="category" value={data.category} onChange={onChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input name="price" value={data.price} onChange={onChange} type="number" min="0.5" step="0.01" required label="Price ($)" placeholder="0.00" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input name="preparationTime" value={data.preparationTime} onChange={onChange} type="number" min="1" label="Prep Time (mins)" />
              <Input name="calories" value={data.calories} onChange={onChange} type="number" min="0" label="Calories (kcal)" placeholder="e.g. 350" />
            </div>

            <Input name="tags" value={data.tags} onChange={onChange} label="Tags (comma-separated)" placeholder="e.g. Recommended, Spicy" />

            {/* Checkbox toggles for Veg and Availability */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Vegetarian</span>
                <input 
                  type="checkbox" 
                  name="isVeg" 
                  checked={data.isVeg} 
                  onChange={onChange}
                  className="w-4.5 h-4.5 accent-emerald-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Available</span>
                <input 
                  type="checkbox" 
                  name="isAvailable" 
                  checked={data.isAvailable} 
                  onChange={onChange}
                  className="w-4.5 h-4.5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" size="md" className="flex-1 font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="primary" size="md" className="flex-1 font-bold shadow-emerald">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

          </form>
        </div>
      </Card>
    </div>
  );
};

// ─── Main List Page ───────────────────────────────────────────
const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [editItem, setEditItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const fetchList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${url}/api/food/my/items`, { headers: { token } });
      if (res.data.success) {
        setList(res.data.data);
      } else {
        toast.error("Error fetching food list");
      }
    } catch {
      toast.error("Error fetching food list");
    }
    setLoading(false);
  };

  const removeFood = (foodId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Dish",
      message: "Are you sure you want to remove this dish from the menu? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        try {
          const token = localStorage.getItem("adminToken");
          const res = await axios.post(`${url}/api/food/remove`, { id: foodId }, { headers: { token } });
          if (res.data.success) { 
            toast.success(res.data.message); 
            fetchList(); 
          } else {
            toast.error("Error removing item");
          }
        } catch {
          toast.error("Error removing item");
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false }))
    });
  };

  useEffect(() => { 
    fetchList(); 
  }, []);

  // Filter & Sort logic
  let filtered = list.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                        item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const stats = {
    total: list.length,
    categories: [...new Set(list.map(i => i.category))].length,
    avgPrice: list.length ? (list.reduce((a, b) => a + b.price, 0) / list.length) : 0
  };

  return (
    <div className="max-w-5xl animate-fadeUp space-y-6">
      {editItem && <EditModal item={editItem} url={url} onClose={() => setEditItem(null)} onSaved={fetchList} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiLayers size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Food Menu List</h1>
            <p className="text-slate-405 text-xs font-semibold">{list.length} item{list.length !== 1 ? 's' : ''} currently in catalog</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full sm:w-72 focus-within:border-emerald-450 transition-colors shadow-2xs">
          <FiSearch className="text-slate-400 flex-shrink-0" size={16} />
          <input 
            type="text" 
            placeholder="Search dishes..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium" 
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-450 hover:text-slate-700">
              <FiX size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Items", value: stats.total, icon: <FiLayers size={16} />, color: "bg-blue-50/50 border-blue-100/50 text-blue-650" },
          { label: "Categories", value: stats.categories, icon: <FiTag size={16} />, color: "bg-amber-50/50 border-amber-100/50 text-amber-650" },
          { label: "Avg Price", value: `$${stats.avgPrice.toFixed(1)}`, icon: <FiDollarSign size={16} />, color: "bg-emerald-50/50 border-emerald-100/50 text-emerald-650" },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 shadow-sm ${stat.color}`}>
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100/80 flex items-center justify-center">{stat.icon}</div>
            <div>
              <p className="text-lg font-poppins font-extrabold text-slate-900 leading-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Sorts */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full sm:w-auto">
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white border-slate-205 text-slate-500 hover:border-slate-350 hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-2xs font-bold uppercase tracking-wider text-slate-655 outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {/* Main Table view */}
      <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[80px_2.5fr_1.2fr_1fr_1.2fr_1fr_auto] gap-4 px-6 py-4.5 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          <span>Photo</span>
          <span>Dish Name</span>
          <span>Category</span>
          <span>Veg/Non-Veg</span>
          <span>Prep / Cal</span>
          <span>Price</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-xl w-1/3" />
                  <div className="h-3 bg-slate-50 rounded-xl w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-440 text-center">
            <FiAlertCircle size={28} className="text-slate-350 mb-3" />
            <p className="font-bold text-slate-705 text-sm">{search || categoryFilter !== 'All' ? 'No matches found' : 'No menu dishes yet'}</p>
            <p className="text-xs text-slate-400 mt-1">Try tweaking filters or add your first item to menu.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div 
                key={item._id} 
                className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[80px_2.5fr_1.2fr_1fr_1.2fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-slate-50/40 transition-colors group"
              >
                {/* Photo */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-150/45 flex-shrink-0">
                  <img src={`${url}/images/${item.image}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Name & Mobiles sub info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{item.name}</p>
                    {!item.isAvailable && (
                      <span className="bg-rose-50 text-rose-550 border border-rose-100 text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <p className="sm:hidden text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex flex-wrap gap-1.5 items-center">
                    <span className={`px-2 py-0.5 rounded border ${categoryColors[item.category] || 'bg-slate-100 text-slate-600'}`}>{item.category}</span>
                    <span className="text-emerald-600 font-extrabold">${item.price}</span>
                  </p>
                </div>

                {/* Category badge */}
                <span className={`hidden sm:inline-flex items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-100/50 ${categoryColors[item.category] || 'bg-slate-100 text-slate-600'}`}>
                  {item.category}
                </span>

                {/* Veg/Non-Veg indicators */}
                <span className="hidden sm:inline-block">
                  <Badge variant={item.isVeg ? 'success' : 'danger'} size="sm" dot className="font-bold border-0 bg-transparent py-0 px-0">
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </Badge>
                </span>

                {/* Prep & Calories details */}
                <div className="hidden sm:block text-slate-500 text-xs font-semibold">
                  <p className="flex items-center gap-1"><FiClock size={11} className="text-slate-400" /> {item.preparationTime ?? 20}m</p>
                  {item.calories && <p className="flex items-center gap-1 mt-0.5"><FiActivity size={11} className="text-slate-400" /> {item.calories} kcal</p>}
                </div>

                {/* Price */}
                <p className="hidden sm:block font-poppins font-extrabold text-slate-900 text-sm">${item.price}</p>

                {/* Action buttons */}
                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                  <button 
                    onClick={() => setEditItem(item)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100/50 transition-all duration-200"
                    aria-label={`Edit ${item.name}`}
                  >
                    <FiEdit size={14} />
                  </button>
                  <button 
                    onClick={() => removeFood(item._id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100/50 transition-all duration-200"
                    aria-label={`Remove ${item.name}`}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmationModal 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    </div>
  );
};

export default List;
