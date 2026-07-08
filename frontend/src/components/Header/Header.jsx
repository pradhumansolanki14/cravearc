import React from 'react'

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Menu Items" },
  { value: "30 min", label: "Avg Delivery" },
  { value: "4.9★", label: "App Rating" },
]

const Header = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fed7aa 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d1fae5 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl mb-6 animate-fadeUp">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-orange-600">Now delivering in 30 minutes</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-6 animate-fadeUp delay-100">
              Delicious{' '}
              <span className="relative inline-block">
                <span className="text-gradient">food</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6C40 2 100 1 198 6" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{' '}
              at your door
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed max-w-md mb-8 animate-fadeUp delay-200">
              From your favorite local restaurants to hidden gems — hot, fresh, and delivered fast. Pick your craving and we'll handle the rest.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-fadeUp delay-300">
              <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 focus-within:border-orange-300 focus-within:bg-white transition-all duration-200">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter your delivery address..."
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                />
              </div>
              <a
                href="#explore-menu"
                className="flex items-center justify-center gap-2 px-7 py-3.5 btn-primary text-white font-bold rounded-2xl text-sm shadow-orange whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Food
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 animate-fadeUp delay-400">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-display font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center animate-fadeIn">
            {/* Main image container */}
            <div className="relative w-full max-w-lg mx-auto">
              {/* Circular background */}
              <div className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', transform: 'scale(0.9)' }} />

              <img
                src="/header_img.png"
                alt="Delicious Food"
                className="relative w-full h-auto object-contain drop-shadow-2xl animate-float"
                style={{ maxHeight: '480px' }}
              />

              {/* Floating card — top left */}
              <div className="absolute top-8 -left-4 sm:-left-12 bg-white rounded-2xl p-3.5 shadow-card border border-slate-100 animate-scaleIn delay-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg">🍕</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Pizza Margherita</p>
                    <p className="text-xs text-emerald-500 font-semibold">Ready in 20 min</p>
                  </div>
                </div>
              </div>

              {/* Floating card — bottom right */}
              <div className="absolute bottom-12 -right-4 sm:-right-10 bg-white rounded-2xl p-3.5 shadow-card border border-slate-100 animate-scaleIn delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100">
                    <div className="w-full h-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white font-bold text-sm">JD</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Order Confirmed!</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge — top right */}
              <div className="absolute top-16 -right-2 sm:right-4 bg-emerald-500 text-white rounded-2xl px-3 py-2 shadow-green animate-scaleIn delay-200">
                <p className="text-xs font-bold">Free Delivery</p>
                <p className="text-[10px] opacity-80">on first order</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category quick-scroll pills */}
        <div className="mt-16 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide animate-fadeUp delay-500">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap uppercase tracking-wider">Quick pick:</span>
          {["🍔 Burgers", "🍕 Pizza", "🍜 Noodles", "🥗 Salads", "🍰 Desserts", "🌮 Wraps", "🍣 Sushi"].map((c, i) => (
            <a
              key={i}
              href="#explore-menu"
              className="flex-shrink-0 px-4 py-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-sm font-medium text-slate-600 hover:text-orange-600 rounded-xl transition-all duration-200"
            >
              {c}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Header
