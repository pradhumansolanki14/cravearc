import React, { useState, lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// ── Layout ────────────────────────────────────────────────────
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

// ── Modals / Overlays ─────────────────────────────────────────
import LoginPopup from './components/LoginPopup/LoginPopup'

// ── Lazy-loaded Pages ─────────────────────────────────────────
const Home = lazy(() => import('./Pages/Home/Home'))
const Cart = lazy(() => import('./Pages/Cart/Cart'))
const PlaceOrder = lazy(() => import('./Pages/PlaceOrder/PlaceOrder'))
const Verify = lazy(() => import('./Pages/Verify/Verify'))
const MyOrders = lazy(() => import('./Pages/MyOrders/MyOrders'))
const Profile = lazy(() => import('./Pages/Profile/Profile'))
const NotFound = lazy(() => import('./Pages/NotFound/NotFound'))
const SearchPage = lazy(() => import('./Pages/Search/SearchPage'))
const OrderSuccess = lazy(() => import('./Pages/OrderSuccess/OrderSuccess'))
const Favorites = lazy(() => import('./Pages/Favorites/Favorites'))
const MenuPage = lazy(() => import('./Pages/MenuPage/MenuPage'))
const CategoriesPage = lazy(() => import('./Pages/Categories/CategoriesPage'))
const AppPage = lazy(() => import('./Pages/AppPage/AppPage'))
const ContactPage = lazy(() => import('./Pages/ContactPage/ContactPage'))
const OrderDetail = lazy(() => import('./Pages/OrderDetail/OrderDetail'))
const RestaurantsPage = lazy(() => import('./Pages/Restaurants/RestaurantsPage'))
const RestaurantDetail = lazy(() => import('./Pages/RestaurantDetail/RestaurantDetail'))
const BecomePartnerPage = lazy(() => import('./Pages/BecomePartner/BecomePartnerPage'))
const PartnerLandingPage = lazy(() => import('./Pages/PartnerLanding/PartnerLandingPage'))
const VerifyEmailPage = lazy(() => import('./Pages/VerifyEmail/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('./Pages/ForgotPassword/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./Pages/ResetPassword/ResetPasswordPage'))

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
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      }>
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

          {/* Production Authentication (P3-R2) */}
          <Route path='/verify-email' element={<VerifyEmailPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />

          {/* 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* ── Footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

export default App
