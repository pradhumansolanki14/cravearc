import React, { useState } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";

const Login = () => {
  const { adminLogin, url } = useAdmin();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${url}/api/admin/login`, data);
      if (res.data.success) {
        adminLogin(res.data.token, res.data.name, res.data.role, res.data.restaurantId);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-orange-300 focus:bg-white transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #fed7aa 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #d1fae5 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-4xl shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden animate-fadeUp">
          {/* Top accent bar */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_8px_25px_-5px_rgba(249,115,22,0.4)]">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-xl text-slate-900 leading-none">Tomato</p>
                <p className="text-xs text-slate-400 mt-0.5">Admin Dashboard</p>
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm mb-7">Sign in to manage your restaurant</p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm font-medium text-red-600 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                    placeholder="admin@tomato.com"
                    required
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
                    placeholder="Your password"
                    required
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: loading ? "none" : "0 8px 25px -5px rgba(249,115,22,0.4)" }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" style={{ animation: "rotate 0.8s linear infinite" }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Dashboard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>



          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Tomato Admin v2.0 · Secure Admin Portal
        </p>
      </div>
    </div>
  );
};

export default Login;
