import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiBookOpen, FiPlus, FiX, FiEdit, FiTrash2, FiInfo } from "react-icons/fi";
import { Card, Badge, Button, Input, ConfirmationModal } from "../../components/ui";

const EMOJI_OPTIONS = ["🍝","🥡","🍛","🍔","🌮","🍱","🍜","🥙","🍕","🥩","🍣","🍤","🍲","🫕","🧆","🥘","🍖","🫔"];

const Cuisines = ({ url }) => {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // cuisine object being edited
  const [form, setForm] = useState({ name: "", icon: "🍽️" });
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const token = localStorage.getItem("adminToken");

  const fetchCuisines = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/cuisines`);
      if (res.data.success) {
        setCuisines(res.data.data);
      }
    } catch {
      toast.error("Failed to load cuisines");
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchCuisines(); 
  }, []);

  const openAdd = () => { 
    setEditing(null); 
    setForm({ name: "", icon: "🍽️" }); 
    setShowForm(true); 
  };
  
  const openEdit = (c) => { 
    setEditing(c); 
    setForm({ name: c.name, icon: c.icon || "🍽️" }); 
    setShowForm(true); 
  };
  
  const closeForm = () => { 
    setShowForm(false); 
    setEditing(null); 
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let res;
      if (editing) {
        res = await axios.put(`${url}/api/cuisines/${editing._id}`, form, { headers: { token } });
      } else {
        res = await axios.post(`${url}/api/cuisines`, form, { headers: { token } });
      }
      if (res.data.success) {
        toast.success(editing ? "Cuisine updated successfully!" : "New cuisine successfully created!");
        closeForm();
        fetchCuisines();
      } else {
        toast.error(res.data.message || "Error");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    }
    setSaving(false);
  };

  const handleDelete = (c) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Cuisine",
      message: `Are you sure you want to delete cuisine "${c.name}"? This will fail if any restaurant uses it.`,
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        try {
          const res = await axios.delete(`${url}/api/cuisines/${c._id}`, { headers: { token } });
          if (res.data.success) {
            toast.success("Cuisine successfully deleted!");
            fetchCuisines();
          } else {
            toast.error(res.data.message || "Cannot delete");
          }
        } catch (err) {
          const msg = err.response?.data?.message || "Delete failed";
          if (err.response?.status === 409) {
            toast.error("Cannot delete: cuisine is used by existing restaurants");
          } else {
            toast.error(msg);
          }
        }
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false }))
    });
  };

  return (
    <div className="max-w-3xl animate-fadeUp space-y-6">
      
      {/* Modal form */}
      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(5px)" }} 
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <Card variant="default" radius="3xl" padding="none" className="bg-white shadow-2xl w-full max-w-md overflow-hidden animate-fadeUp">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
            
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-50">
                <h2 className="font-poppins font-extrabold text-lg text-slate-900 leading-none">
                  {editing ? "Edit Cuisine" : "Add Cuisine"}
                </h2>
                <button 
                  onClick={closeForm} 
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <Input 
                  label="Cuisine Name"
                  required
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g. Italian" 
                />
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Icon / Emoji</label>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0">
                      {form.icon}
                    </span>
                    <input 
                      value={form.icon} 
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} 
                      placeholder="Emoji or short text" 
                      className="w-full h-11 px-4 py-2.5 bg-white border-2 border-slate-100 focus:border-emerald-450 rounded-xl text-sm text-slate-950 placeholder-slate-400 outline-none transition-all duration-200" 
                    />
                  </div>

                  <div className="grid grid-cols-9 gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                    {EMOJI_OPTIONS.map(em => (
                      <button 
                        key={em} 
                        type="button" 
                        onClick={() => setForm(f => ({ ...f, icon: em }))}
                        className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all ${
                          form.icon === em 
                            ? 'bg-emerald-100 ring-2 ring-emerald-400' 
                            : 'bg-white hover:bg-slate-100 shadow-3xs'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

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
            <FiBookOpen size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Cuisines</h1>
            <p className="text-slate-405 text-xs font-semibold">{cuisines.length} registered global cuisines</p>
          </div>
        </div>
        <Button 
          onClick={openAdd}
          variant="primary" 
          size="sm"
          leftIcon={<FiPlus />}
          className="font-bold shadow-emerald"
        >
          Add Cuisine
        </Button>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl border border-slate-105 animate-pulse" />)}
        </div>
      ) : cuisines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center p-8">
          <FiBookOpen size={28} className="text-slate-350 mb-3" />
          <p className="font-bold text-slate-705 text-sm">No cuisines yet</p>
          <p className="text-xs text-slate-400 mt-1">Create your first global cuisine category wrapper.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cuisines.map(c => (
            <Card 
              key={c._id} 
              variant="default"
              radius="2xl"
              padding="sm"
              className="border border-slate-100 shadow-sm p-4 flex items-center justify-between group hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-150/45 flex items-center justify-center text-2xl flex-shrink-0">
                  {c.icon || "🍽️"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-805 text-sm truncate leading-none mb-2">{c.name}</p>
                  <Badge variant={c.isActive !== false ? "success" : "neutral"} size="sm" className="font-bold">
                    {c.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEdit(c)} 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100/50 transition-all duration-200"
                  title="Edit cuisine"
                >
                  <FiEdit size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(c)} 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100/50 transition-all duration-200"
                  title="Delete cuisine"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </Card>
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
  );
};

export default Cuisines;
