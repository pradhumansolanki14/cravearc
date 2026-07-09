import React from 'react'
import { BRAND } from '../../constants/brand'

const features = [
  { icon: "⚡", title: "Order in 30 Seconds", desc: "Streamlined checkout built for speed. Add to cart, pay, done." },
  { icon: "📍", title: "Live Order Tracking", desc: "Watch your delivery in real-time on the map. No more guessing." },
  { icon: "🎁", title: "Exclusive App Deals", desc: "Members-only discounts and surprise offers every day." },
  { icon: "🔔", title: "Smart Notifications", desc: "Know the moment your order leaves the kitchen and arrives." },
  { icon: "💳", title: "Saved Payments", desc: "Securely save your cards for one-tap checkout every time." },
  { icon: "❤️", title: "Favorites Sync", desc: "Your wishlisted dishes follow you across every device." },
]

const steps = [
  { num: "01", title: "Download the App", desc: "Available free on iOS App Store and Google Play Store." },
  { num: "02", title: "Create an Account", desc: "Sign up in seconds with your email or social login." },
  { num: "03", title: "Browse & Order", desc: "Choose from hundreds of dishes. Add to cart and checkout." },
  { num: "04", title: "Enjoy your Food", desc: "Track your order live and receive it hot at your door." },
]

const AppPage = () => {
  return (
    <div className="bg-white min-h-screen pt-4" id="app-download">
      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl mb-6">
            <span className="text-xs font-bold text-emerald-450 uppercase tracking-widest">📱 Mobile App</span>
          </div>
          <h1 className="font-poppins text-5xl sm:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Order smarter.<br />
            <span className="text-gradient-emerald">Live better.</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10 leading-relaxed font-semibold">
            The {BRAND.NAME} app is the fastest way to get fresh, delicious food from your favourite restaurants delivered straight to you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="flex items-center gap-3 px-6 py-4 bg-white hover:bg-slate-50 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl border border-slate-100">
              <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.62.38.62 1.22 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
              </svg>
              <div className="text-left">
                <p className="text-xs text-slate-405 font-semibold leading-none mb-1">Get it on</p>
                <p className="text-base font-extrabold text-slate-800 leading-none">Google Play</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 px-6 py-4 bg-white hover:bg-slate-50 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl border border-slate-100">
              <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <p className="text-xs text-slate-405 font-semibold leading-none mb-1">Download on the</p>
                <p className="text-base font-extrabold text-slate-800 leading-none">App Store</p>
              </div>
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-500">
            {[{ v: "4.9★", l: "App Store" }, { v: "4.8★", l: "Play Store" }, { v: "500K+", l: "Downloads" }].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-poppins font-extrabold text-white text-lg leading-none mb-1">{s.v}</p>
                <p className="text-xs text-slate-455 font-bold">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Features</span>
            </div>
            <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Everything you need</h2>
            <p className="text-slate-550 mt-3 max-w-lg mx-auto font-semibold">Designed for food lovers who want speed, simplicity, and great taste.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-poppins font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-555 text-sm leading-relaxed font-semibold">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl mb-4">
              <span className="text-xs font-bold text-slate-505 uppercase tracking-widest">How it works</span>
            </div>
            <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Ready in 4 steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-slate-200 -translate-x-4 z-0" />
                )}
                <div className="relative z-10 text-center p-5">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center font-poppins font-extrabold text-2xl text-emerald-500 mx-auto mb-4">{s.num}</div>
                  <h3 className="font-poppins font-bold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-slate-450 text-xs leading-relaxed font-semibold">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AppPage
