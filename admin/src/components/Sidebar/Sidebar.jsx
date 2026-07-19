import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import { 
  FiGrid, FiList, FiPlusCircle, FiFolder, FiGlobe, 
  FiImage, FiTag, FiShoppingBag, FiUsers, FiMessageSquare, 
  FiSettings, FiUser, FiActivity, FiArrowLeft, FiArrowRight, FiX, FiCheckCircle, FiSend,
  FiDollarSign, FiCreditCard, FiBriefcase, FiSlash
} from 'react-icons/fi'

const superAdminGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Console', sub: 'Analytics', icon: <FiGrid size={15} /> },
      { to: '/finance', label: 'Finance', sub: 'Accounting', icon: <FiDollarSign size={15} /> },
      { to: '/settlement-management', label: 'Settlements', sub: 'Vendor payouts', icon: <FiBriefcase size={15} /> },
      { to: '/refund-management', label: 'Refunds', sub: 'Customer claims', icon: <FiSlash size={15} /> }
    ]
  },
  {
    title: 'Platform Catalog',
    items: [
      { to: '/categories', label: 'Categories', sub: 'Menu folders', icon: <FiFolder size={15} /> },
      { to: '/category-requests', label: 'Category Requests', sub: 'Review workflow', icon: <FiList size={15} /> },
      { to: '/cuisines', label: 'Cuisines', sub: 'Global styles', icon: <FiGlobe size={15} /> },
      { to: '/banners', label: 'Banners', sub: 'Hero sliders', icon: <FiImage size={15} /> }
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/restaurants', label: 'Restaurants', sub: 'Vendors list', icon: <FiActivity size={15} /> },
      { to: '/users', label: 'Users', sub: 'Accounts', icon: <FiUsers size={15} /> },
      { to: '/coupons', label: 'Coupons', sub: 'Discounts', icon: <FiTag size={15} /> },
      { to: '/orders', label: 'All Orders', sub: 'Logistics', icon: <FiShoppingBag size={15} /> },
      { to: '/platform-reviews', label: 'Reviews', sub: 'Feedback', icon: <FiMessageSquare size={15} /> },
      { to: '/announcements', label: 'Announcements', sub: 'Broadcasts', icon: <FiSend size={15} /> }
    ]
  },
  {
    title: 'System Settings',
    items: [
      { to: '/settings', label: 'Settings', sub: 'Preferences', icon: <FiSettings size={15} /> }
    ]
  }
]

const vendorGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', sub: 'Realtime stats', icon: <FiGrid size={15} /> },
      { to: '/wallet', label: 'Wallet', sub: 'My earnings', icon: <FiCreditCard size={15} /> },
      { to: '/settlements', label: 'Payouts', sub: 'Bank transfers', icon: <FiBriefcase size={15} /> }
    ]
  },
  {
    title: 'Catalog',
    items: [
      { to: '/list', label: 'Food Menu', sub: 'Dishes list', icon: <FiList size={15} /> },
      { to: '/add', label: 'Add Item', sub: 'Create dish', icon: <FiPlusCircle size={15} /> },
      { to: '/category-requests', label: 'Category Requests', sub: 'My requests list', icon: <FiFolder size={15} /> },
      { to: '/coupons', label: 'Coupons', sub: 'Discounts', icon: <FiTag size={15} /> }
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/orders', label: 'Orders', sub: 'Kitchen logs', icon: <FiShoppingBag size={15} /> },
      { to: '/reviews', label: 'Reviews', sub: 'Feedback', icon: <FiMessageSquare size={15} /> }
    ]
  },
  {
    title: 'Restaurant Settings',
    items: [
      { to: '/restaurant-profile', label: 'Profile', sub: 'Shop page', icon: <FiUser size={15} /> }
    ]
  }
]

const Sidebar = ({ sidebarCollapsed, toggleSidebar, mobileOpen, setMobileOpen }) => {
  const { adminRole } = useAdmin()
  const groups = adminRole === 'vendor' ? vendorGroups : superAdminGroups

  const renderNavLinks = () => (
    <div className="flex-1 px-4 py-4 space-y-6">
      {groups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-1.5">
          {/* Group Header */}
          {!sidebarCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 pb-1">
              {group.title}
            </p>
          )}
          
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-zinc-950 text-white font-medium shadow-sm' 
                      : 'text-zinc-500 hover:bg-zinc-100/60 hover:text-zinc-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Hover state left line indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r-full" />
                    )}

                    <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                      {item.icon}
                    </div>
                    
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0 transition-all duration-200 animate-fadeIn">
                        <p className="text-xs font-semibold tracking-wide leading-none">{item.label}</p>
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* ── Desktop & Tablet Sidebar (Floating card wrapper) ── */}
      <aside 
        className={`hidden md:flex flex-col bg-white border border-zinc-200/50 shadow-premium m-4 rounded-2xl flex-shrink-0 overflow-y-auto relative transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Navigation items list */}
        <div className="flex-1">
          {renderNavLinks()}
        </div>

        {/* Console status footer */}
        {!sidebarCollapsed && (
          <div className="p-4 mx-4 mb-4 bg-zinc-50/70 border border-zinc-150/40 rounded-xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-emerald-500" size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-705">console v3.0</span>
            </div>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">Operational & Guarded</p>
          </div>
        )}

        {/* Collapsible toggle controller */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-end">
          <button 
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <FiArrowRight size={12} /> : <FiArrowLeft size={12} />}
          </button>
        </div>
      </aside>

      {/* ── Mobile Navigation sliding drawer ── */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs" 
        />

        <aside 
          className={`absolute top-4 bottom-4 left-4 w-64 bg-white shadow-2xl border border-zinc-200/50 rounded-2xl flex flex-col z-50 transition-transform duration-300 transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+20px)]'
          }`}
        >
          <div className="h-14 border-b border-zinc-100 px-4 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Console Menu</span>
            <button 
              onClick={() => setMobileOpen(false)}
              className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500"
            >
              <FiX size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderNavLinks()}
          </div>
        </aside>
      </div>
    </>
  )
}

export default Sidebar
