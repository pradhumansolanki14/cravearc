import React from 'react'
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
import VendorRegister from './pages/VendorRegister/VendorRegister'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAdmin } from './context/AdminContext'

// Route guard — redirects to /dashboard when the user's role isn't in allowedRoles
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

  // Public route: vendor registration — accessible without a token
  // We check the path manually so /vendor/register works before login
  if (window.location.pathname === '/vendor/register') {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} toastClassName="rounded-2xl shadow-card border border-slate-100 font-sans text-sm" />
        <VendorRegister />
      </>
    )
  }

  if (!adminToken) return (
    <>
      <ToastContainer position="top-right" autoClose={3000} toastClassName="rounded-2xl shadow-card border border-slate-100 font-sans text-sm" />
      <Login />
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} toastClassName="rounded-2xl shadow-card border border-slate-100 font-sans text-sm" />
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
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

            {/* Public vendor registration — also reachable while logged in */}
            <Route path='/vendor/register' element={<VendorRegister />} />

            {/* Fallback */}
            <Route path='*' element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
