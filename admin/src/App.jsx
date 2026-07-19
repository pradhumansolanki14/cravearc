import React, { useState, lazy, Suspense } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAdmin } from './context/AdminContext'

// ── Lazy-loaded Pages ─────────────────────────────────────────
const Orders = lazy(() => import('./pages/Orders/Orders'))
const List = lazy(() => import('./pages/List/List'))
const Add = lazy(() => import('./pages/Add/Add'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Login = lazy(() => import('./pages/Login/Login'))
const Coupons = lazy(() => import('./pages/Coupons/Coupons'))
const Users = lazy(() => import('./pages/Users/Users'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const Categories = lazy(() => import('./pages/Categories/Categories'))
const Cuisines = lazy(() => import('./pages/Cuisines/Cuisines'))
const Banners = lazy(() => import('./pages/Banners/Banners'))
const Restaurants = lazy(() => import('./pages/Restaurants/Restaurants'))
const RestaurantProfile = lazy(() => import('./pages/RestaurantProfile/RestaurantProfile'))
const Reviews = lazy(() => import('./pages/Reviews/Reviews'))
const PlatformReviews = lazy(() => import('./pages/PlatformReviews/PlatformReviews'))
const CategoryRequests = lazy(() => import('./pages/CategoryRequests/CategoryRequests'))
const AnnouncementsPage = lazy(() => import('./pages/Announcements/AnnouncementsPage'))
const Wallet = lazy(() => import('./pages/Wallet/Wallet'))
const Finance = lazy(() => import('./pages/Finance/Finance'))
const Settlements = lazy(() => import('./pages/Settlements/Settlements'))
const SettlementManagement = lazy(() => import('./pages/Settlements/SettlementManagement'))
const RefundManagement = lazy(() => import('./pages/Refunds/RefundManagement'))

// Route guard — redirects to /dashboard when user role isn't allowed
const RouteGuard = ({ children, allowedRoles }) => {
  const { adminRole } = useAdmin()
  if (allowedRoles && !allowedRoles.includes(adminRole)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const App = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'
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
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-950"></div>
        </div>
      }>
        <Routes>
          <Route path='/partner/login' element={<Login />} />
          <Route path='/admin/login' element={<Login />} />
          <Route path='*' element={<Navigate to="/partner/login" replace />} />
        </Routes>
      </Suspense>
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
          <Suspense fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-950"></div>
            </div>
          }>
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
              <Route path='/wallet' element={
                <RouteGuard allowedRoles={['vendor']}>
                  <Wallet url={url} />
                </RouteGuard>
              } />
              <Route path='/settlements' element={
                <RouteGuard allowedRoles={['vendor']}>
                  <Settlements url={url} />
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
              <Route path='/announcements' element={
                <RouteGuard allowedRoles={['superadmin']}>
                  <AnnouncementsPage />
                </RouteGuard>
              } />
              <Route path='/finance' element={
                <RouteGuard allowedRoles={['superadmin']}>
                  <Finance url={url} />
                </RouteGuard>
              } />
              <Route path='/settlement-management' element={
                <RouteGuard allowedRoles={['superadmin']}>
                  <SettlementManagement url={url} />
                </RouteGuard>
              } />
              <Route path='/refund-management' element={
                <RouteGuard allowedRoles={['superadmin']}>
                  <RefundManagement url={url} />
                </RouteGuard>
              } />


              {/* Fallback */}
              <Route path='*' element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default App
