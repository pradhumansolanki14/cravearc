import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Orders from './pages/Orders/Orders'
import List from './pages/List/List'
import Add from './pages/Add/Add'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/Login'
import Coupons from './pages/Coupons/Coupons'
import Users from './pages/Users/Users'
import Settings from './pages/Settings/Settings'
import Categories from './pages/Categories/Categories'
import Cuisines from './pages/Cuisines/Cuisines'
import Banners from './pages/Banners/Banners'
import Restaurants from './pages/Restaurants/Restaurants'
import RestaurantProfile from './pages/RestaurantProfile/RestaurantProfile'
import Reviews from './pages/Reviews/Reviews'
import PlatformReviews from './pages/PlatformReviews/PlatformReviews'
import CategoryRequests from './pages/CategoryRequests/CategoryRequests'
import { Toaster } from 'react-hot-toast'
import { useAdmin } from './context/AdminContext'

// Route guard — redirects to /dashboard when user role isn't allowed
const RouteGuard = ({ children, allowedRoles }) => {
  const { adminRole } = useAdmin()
  if (allowedRoles && !allowedRoles.includes(adminRole)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const App = () => {
  const url = 'http://localhost:4000'
  const { adminToken } = useAdmin()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('admin_sidebar_collapsed', String(next))
      return next
    })
  }

  if (!adminToken) return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'rounded-xl shadow-premium border border-slate-100 text-xs font-semibold' }} />
      <Login />
    </>
  )

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col overflow-hidden relative">
      <Toaster position="top-right" toastOptions={{ className: 'rounded-xl shadow-premium border border-slate-100 text-xs font-semibold' }} />
      
      {/* Rebuilt Top Navigation Bar */}
      <Navbar 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Floating Sidebar Navigation */}
        <Sidebar 
          sidebarCollapsed={sidebarCollapsed} 
          toggleSidebar={toggleSidebar} 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
        />
        
        {/* Page Main Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8 transition-all duration-300">
          <Routes>
            <Route path='/' element={<Navigate to="/dashboard" replace />} />
            <Route path='/dashboard' element={<Dashboard url={url} />} />

            {/* Vendor (Restaurant_Manager) routes */}
            <Route path='/add' element={<Add url={url} />} />
            <Route path='/list' element={<List url={url} />} />
            <Route path='/orders' element={<Orders url={url} />} />
            <Route path='/coupons' element={<Coupons url={url} />} />
            <Route path='/restaurant-profile' element={
              <RouteGuard allowedRoles={['vendor']}>
                <RestaurantProfile url={url} />
              </RouteGuard>
            } />
            <Route path='/reviews' element={
              <RouteGuard allowedRoles={['vendor']}>
                <Reviews url={url} />
              </RouteGuard>
            } />

            {/* Platform_Admin (superadmin) only routes */}
            <Route path='/restaurants' element={
              <RouteGuard allowedRoles={['superadmin']}>
                <Restaurants url={url} />
              </RouteGuard>
            } />
            <Route path='/users' element={
              <RouteGuard allowedRoles={['superadmin']}>
                <Users url={url} />
              </RouteGuard>
            } />
            <Route path='/categories' element={
              <RouteGuard allowedRoles={['superadmin']}>
                <Categories url={url} />
              </RouteGuard>
            } />
            <Route path='/cuisines' element={
              <RouteGuard allowedRoles={['superadmin']}>
                <Cuisines url={url} />
              </RouteGuard>
            } />
            <Route path='/banners' element={
              <RouteGuard allowedRoles={['superadmin']}>
                <Banners url={url} />
              </RouteGuard>
            } />
            <Route path='/settings' element={
              <RouteGuard allowedRoles={['superadmin']}>
                <Settings url={url} />
              </RouteGuard>
            } />
            <Route path='/platform-reviews' element={
              <RouteGuard allowedRoles={['superadmin']}>
                <PlatformReviews url={url} />
              </RouteGuard>
            } />
            <Route path='/category-requests' element={
              <CategoryRequests url={url} />
            } />


            {/* Fallback */}
            <Route path='*' element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
