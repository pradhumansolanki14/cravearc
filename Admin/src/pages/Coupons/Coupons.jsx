import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiTag, FiPlus, FiTrash2, FiX, FiCalendar, FiDollarSign, FiClock, FiActivity, FiAlertTriangle } from "react-icons/fi";
import { Card, Badge, Button, Input, Select } from "../../components/ui";

const Coupons = ({ url }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    code: "", 
    discountType: "percent", 
    discount: "", 
    minOrder: "", 
    maxUses: "100", 
    expiresAt: "", 
    description: "" 
  });
  const [creating, setCreating] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axios.get(`${url}/api/coupons/list`, { headers: { token: adminToken } });
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch { 
      toast.error("Failed to load coupons"); 
    }
    setLoading(false);
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axios.post(`${url}/api/coupons/create`, form, { headers: { token: adminToken } });
      if (res.data.success) { 
        toast.success("New coupon successfully created!"); 
        setShowForm(false); 
        setForm({ code: "", discountType: "percent", discount: "", minOrder: "", maxUses: "100", expiresAt: "", description: "" }); 
        fetchCoupons(); 
      } else {
        toast.error(res.data.message);
      }
    } catch { 
      toast.error("Failed to create coupon"); 
    }
    setCreating(false);
  };

  const toggleCoupon = async (id) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axios.patch(`${url}/api/coupons/${id}/toggle`, {}, { headers: { token: adminToken } });
      if (res.data.success) { 
        toast.success(res.data.message); 
        fetchCoupons(); 
      }
    } catch { 
      toast.error("Failed to change status"); 
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axios.delete(`${url}/api/coupons/${id}`, { headers: { token: adminToken } });
      if (res.data.success) { 
        toast.success("Coupon deleted."); 
        fetchCoupons(); 
      }
    } catch { 
      toast.error("Failed to delete coupon"); 
    }
  };

  useEffect(() => { 
    fetchCoupons(); 
  }, []);

  return (
    <div className="max-w-5xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiTag size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Promo Coupons</h1>
            <p className="text-slate-405 text-xs font-semibold">{coupons.length} active coupon{coupons.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(f => !f)}
          variant="primary" 
          size="sm"
          leftIcon={<FiPlus />}
          className="font-bold shadow-emerald"
        >
          Create Coupon
        </Button>
      </div>

      {/* ── Form Drawer ── */}
      {showForm && (
        <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card animate-fadeUp">
          <h2 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider mb-5">Create Promo Coupon</h2>
          <form onSubmit={createCoupon} className="grid sm:grid-cols-2 gap-4">
            
            <Input 
              label="Coupon Code"
              required
              name="code"
              value={form.code} 
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
              placeholder="e.g. SUMMER25" 
              inputClass="font-mono font-bold"
            />
            
            <Select 
              label="Discount Type"
              name="discountType"
              value={form.discountType} 
              onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed Dollar Value ($)</option>
            </Select>

            <Input 
              label="Discount Amount"
              required
              type="number"
              min="1"
              name="discount"
              value={form.discount} 
              onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} 
              placeholder={form.discountType === 'percent' ? '25' : '10.00'} 
            />

            <Input 
              label="Min Order Amount ($)"
              type="number"
              min="0"
              name="minOrder"
              value={form.minOrder} 
              onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} 
              placeholder="0.00" 
            />

            <Input 
              label="Max Usage Limits"
              type="number"
              min="1"
              name="maxUses"
              value={form.maxUses} 
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} 
            />

            <Input 
              label="Expiration Date"
              required
              type="datetime-local"
              name="expiresAt"
              value={form.expiresAt} 
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} 
            />

            <div className="sm:col-span-2">
              <Input 
                label="Offer Description"
                name="description"
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                placeholder="e.g. 25% discount off summer food items" 
              />
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="button" onClick={() => setShowForm(false)} variant="outline" size="md" className="flex-1 font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={creating} variant="primary" size="md" className="flex-1 font-bold shadow-emerald-lg">
                {creating ? 'Creating...' : 'Generate Coupon'}
              </Button>
            </div>

          </form>
        </Card>
      )}

      {/* ── Coupons grid table listing ── */}
      <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card overflow-hidden">
        
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4.5 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          <span>Coupon Code</span>
          <span>Discount</span>
          <span>Min Order</span>
          <span>Usages</span>
          <span>Expires At</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2].map(i => <div key={i} className="h-12 bg-slate-50 rounded-2xl animate-pulse" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 p-8 text-slate-440">
            <FiTag className="mx-auto text-slate-300 mb-3" size={28} />
            <p className="font-bold text-slate-707 text-sm">No coupons found</p>
            <p className="text-xs text-slate-400 mt-1">Create your first restaurant promo discount code.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {coupons.map(c => {
              const expired = new Date() > new Date(c.expiresAt);
              return (
                <div 
                  key={c._id} 
                  className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4.5 hover:bg-slate-50/40 transition-colors"
                >
                  
                  {/* Code */}
                  <div>
                    <span className="font-mono font-extrabold text-slate-900 text-sm tracking-wide bg-slate-105 border border-slate-205 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    {c.description && <p className="text-2xs text-slate-400 mt-1 font-semibold leading-relaxed">{c.description}</p>}
                  </div>

                  {/* Value */}
                  <span className="font-poppins font-extrabold text-emerald-650 text-xs sm:text-sm">
                    {c.discount}{c.discountType === 'percent' ? '%' : '$'} Off
                  </span>

                  {/* Min order */}
                  <span className="hidden sm:block text-xs font-bold text-slate-500">
                    {c.minOrder > 0 ? `$${c.minOrder.toFixed(2)}` : 'None'}
                  </span>

                  {/* Uses */}
                  <span className="hidden sm:block text-xs font-bold text-slate-500">
                    {c.usedCount} / <span className="text-slate-400 font-medium">{c.maxUses}</span>
                  </span>

                  {/* Expiration */}
                  <div className="hidden sm:block">
                    {expired ? (
                      <Badge variant="danger" size="sm" dot className="font-bold border-0 bg-transparent py-0 px-0">
                        Expired
                      </Badge>
                    ) : (
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <FiCalendar className="text-slate-400" size={11} />
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                    <button 
                      onClick={() => toggleCoupon(c._id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                        c.isActive 
                          ? 'bg-emerald-50 text-emerald-705 border-emerald-100/50 hover:bg-emerald-100' 
                          : 'bg-slate-50 text-slate-450 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                    
                    <button 
                      onClick={() => deleteCoupon(c._id)} 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-350 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100/50 transition-all duration-200"
                      aria-label="Delete coupon"
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

    </div>
  );
};

export default Coupons;
