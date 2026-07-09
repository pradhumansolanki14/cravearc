import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiLock, FiCheck, FiArrowRight, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import useToast from '../../hooks/useToast';

const LoginPopup = ({ setShowLogin, initialState }) => {
  const { url, setToken } = useContext(StoreContext);
  
  // Map initialState string correctly: default to "Login" if not explicitly "Sign Up"
  const defaultTab = initialState === "Sign Up" ? "Sign Up" : "Login";
  const [currState, setCurrState] = useState(defaultTab);
  
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Reset fields on tab change to prevent input carryover
  useEffect(() => {
    setData({ name: "", email: "", password: "" });
  }, [currState]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    
    if (currState === "Sign Up" && !agree) {
      toast.error("Please agree to the Terms of Use & Privacy Policy.");
      return;
    }

    setLoading(true);
    let newUrl = url;
    if (currState === "Login") {
      newUrl += '/api/user/login';
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success(currState === "Login" ? "Logged in successfully!" : "Account created successfully!");
        setShowLogin(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputContainerClass = (name) => {
    const hasVal = !!data[name];
    return `relative flex items-center bg-slate-50 border-2 rounded-2xl px-4 py-3.5 transition-all duration-300 ${
      hasVal ? "border-slate-200 focus-within:border-emerald-500" : "border-slate-100 focus-within:border-emerald-500"
    } focus-within:bg-white focus-within:shadow-[0_8px_30px_rgba(16,185,129,0.06)]`;
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Authentication Form"
      >
        {/* Backdrop glassmorphism overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={() => setShowLogin(false)}
        />

        {/* Auth Card container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100/60 overflow-hidden z-10"
        >
          {/* Accent colored top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            aria-label="Close"
            className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <FiX size={18} />
          </button>

          <div className="p-8 sm:p-9">
            {/* Circular glowing header icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] mb-6">
              <FiLock className="w-6 h-6 text-white" />
            </div>

            {/* Form Headers */}
            <div className="mb-6">
              <h2 className="font-poppins text-2xl font-extrabold text-slate-900 leading-tight">
                {currState === "Sign Up" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-slate-400 text-sm font-semibold mt-1">
                {currState === "Sign Up"
                  ? "Start ordering your favorite food today"
                  : "Sign in to continue ordering"}
              </p>
            </div>

            {/* Sliding Pill Tab Switcher */}
            <div className="flex gap-1.5 p-1.5 bg-slate-100 border border-slate-200/40 rounded-2xl mb-6">
              {["Login", "Sign Up"].map((tab) => {
                const active = currState === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCurrState(tab)}
                    className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      active ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-auth-tab"
                        className="absolute inset-0 bg-white border border-slate-200/50 rounded-xl shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {tab === "Login" ? "Sign In" : "Register"}
                  </button>
                );
              })}
            </div>

            {/* Input fields form */}
            <form onSubmit={onLogin} className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {currState === "Sign Up" && (
                    <div className={inputContainerClass("name")}>
                      <span className="text-slate-400 mr-3 pointer-events-none">
                        <FiUser size={16} />
                      </span>
                      <input
                        name="name"
                        value={data.name}
                        onChange={onChangeHandler}
                        type="text"
                        placeholder="Full name"
                        required
                        className="flex-1 bg-transparent text-sm font-medium text-slate-850 placeholder-slate-400 outline-none"
                      />
                    </div>
                  )}

                  <div className={inputContainerClass("email")}>
                    <span className="text-slate-400 mr-3 pointer-events-none">
                      <FiMail size={16} />
                    </span>
                    <input
                      name="email"
                      value={data.email}
                      onChange={onChangeHandler}
                      type="email"
                      placeholder="Email address"
                      required
                      className="flex-1 bg-transparent text-sm font-medium text-slate-850 placeholder-slate-400 outline-none"
                    />
                  </div>

                  <div className={inputContainerClass("password")}>
                    <span className="text-slate-400 mr-3 pointer-events-none">
                      <FiLock size={16} />
                    </span>
                    <input
                      name="password"
                      value={data.password}
                      onChange={onChangeHandler}
                      type="password"
                      placeholder="Password"
                      required
                      className="flex-1 bg-transparent text-sm font-medium text-slate-850 placeholder-slate-400 outline-none"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Terms Checkbox - Sign Up mode only */}
              {currState === "Sign Up" && (
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3 mt-1 cursor-pointer select-none"
                >
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="peer appearance-none w-4.5 h-4.5 rounded-lg border-2 border-slate-200 checked:bg-emerald-500 checked:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                    />
                    <FiCheck className="absolute text-white w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 leading-normal">
                    I agree to the{" "}
                    <span className="text-emerald-600 hover:underline font-bold">Terms of Use</span>
                    {" "}&{" "}
                    <span className="text-emerald-600 hover:underline font-bold">Privacy Policy</span>
                  </span>
                </motion.label>
              )}

              {/* Submit Action button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl text-sm shadow-emerald-sm hover:shadow-emerald transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                      className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full"
                    />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <span>{currState === "Sign Up" ? "Create Account" : "Sign In"}</span>
                    <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginPopup;
