import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"
import useToast from '../../hooks/useToast'

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext)
  const [currState, setCurrState] = useState("Sign Up")
  const [data, setData] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData(d => ({ ...d, [name]: value }))
  }

  const onLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    let newUrl = url
    if (currState === "Login") newUrl += '/api/user/login'
    else newUrl += "/api/user/register"
    try {
      const response = await axios.post(newUrl, data)
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem("token", response.data.token)
        setShowLogin(false)
      } else {
        toast.error(response.data.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-orange-300 focus:bg-white transition-all duration-200"

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}
    >
      <div className="relative w-full max-w-md bg-white rounded-4xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Top gradient strip */}
        <div className="h-1.5 w-full btn-primary" />

        <div className="p-8">
          {/* Close */}
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-orange mb-6">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {currState === "Sign Up" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {currState === "Sign Up"
                ? "Start ordering your favorite food today"
                : "Sign in to continue ordering"}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-6">
            {["Sign Up", "Login"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCurrState(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currState === tab
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={onLogin} className="flex flex-col gap-3">
            {currState !== "Login" && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input name="name" onChange={onChangeHandler} value={data.name}
                  type="text" placeholder="Full name" required
                  className={`${inputClass} pl-11`} />
              </div>
            )}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input name="email" onChange={onChangeHandler} value={data.email}
                type="email" placeholder="Email address" required
                className={`${inputClass} pl-11`} />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input type="password" name="password" onChange={onChangeHandler} value={data.password}
                placeholder="Password" required
                className={`${inputClass} pl-11`} />
            </div>

            <label className="flex items-start gap-3 mt-1 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded-md border-2 border-slate-200 text-orange-500 focus:ring-orange-400 cursor-pointer" />
              <span className="text-xs text-slate-500 leading-relaxed">
                I agree to the{' '}
                <span className="text-orange-500 hover:underline font-medium cursor-pointer">Terms of Use</span>
                {' '}&{' '}
                <span className="text-orange-500 hover:underline font-medium cursor-pointer">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-4 btn-primary text-white font-bold rounded-2xl text-sm shadow-orange disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Please wait...
                </>
              ) : (
                currState === "Sign Up" ? "Create Account →" : "Sign In →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPopup
