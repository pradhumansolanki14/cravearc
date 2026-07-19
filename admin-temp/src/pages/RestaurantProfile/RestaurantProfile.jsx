import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiHome, FiStar, FiMessageSquare, FiAward, FiUpload, FiMapPin, FiPhone, FiMail, FiClock, FiDollarSign, FiInfo, FiGlobe, FiWifi, FiCheck, FiZap, FiTrash2, FiPlus } from "react-icons/fi";
import { MdOutlineLocalParking, MdOutlineFoodBank, MdOutlineTableRestaurant } from "react-icons/md";
import { Card, Badge, Button, Input } from "../../components/ui";

const AMENITY_OPTIONS = [
  { label: "Pure Veg",    icon: MdOutlineFoodBank },
  { label: "Dine-In",    icon: MdOutlineTableRestaurant },
  { label: "Free WiFi",  icon: FiWifi },
  { label: "Parking",    icon: MdOutlineLocalParking },
  { label: "AC Seating", icon: FiZap },
  { label: "Fast Delivery", icon: FiCheck },
  { label: "Outdoor Seating", icon: FiCheck },
  { label: "Takeaway",   icon: FiCheck },
  { label: "Award Winning", icon: FiAward },
  { label: "Pet Friendly", icon: FiCheck },
];

const RestaurantProfile = ({ url }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const token = localStorage.getItem("adminToken");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/admin/restaurant/profile`, { headers: { token } });
      if (res.data.success) {
        const d = res.data.data;
        setProfile(d);
        setForm({
          name: d.name || "", description: d.description || "",
          cuisine: d.cuisine || "", address: d.address || "",
          phone: d.phone || "", email: d.email || "",
          website: d.website || "",
          deliveryFee: d.deliveryFee ?? 2, minOrder: d.minOrder ?? 0,
          openingHours: d.openingHours || "", preparationTime: d.preparationTime ?? 30,
          isOpen: d.isOpen ?? true,
          selectedTags: d.tags || [],
          gallery: d.gallery || [],
        });
        setLogoPreview(d.logo ? d.logo : "");
        setCoverPreview(d.coverImage ? d.coverImage : "");
      } else {
        toast.error(res.data.message);
      }
    } catch { 
      toast.error("Failed to load profile"); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchProfile(); 
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "logo") { 
      setLogoFile(file); 
      setLogoPreview(URL.createObjectURL(file)); 
    } else { 
      setCoverFile(file); 
      setCoverPreview(URL.createObjectURL(file)); 
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setGalleryFiles(prev => [...prev, ...files]);
  };

  const handleRemoveNewGallery = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingGallery = (index) => {
    setForm(f => ({
      ...f,
      gallery: (f.gallery || []).filter((_, i) => i !== index)
    }));
  };

  const handleToggleOpen = async () => {
    setTogglingOpen(true);
    const newVal = !form.isOpen;
    setForm(f => ({ ...f, isOpen: newVal })); // optimistic
    try {
      const fd = new FormData();
      fd.append("isOpen", newVal);
      const res = await axios.put(`${url}/api/admin/restaurant/profile`, fd, { headers: { token } });
      if (res.data.success) {
        setProfile(p => ({ ...p, isOpen: newVal }));
        toast.success(newVal ? "Restaurant is now Open" : "Restaurant is now Closed");
      } else {
        setForm(f => ({ ...f, isOpen: !newVal })); // revert
        toast.error(res.data.message);
      }
    } catch {
      setForm(f => ({ ...f, isOpen: !newVal })); // revert
      toast.error("Toggle failed");
    }
    setTogglingOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const allowed = ["name","description","cuisine","address","phone","email","website","deliveryFee","minOrder","openingHours","preparationTime"];
      allowed.forEach(k => { if (form[k] !== undefined) fd.append(k, form[k]); });
      fd.append("tags", JSON.stringify(form.selectedTags || []));
      fd.append("gallery", JSON.stringify(form.gallery || []));
      
      if (logoFile) fd.append("logo", logoFile);
      if (coverFile) fd.append("coverImage", coverFile);
      galleryFiles.forEach(file => {
        fd.append("gallery", file);
      });

      const res = await axios.put(`${url}/api/admin/restaurant/profile`, fd, { headers: { token } });
      if (res.data.success) {
        toast.success("Profile updated");
        const updatedData = res.data.data;
        setProfile(updatedData);
        setLogoFile(null); 
        setCoverFile(null);
        setGalleryFiles([]);
        setForm(f => ({
          ...f,
          gallery: updatedData.gallery || []
        }));
        if (updatedData.logo) setLogoPreview(updatedData.logo);
        if (updatedData.coverImage) setCoverPreview(updatedData.coverImage);
      } else {
        toast.error(res.data.message);
      }
    } catch { 
      toast.error("Save failed"); 
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="max-w-2xl space-y-5 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-2xl w-48" />
      <div className="h-44 bg-slate-100 rounded-3xl" />
      <div className="h-64 bg-slate-100 rounded-3xl" />
    </div>
  );

  return (
    <div className="max-w-2xl animate-fadeUp">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/35 flex items-center justify-center text-emerald-600">
            <FiHome size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Restaurant Profile</h1>
            <p className="text-slate-400 text-xs font-semibold">Manage your restaurant storefront details</p>
          </div>
        </div>
        
        {/* isOpen switch toggle */}
        <button 
          onClick={handleToggleOpen} 
          disabled={togglingOpen}
          className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-60 border ${
            form.isOpen 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
              : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
          }`}
        >
          <div className={`relative w-8 h-4 rounded-full transition-colors ${form.isOpen ? "bg-emerald-500" : "bg-slate-300"}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${form.isOpen ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </div>
          <span>{form.isOpen ? "Open" : "Closed"}</span>
        </button>
      </div>

      {/* ── Read-only stats block ── */}
      {profile && (
        <Card variant="flat" radius="2xl" padding="sm" className="mb-6 grid grid-cols-3 gap-3 border border-slate-100/50 bg-slate-50/50">
          {[
            { label: "Overall Rating", value: profile.rating?.toFixed(1) || "N/A", icon: <FiStar size={16} className="text-amber-500 fill-amber-500" /> },
            { label: "Reviews Received", value: profile.totalReviews || 0, icon: <FiMessageSquare size={16} className="text-blue-500" /> },
            { label: "Approval Status", value: profile.isApproved ? "Approved" : "Pending", icon: <FiAward size={16} className="text-emerald-500" /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center border border-slate-100/50 shadow-2xs">
              <div className="flex justify-center mb-1.5">{s.icon}</div>
              <p className="font-poppins font-bold text-slate-800 text-sm leading-none">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
            </div>
          ))}
        </Card>
      )}

      {/* ── Form settings ── */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Photo uploads */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm">
          <h2 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider mb-4">Images & Branding</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Restaurant Logo", file: logoFile, preview: logoPreview, id: "logo-inp", onChange: e => handleFileChange(e, "logo") },
              { label: "Cover Banner Image", file: coverFile, preview: coverPreview, id: "cover-inp", onChange: e => handleFileChange(e, "cover") },
            ].map(img => (
              <div key={img.label}>
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block mb-2">{img.label}</label>
                <label htmlFor={img.id} className="cursor-pointer block">
                  <div className={`w-full h-32 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all duration-300 ${
                    img.preview ? "border-emerald-200 bg-emerald-50/5" : "border-slate-200 hover:border-emerald-450 bg-slate-50/50 hover:bg-emerald-50/20"
                  }`}>
                    {img.preview ? (
                      <img src={img.preview} alt={img.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400">
                        <FiUpload size={20} className="text-slate-350" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">Select Image</p>
                      </div>
                    )}
                  </div>
                </label>
                <input id={img.id} type="file" accept="image/*" className="hidden" onChange={img.onChange} />
              </div>
            ))}
          </div>
        </Card>

        {/* Hotel Gallery Uploads */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <div>
            <h2 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider">Hotel Gallery</h2>
            <p className="text-xs text-slate-400 mt-1">Upload images of your hotel, premium ambiance, customers, menu lists, etc.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Existing uploaded images */}
            {(form.gallery || []).map((img, idx) => (
              <div key={`exist-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingGallery(idx)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <div className="bg-red-500/90 p-2 rounded-xl hover:bg-red-600 transition-colors">
                    <FiTrash2 size={16} />
                  </div>
                </button>
              </div>
            ))}

            {/* Staged new file selections */}
            {galleryFiles.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-400 border-dashed group bg-emerald-50/5">
                  <img src={previewUrl} alt={`New Stage ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wider uppercase">Staged</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewGallery(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <div className="bg-red-500/90 p-2 rounded-xl hover:bg-red-600 transition-colors">
                      <FiTrash2 size={16} />
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Trigger click slot to select files */}
            <label htmlFor="gallery-inp" className="cursor-pointer block aspect-square">
              <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-450 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-400">
                <FiPlus size={22} className="text-slate-400" />
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-405">Add Images</p>
              </div>
            </label>
            <input id="gallery-inp" type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
          </div>
        </Card>

        {/* Basic Details card */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50">Basic Information</h2>
          <Input
            label="Restaurant Name"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. CraveArc Kitchen"
          />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
              rows={3} 
              className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-emerald-450 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 resize-none"
              placeholder="Tell customers about your kitchen..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cuisine Tags"
              value={form.cuisine}
              onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}
              placeholder="e.g. Italian, Fast Food"
            />
            <Input
              label="Opening Hours"
              value={form.openingHours}
              onChange={e => setForm(f => ({ ...f, openingHours: e.target.value }))}
              placeholder="e.g. 9 AM – 11 PM"
            />
          </div>
        </Card>

        {/* Contact info card */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50">Contact & Location</h2>
          <Input
            label="Street Address"
            leftIcon={<FiMapPin size={14} />}
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="e.g. 123 Main St, New York, NY"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              leftIcon={<FiPhone size={14} />}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. +1 (555) 000-0000"
            />
            <Input
              label="Email Address"
              type="email"
              leftIcon={<FiMail size={14} />}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="e.g. manager@restaurant.com"
            />
          </div>
          <Input
            label="Website URL"
            type="url"
            leftIcon={<FiGlobe size={14} />}
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            placeholder="e.g. https://yourrestaurant.com"
          />
        </Card>

        {/* Amenities card */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <div>
            <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50">Amenities</h2>
            <p className="text-xs text-slate-400 mt-2">Select features available at your restaurant. These appear on your public storefront.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AMENITY_OPTIONS.map(({ label, icon: Icon }) => {
              const selected = (form.selectedTags || []).includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setForm(f => ({
                      ...f,
                      selectedTags: selected
                        ? f.selectedTags.filter(t => t !== label)
                        : [...(f.selectedTags || []), label],
                    }))
                  }
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    selected
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  {selected && <span className="ml-auto text-emerald-600"><FiCheck size={11} /></span>}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Delivery Rates card */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50">Delivery Configuration</h2>
          <div className="grid grid-cols-3 gap-3.5">
            <Input
              label="Delivery Fee (₹)"
              type="number"
              min="0"
              step="0.5"
              leftIcon={<span className="text-zinc-400 font-bold font-mono text-sm">₹</span>}
              value={form.deliveryFee}
              onChange={e => setForm(f => ({ ...f, deliveryFee: Number(e.target.value) }))}
            />
            <Input
              label="Min Order (₹)"
              type="number"
              min="0"
              leftIcon={<span className="text-zinc-400 font-bold font-mono text-sm">₹</span>}
              value={form.minOrder}
              onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))}
            />
            <Input
              label="Prep Time (min)"
              type="number"
              min="0"
              leftIcon={<FiClock size={13} />}
              value={form.preparationTime}
              onChange={e => setForm(f => ({ ...f, preparationTime: Number(e.target.value) }))}
            />
          </div>
        </Card>

        {/* Submit */}
        <Button 
          type="submit" 
          disabled={saving}
          variant="primary"
          size="lg"
          className="w-full font-bold shadow-emerald-lg h-12.5"
        >
          {saving ? "Saving Changes..." : "Save Profile Details"}
        </Button>
      </form>
    </div>
  );
};

export default RestaurantProfile;
