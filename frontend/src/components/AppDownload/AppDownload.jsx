import React from 'react'
import { BRAND } from '../../constants/brand'

const features = [
  { icon: "⚡", title: "Lightning Fast", desc: "Order in under 30 seconds" },
  { icon: "📍", title: "Live Tracking", desc: "Watch your order in real-time" },
  { icon: "🎁", title: "Exclusive Deals", desc: "App-only discounts daily" },
]

const AppDownload = () => {
  return (
    <section id="app-download" className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl mb-6">
              <span className="text-xs font-bold text-emerald-450 uppercase tracking-widest">Mobile App</span>
            </div>
            <h2 className="font-poppins text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Order on the go.{' '}
              <span className="text-gradient-emerald">Anytime.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md font-semibold">
              Download the {BRAND.NAME} app for the ultimate food ordering experience. Exclusive deals, live tracking, and lightning-fast checkout.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-slate-400 font-semibold">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4">
              <a href="#" className="flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl group">
                <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.62.38.62 1.22 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
                </svg>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium leading-none mb-0.5">Get it on</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">Google Play</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium leading-none mb-0.5">Download on the</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">App Store</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right — Phone mockup */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone shell */}
              <div className="w-64 h-[500px] bg-slate-800 rounded-[3rem] border-4 border-slate-700 relative overflow-hidden shadow-2xl">
                {/* Screen */}
                <div className="absolute inset-2 bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="h-full bg-slate-950 flex flex-col items-center justify-center gap-4 p-6 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-emerald-500 filter blur-xl" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-emerald mb-2">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <p className="font-poppins font-extrabold text-lg text-white">{BRAND.NAME}</p>
                    <p className="text-xs text-slate-400 text-center font-semibold">Your favourite food, delivered fast</p>
                    <div className="w-full h-1.5 bg-slate-850 rounded-full mt-2">
                      <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full mt-3">
                      {["🍕 Pizza", "🥗 Salad", "🍔 Burger", "🍜 Noodles"].map((item, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center shadow-sm">
                          <p className="text-[10px] font-bold text-slate-350">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-full z-10" />
              </div>
              {/* Floating rating */}
              <div className="absolute -right-6 top-20 bg-white rounded-2xl p-3 shadow-card border border-slate-100">
                <p className="text-xs font-bold text-slate-900">App Store</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownload
