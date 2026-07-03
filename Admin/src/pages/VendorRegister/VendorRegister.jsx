import React, { useState } from 'react'
import axios from 'axios'

const VendorRegister = () => {
  const url = "http://localhost:4000";
  const [form, setForm] = useState({ name: "", email: "", password: "", restaurantName: "", description: "", cuisine: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [closed, setClosed] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMessage(""); setError("");
    try {
      const res = await axios.post(`${url}/api/admin/vendor/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        restaurantName: form.restaurantName,
        restaurantDescription: form.description,
        cuisine: form.cuisine,
        address: form.address,
        phone: form.phone,
      });
      if (res.data.success) setMessage(res.data.message);
      else if (res.status === 403 || res.data.message?.includes("closed")) { setClosed(true); setError(res.data.message); }
      else setError(res.data.message);
    } catch (err) {
      if (err.response?.status === 403) { setClosed(true); setError(err.response.data.message || "Registrations are closed"); }
      else setError("Connection failed. Is the backend running?");
    }
    setLoading(false);
  };

  const inp = "w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-orange-300 focus:bg-white transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-orange-600" />
        <div className="p-8">
          <div className="mb-6">
            <h1 className="font-bold text-2xl text-slate-900">Register your restaurant</h1>
            <p className="text-slate-400 text-sm mt-1">Join the Tomato platform. Your account will be reviewed before approval.</p>
          </div>
          {message ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-medium text-center">
              ✅ {message}
              <div className="mt-3"><a href="/" className="text-orange-500 font-semibold hover:underline text-xs">← Back to login</a></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className={inp} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" required className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Restaurant Name</label>
                <input name="restaurantName" value={form.restaurantName} onChange={handleChange} placeholder="Your restaurant name" required className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description of your restaurant" rows={2} className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Cuisine</label>
                  <input name="cuisine" value={form.cuisine} onChange={handleChange} placeholder="e.g. Italian" className={inp} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Restaurant address" className={inp} />
              </div>
              <button
                type="submit"
                disabled={loading || closed}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : closed ? "Registrations Closed" : "Submit Registration"}
              </button>
              <p className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <a href="/" className="text-orange-500 font-semibold hover:underline">Sign in</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
