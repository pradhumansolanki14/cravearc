import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiLayers, FiPlus, FiX, FiUpload, FiTrash2, FiEdit, FiClock, FiCheckCircle } from "react-icons/fi";
import { Card, Badge, Button, Input, Select } from "../../components/ui";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const Banners = ({ url }) => {
  const [banners, setBanners] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", subtitle: "", restaurantId: "", order: 0, isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("adminToken");

  const fetchData = async () => {
    setLoading(true);
    try {
      const bannerRes = await axios.get(`${url}/api/banners`);
      if (bannerRes.data.success) setBanners(bannerRes.data.data);
      
      const restRes = await axios.get(`${url}/api/admin/restaurant/`, { headers: { token } });
      if (restRes.data.success) setRestaurants(restRes.data.data);
    } catch { 
      toast.error("Failed to load banners data"); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", restaurantId: "", order: 0, isActive: true });
    setImageFile(null); 
    setImagePreview("");
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ 
      title: b.title, 
      subtitle: b.subtitle || "", 
      restaurantId: b.restaurantId?._id || b.restaurantId || "", 
      order: b.order || 0, 
      isActive: b.isActive 
    });
    setImageFile(null);
    setImagePreview(b.image ? `${url}/images/${b.image}` : "");
    setShowForm(true);
  };

  const closeForm = () => { 
    setShowForm(false); 
    setEditing(null); 
    setImageFile(null); 
    setImagePreview(""); 
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!editing && !imageFile) { 
      toast.error("Image is required for new banners"); 
      return; 
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("subtitle", form.subtitle);
      if (form.restaurantId) fd.append("restaurantId", form.restaurantId);
      fd.append("order", form.order);
      if (editing) fd.append("isActive", form.isActive);
      if (imageFile) fd.append("image", imageFile);

      let res;
      if (editing) {
        res = await axios.put(`${url}/api/banners/${editing._id}`, fd, { headers: { token } });
      } else {
        res = await axios.post(`${url}/api/banners`, fd, { headers: { token } });
      }
      if (res.data.success) {
        toast.success(editing ? "Banner updated successfully!" : "New banner successfully created!");
        closeForm(); 
        fetchData();
      } else {
        toast.error(res.data.message || "Error saving banner");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    }
    setSaving(false);
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    try {
      const res = await axios.delete(`${url}/api/banners/${b._id}`, { headers: { token } });
      if (res.data.success) { 
        toast.success("Banner deleted successfully."); 
        fetchData(); 
      } else {
        toast.error(res.data.message);
      }
    } catch { 
      toast.error("Delete failed"); 
    }
  };

  return (
    <div className="max-w-4xl animate-fadeUp space-y-6">
      
      {/* Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(5px)" }} 
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <Card variant="default" radius="3xl" padding="none" className="bg-white shadow-2xl w-full max-w-lg overflow-hidden animate-fadeUp max-h-[85vh] flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
            
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-50">
                <h2 className="font-poppins font-extrabold text-lg text-slate-900 leading-none">
                  {editing ? "Edit Banner" : "Create Banner"}
                </h2>
                <button 
                  onClick={closeForm} 
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                
                {/* Image upload preview */}
                <div>
                  <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block mb-2">Banner Image {!editing && "*"}</label>
                  <label htmlFor="banner-img" className="cursor-pointer block">
                    <div className={`w-full h-36 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${
                      imagePreview ? "border-emerald-300 bg-emerald-50/5" : "border-slate-205 hover:border-emerald-450 bg-slate-50"
                    }`}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-400">
                          <FiUpload size={20} className="text-slate-350" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">Select Image Banner</p>
                          <p className="text-[9px] text-slate-400">JPEG, PNG, or WebP</p>
                        </div>
                      )}
                    </div>
                  </label>
                  <input id="banner-img" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                </div>

                <Input 
                  label="Banner Title"
                  required
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                  placeholder="e.g. Free Delivery Weekend!" 
                />
                
                <Input 
                  label="Subtitle Description"
                  value={form.subtitle} 
                  onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} 
                  placeholder="e.g. Order from select kitchens with no delivery charge" 
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Display Priority Order"
                    type="number" 
                    value={form.order} 
                    onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} 
                    min="0" 
                  />
                  
                  <Select 
                    label="Link to Restaurant"
                    value={form.restaurantId} 
                    onChange={e => setForm(f => ({ ...f, restaurantId: e.target.value }))}
                  >
                    <option value="">None (Generic Banner)</option>
                    {restaurants.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </Select>
                </div>

                {/* Switch active toggle */}
                {editing && (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150/45 rounded-2xl pt-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Banner Visibility</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Toggle banner display on customer frontend carousel</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                        form.isActive 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    >
                      <div className={`relative w-8 h-4 rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-slate-350"}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4.5" : "translate-x-0.5"}`} />
                      </div>
                      <span>{form.isActive ? "Active" : "Inactive"}</span>
                    </button>
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <Button type="button" onClick={closeForm} variant="outline" size="md" className="flex-1 font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} variant="primary" size="md" className="flex-1 font-bold shadow-emerald-lg">
                    {saving ? "Saving..." : editing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiLayers size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Banners</h1>
            <p className="text-slate-405 text-xs font-semibold">{banners.length} promotional carousel items</p>
          </div>
        </div>
        <Button 
          onClick={openAdd}
          variant="primary" 
          size="sm"
          leftIcon={<FiPlus />}
          className="font-bold shadow-emerald"
        >
          Create Banner
        </Button>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-52 bg-white rounded-3xl border border-slate-105 animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center p-8">
          <FiLayers size={28} className="text-slate-350 mb-3" />
          <p className="font-bold text-slate-705 text-sm">No banners yet</p>
          <p className="text-xs text-slate-400 mt-1">Create your first homepage promotion banner.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {banners.map(b => (
            <Card 
              key={b._id} 
              variant="default"
              radius="2xl"
              padding="none"
              className="border border-slate-100 shadow-sm overflow-hidden group hover:border-emerald-250 transition-colors"
            >
              <div className="h-36 overflow-hidden bg-slate-50 relative">
                {b.image ? (
                  <img src={`${url}/images/${b.image}`} alt={b.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">No Image Banner</div>
                )}
                
                {/* Active/inactive absolute label */}
                <div className="absolute top-3 left-3">
                  <Badge variant={b.isActive ? "success" : "neutral"} size="sm" className="font-bold border-0 shadow-sm">
                    {b.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-805 text-sm truncate leading-none mb-1.5">{b.title}</p>
                  {b.subtitle && <p className="text-2xs text-slate-400 font-bold truncate">{b.subtitle}</p>}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 tracking-wider">
                      Priority Order: {b.order}
                    </span>
                    {b.restaurantId && (
                      <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 tracking-wider">
                        Linked Store
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button 
                    onClick={() => openEdit(b)} 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100/50 transition-all duration-200"
                    title="Edit banner settings"
                  >
                    <FiEdit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(b)} 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100/50 transition-all duration-200"
                    title="Delete promotion banner"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default Banners;
