import React, { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { BrandLogo } from '../ui'
import NotificationCenter from '../NotificationCenter/NotificationCenter'
import { 
  FiMenu, FiSearch, FiBell, FiLogOut, FiActivity, 
  FiChevronRight, FiCommand, FiSettings, FiChevronsRight 
} from 'react-icons/fi'
import { useLocation } from 'react-router-dom'

const routeMap = {
  '/dashboard': { parent: 'Overview', page: 'Console' },
  '/list': { parent: 'Catalog', page: 'Dishes List' },
  '/add': { parent: 'Catalog', page: 'Create Dish' },
  '/orders': { parent: 'Operations', page: 'Orders Log' },
  '/coupons': { parent: 'Catalog', page: 'Discount Coupons' },
  '/restaurant-profile': { parent: 'Settings', page: 'Restaurant Profile' },
  '/reviews': { parent: 'Operations', page: 'Customer Reviews' },
  '/restaurants': { parent: 'Operations', page: 'Restaurants List' },
  '/users': { parent: 'Operations', page: 'Registered Users' },
  '/categories': { parent: 'Catalog Config', page: 'Menu Categories' },
  '/cuisines': { parent: 'Catalog Config', page: 'Global Cuisines' },
  '/banners': { parent: 'Catalog Config', page: 'Hero Banners' },
  '/settings': { parent: 'Platform Settings', page: 'Console Settings' }
}

const Navbar = ({ mobileOpen, setMobileOpen }) => {
  const { adminName, adminRole, adminLogout } = useAdmin()
  const location = useLocation()
  
  const currentRoute = routeMap[location.pathname] || { parent: 'Console', page: 'Active View' }
  const workspaceTitle = adminRole === 'superadmin' ? 'CraveArc Global HQ' : 'Restaurant Manager'

  return (
    <header className="h-16 bg-white border-b border-zinc-200/50 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left items: Breadcrumbs & mobile burger */}
      <div className="flex items-center gap-4">
        {/* Burger menu trigger for mobile drawer */}
        <button 
          onClick={() => setMobileOpen(prev => !prev)}
          className="md:hidden w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors"
          aria-label="Toggle menu"
        >
          <FiMenu size={16} />
        </button>

        {/* Brand logo minimal symbol */}
        <div className="flex items-center gap-2 pr-3 border-r border-zinc-200/60 hidden sm:flex">
          <BrandLogo size={13} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">CraveArc</span>
        </div>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <span className="hover:text-zinc-600 transition-colors hidden md:inline">{currentRoute.parent}</span>
          <FiChevronRight size={10} className="hidden md:inline" />
          <span className="text-zinc-900 font-semibold">{currentRoute.page}</span>
        </div>
      </div>

      {/* Center item: Search bar */}
      <div className="hidden lg:flex items-center gap-2 bg-[#fafafa] border border-zinc-200 rounded-xl px-3 py-1.5 w-80 text-zinc-400 focus-within:border-zinc-450 focus-within:bg-white transition-all duration-200">
        <FiSearch size={13} />
        <input 
          type="text" 
          placeholder="Search logs, orders, coupons..." 
          className="bg-transparent border-0 outline-none text-xs text-zinc-800 placeholder-zinc-400 w-full"
        />
        <div className="flex items-center gap-0.5 bg-white border border-zinc-200/80 rounded-md px-1 py-0.5 shadow-3xs text-[9px] font-bold text-zinc-450">
          <FiCommand size={9} />
          <span>K</span>
        </div>
      </div>

      {/* Right items: Notifications & profile */}
      <div className="flex items-center gap-4">
        {/* Workspace select preview */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10px] font-mono text-zinc-450 uppercase tracking-widest leading-none font-bold">Workspace</span>
          <span className="text-xs font-bold text-zinc-800 mt-1">{workspaceTitle}</span>
        </div>

        {/* Separator line */}
        <div className="h-5 w-px bg-zinc-200/60 hidden sm:block" />

        {/* Notifications Icon with active pill */}
        <NotificationCenter />

        {/* Profile Avatar & logout trigger */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 font-mono font-bold text-white text-xs flex items-center justify-center shadow-sm select-none">
            {adminName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          
          <button
            onClick={adminLogout}
            className="w-8 h-8 rounded-lg hover:bg-rose-50 border border-zinc-150 hover:border-rose-100 flex items-center justify-center text-zinc-500 hover:text-rose-600 transition-all duration-200"
            title="Sign out of console"
          >
            <FiLogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
