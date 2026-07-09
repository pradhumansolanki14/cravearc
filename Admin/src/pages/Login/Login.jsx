import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiLoader, FiAlertCircle, FiShield } from "react-icons/fi";
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

  const inputContainerClass = (val) => {
    const hasVal = !!val;
    return `relative flex items-center bg-slate-900/60 border-2 rounded-2xl px-4 py-3.5 transition-all duration-300 ${hasVal ? "border-slate-800 focus-within:border-orange-500" : "border-slate-800/80 focus-within:border-orange-500"
      } focus-within:bg-slate-900 focus-within:shadow-[0_0_20px_rgba(249,115,22,0.1)]`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative ambient glowing background filters */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none filter blur-[100px]"
        style={{ background: "radial-gradient(circle, #ea580c 0%, transparent 70%)", transform: "translate(20%, -20%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full opacity-10 pointer-events-none filter blur-[90px]"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", transform: "translate(-20%, 20%)" }}
      />
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="bg-slate-900/75 backdrop-blur-lg rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-slate-800/60 overflow-hidden"
        >
          {/* Top accent line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-rose-600" />

          <div className="p-8 sm:p-10">
            {/* Header / Logo */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(249,115,22,0.4)]">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-poppins font-extrabold text-xl text-white leading-none tracking-tight">Tomato</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Dashboard</p>
              </div>
            </div>

            <h1 className="font-poppins text-2xl font-extrabold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm font-semibold mb-6">Sign in to manage your restaurant</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm font-semibold text-red-400 flex items-center gap-2"
              >
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className={inputContainerClass(data.email)}>
                  <span className="text-slate-500 mr-3 pointer-events-none">
                    <FiMail size={16} />
                  </span>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                    placeholder="admin@tomato.com"
                    required
                    className="flex-1 bg-transparent text-sm font-medium text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Password</label>
                <div className={inputContainerClass(data.password)}>
                  <span className="text-slate-500 mr-3 pointer-events-none">
                    <FiLock size={16} />
                  </span>
                  <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
                    placeholder="Your password"
                    required
                    className="flex-1 bg-transparent text-sm font-medium text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl text-sm shadow-[0_8px_25px_-5px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_25px_-5px_rgba(249,115,22,0.45)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                      className="inline-block"
                    >
                      <FiLoader size={16} />
                    </motion.span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-500 font-semibold mt-6 tracking-wide">
          Tomato Admin v2.0 · Secure Admin Portal
        </p>
      </div>
    </div>
  );
};

export default Login;
