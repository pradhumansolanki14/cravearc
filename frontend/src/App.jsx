import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// ── Layout ────────────────────────────────────────────────────
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

// ── Modals / Overlays ─────────────────────────────────────────
import LoginPopup from './components/LoginPopup/LoginPopup'

// ── Pages ─────────────────────────────────────────────────────
import Home from './Pages/Home/Home'
import Cart from './Pages/Cart/Cart'
import PlaceOrder from './Pages/PlaceOrder/PlaceOrder'
import Verify from './Pages/Verify/Verify'
import MyOrders from './Pages/MyOrders/MyOrders'
import Profile from './Pages/Profile/Profile'
import NotFound from './Pages/NotFound/NotFound'
import SearchPage from './Pages/Search/SearchPage'
import OrderSuccess from './Pages/OrderSuccess/OrderSuccess'
import Favorites from './Pages/Favorites/Favorites'
import MenuPage from './Pages/MenuPage/MenuPage'
import CategoriesPage from './Pages/Categories/CategoriesPage'
import AppPage from './Pages/AppPage/AppPage'
import ContactPage from './Pages/ContactPage/ContactPage'
import OrderDetail from './Pages/OrderDetail/OrderDetail'
import RestaurantsPage from './Pages/Restaurants/RestaurantsPage'
import RestaurantDetail from './Pages/RestaurantDetail/RestaurantDetail'
import BecomePartnerPage from './Pages/BecomePartner/BecomePartnerPage'
import PartnerLandingPage from './Pages/PartnerLanding/PartnerLandingPage'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ── Global Toast System (Sprint 1) ───────────────────── */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Poppins', 'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px -8px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
            maxWidth: '380px',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#ecfdf5',
            },
          },
          error: {
            style: {
              background: '#fff1f2',
              color: '#881337',
              border: '1px solid #fecdd3',
            },
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#fff1f2',
            },
          },
          loading: {
            style: {
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
            },
          },
        }}
      />

      {/* ── Auth Modal ────────────────────────────────────────── */}
      {showLogin && <LoginPopup setShowLogin={setShowLogin} initialState={showLogin} />}



      {/* ── Navigation ───────────────────────────────────────── */}
      <Navbar setShowLogin={setShowLogin} />

      {/* ── Routes ───────────────────────────────────────────── */}
      <Routes>
        {/* Core */}
        <Route path='/' element={<Home setShowLogin={setShowLogin} />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={<PlaceOrder />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/order-success' element={<OrderSuccess />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/favorites' element={<Favorites />} />
        <Route path='/search' element={<SearchPage />} />

        {/* Detail pages */}
        <Route path='/order/:id' element={<OrderDetail />} />

        {/* Independent nav pages */}
        <Route path='/menu' element={<MenuPage />} />
        <Route path='/categories' element={<CategoriesPage />} />
        <Route path='/app' element={<AppPage />} />
        <Route path='/contact' element={<ContactPage />} />

        {/* Restaurant listing + detail */}
        <Route path='/restaurants' element={<RestaurantsPage />} />
        <Route path='/restaurant/:id' element={<RestaurantDetail />} />

        {/* Partner landing page → registration funnel */}
        <Route path='/become-a-partner' element={<PartnerLandingPage />} />
        <Route path='/vendor-register'  element={<BecomePartnerPage />} />

        {/* 404 */}
        <Route path='*' element={<NotFound />} />
      </Routes>

      {/* ── Footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

export default App
