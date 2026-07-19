import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiHome, FiCheck, FiX, FiRefreshCw, FiStar, FiTrash2, FiSearch, FiLayers, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { Card, Badge, Button, Input, ConfirmationModal } from "../../components/ui";

const Restaurants = ({ url }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // All | Pending | Approved
  const [actioning, setActioning] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const token = localStorage.getItem("adminToken");

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/admin/restaurant/`, { headers: { token } });
      if (res.data.success) {
        setRestaurants(res.data.data);
      } else {
        toast.error("Failed to load restaurants");
      }
    } catch {
      toast.error("Failed to load restaurants");
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchRestaurants(); 
  }, []);

  const handleApprove = async (r, approved) => {
    setActioning(r._id + (approved ? "_approve" : "_reject"));
    try {
      const res = await axios.post(`${url}/api/admin/vendors/approve`, { 
        vendorId: r.ownerId?._id || r.ownerId, 
        approved 
      }, { headers: { token } });
      if (res.data.success) {
        toast.success(`Restaurant ${approved ? "approved" : "rejected"} successfully!`);
        fetchRestaurants();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Action failed");
    }
    setActioning("");
  };

  const handleToggleFeatured = async (r) => {
    setActioning(r._id + "_featured");
    try {
      const res = await axios.patch(`${url}/api/admin/restaurant/${r._id}/featured`, {}, { headers: { token } });
      if (res.data.success) {
        toast.success(`Featured state ${res.data.data?.featured ? "enabled" : "disabled"}`);
        fetchRestaurants();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Action failed");
    }
    setActioning("");
  };

  const handleSoftDelete = (r) => {
    setConfirmDialog({
      isOpen: true,
      title: "Deactivate Restaurant",
      message: `Are you sure you want to deactivate restaurant "${r.name}"? This will set it as unapproved and closed.`,
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        setActioning(r._id + "_delete");
        try {
          const res = await axios.delete(`${url}/api/admin/restaurant/${r._id}`, { headers: { token } });
          if (res.data.success) {
            toast.success("Restaurant successfully deactivated!");
            fetchRestaurants();
          } else {
            toast.error(res.data.message);
          }
        } catch {
          toast.error("Action failed");
        }
        setActioning("");
      },
      onCancel: () => setConfirmDialog(d => ({ ...d, isOpen: false }))
    });
  };

  const filtered = restaurants.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || 
                        r.ownerId?.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || 
                        (filter === "Approved" && r.isApproved) || 
                        (filter === "Pending" && !r.isApproved);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: restaurants.length,
    approved: restaurants.filter(r => r.isApproved).length,
    pending: restaurants.filter(r => !r.isApproved).length,
    featured: restaurants.filter(r => r.featured).length,
  };

  return (
    <div className="max-w-5xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiHome size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Restaurants</h1>
            <p className="text-slate-405 text-xs font-semibold">{restaurants.length} registered restaurant profiles</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full sm:w-72 focus-within:border-emerald-450 transition-colors shadow-2xs">
          <FiSearch className="text-slate-400 flex-shrink-0" size={16} />
          <input 
            placeholder="Search name or owner..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium" 
          />
        </div>
      </div>

      {/* ── Stats Indicators ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Stores", value: stats.total, icon: <FiHome size={16} />, color: "bg-blue-50/50 border-blue-105 text-blue-650" },
          { label: "Approved", value: stats.approved, icon: <FiCheckCircle size={16} />, color: "bg-emerald-50/50 border-emerald-105 text-emerald-650" },
          { label: "Pending Review", value: stats.pending, icon: <FiClock size={16} />, color: "bg-amber-50/50 border-amber-105 text-amber-650" },
          { label: "Featured Stores", value: stats.featured, icon: <FiStar size={16} />, color: "bg-purple-50/50 border-purple-105 text-purple-650" },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 shadow-sm ${s.color}`}>
            <div className="w-9 h-9 bg-white border border-slate-100/80 rounded-xl flex items-center justify-center">
              {s.icon}
            </div>
            <div>
              <p className="text-lg font-poppins font-extrabold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtering Tabs ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["All", "Approved", "Pending"].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                filter === f 
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                  : "bg-white border-slate-205 text-slate-500 hover:border-slate-350 hover:text-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button 
          onClick={fetchRestaurants} 
          variant="outline" 
          size="sm"
          leftIcon={<FiRefreshCw size={12} />}
          className="font-bold border-slate-200 text-slate-655 bg-white hover:bg-slate-50"
        >
          Refresh
        </Button>
      </div>

      {/* ── Table Grid view ── */}
      <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card overflow-hidden">
        
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[80px_2.5fr_1.5fr_1fr_auto] gap-4 px-6 py-4.5 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          <span>Logo</span>
          <span>Store / Owner</span>
          <span>Attributes</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-440 text-center p-8">
            <FiAlertCircle size={28} className="text-slate-350 mb-3" />
            <p className="font-bold text-slate-705 text-sm">No restaurants found</p>
            <p className="text-xs text-slate-400 mt-1">No restaurants match the selected status filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(r => {
              const isActioning = actioning.startsWith(r._id);
              return (
                <div 
                  key={r._id} 
                  className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[80px_2.5fr_1.5fr_1fr_auto] gap-4 items-center px-6 py-4.5 hover:bg-slate-50/40 transition-colors group"
                >
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-150/45 flex-shrink-0 flex items-center justify-center text-slate-400 text-lg shadow-3xs">
                    {r.logo ? (
                      <img src={r.logo} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span>🏪</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-805 text-xs sm:text-sm truncate">{r.name}</p>
                      {r.featured && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded leading-none">
                          ★ Featured
                        </span>
                      )}
                    </div>
                    <p className="text-2xs text-slate-400 font-bold truncate mt-1">{r.ownerId?.email || "No manager email"}</p>
                  </div>

                  {/* Attributes */}
                  <div className="hidden sm:block">
                    {r.cuisine ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500">
                        {r.cuisine}
                      </span>
                    ) : (
                      <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider">No cuisine</span>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex sm:flex-col gap-1.5">
                    <Badge variant={r.isApproved ? "success" : "warning"} size="sm" dot className="font-bold">
                      {r.isApproved ? "Approved" : "Pending"}
                    </Badge>
                    <Badge variant={r.isOpen ? "primary" : "neutral"} size="sm" dot className="font-bold">
                      {r.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap justify-end">
                    {!r.isApproved ? (
                      <>
                        <button 
                          disabled={isActioning} 
                          onClick={() => handleApprove(r, true)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 border border-emerald-100/50"
                        >
                          Approve
                        </button>
                        <button 
                          disabled={isActioning} 
                          onClick={() => handleApprove(r, false)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 border border-rose-105/50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button 
                        disabled={isActioning} 
                        onClick={() => handleApprove(r, false)}
                        className="px-2.5 py-1.5 bg-slate-55 hover:bg-slate-100 text-slate-655 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 border border-slate-200"
                      >
                        Revoke
                      </button>
                    )}
                    
                    <button 
                      disabled={isActioning} 
                      onClick={() => handleToggleFeatured(r)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                        r.featured 
                          ? "bg-amber-50 border-amber-100 text-amber-500 hover:bg-amber-100" 
                          : "bg-slate-50 border-slate-150 text-slate-400 hover:text-amber-500 hover:bg-amber-50/50"
                      }`}
                      title={r.featured ? "Unfeature restaurant" : "Feature restaurant"}
                    >
                      <FiStar size={14} className={r.featured ? "fill-amber-500" : ""} />
                    </button>

                    <button 
                      disabled={isActioning} 
                      onClick={() => handleSoftDelete(r)}
                      className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-400 border border-transparent hover:border-rose-100/50 transition-all duration-200"
                      title="Deactivate storefront"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                </div>
              );
            })}
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

export default Restaurants;
