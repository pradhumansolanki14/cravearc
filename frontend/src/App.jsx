import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Cart from './Pages/Cart/Cart'
import PlaceOrder from './Pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './Pages/Verify/Verify'
import MyOrders from './Pages/MyOrders/MyOrders'
import Profile from './Pages/Profile/Profile'
import NotFound from './Pages/NotFound/NotFound'
import SearchPage from './Pages/Search/SearchPage'
import OrderSuccess from './Pages/OrderSuccess/OrderSuccess'
import FoodDetail from './Pages/FoodDetail/FoodDetail'
import Favorites from './Pages/Favorites/Favorites'
import MenuPage from './Pages/MenuPage/MenuPage'
import AppPage from './Pages/AppPage/AppPage'
import ContactPage from './Pages/ContactPage/ContactPage'
import OrderDetail from './Pages/OrderDetail/OrderDetail'
import CartConflictModal from './components/CartConflictModal/CartConflictModal'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <CartConflictModal />
      <Navbar setShowLogin={setShowLogin} />
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

        {/* Food detail */}
        <Route path='/food/:id' element={<FoodDetail />} />
        <Route path='/order/:id' element={<OrderDetail />} />

        {/* Independent nav pages */}
        <Route path='/menu' element={<MenuPage />} />
        <Route path='/app' element={<AppPage />} />
        <Route path='/contact' element={<ContactPage />} />

        {/* 404 */}
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
