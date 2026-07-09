import React from 'react'
import { useAdmin } from '../../context/AdminContext'
import { BrandLogo, BrandText } from '../ui'

const Navbar = () => {
  const { adminName, adminRole, adminLogout } = useAdmin()
  const roleLabel = adminRole === 'superadmin' ? 'Platform Admin' : adminRole === 'vendor' ? 'Restaurant Manager' : 'Admin'

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 lg:px-8 flex-shrink-0 sticky top-0 z-50">
      {/* Logo System */}
      <div className="flex items-center gap-2.5">
        <BrandLogo size={15} />
        <div className="flex items-center gap-2">
          <BrandText className="text-base" />
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-wide">Admin</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Live badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600">Live</span>
        </div>

        {/* Admin avatar + name */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-sm">
            {adminName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{adminName || 'Admin'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{roleLabel}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={adminLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 text-xs font-semibold"
          title="Sign out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
