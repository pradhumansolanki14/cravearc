import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { StoreContext } from "../../context/StoreContext";
import { Button } from "../ui";

const NAV_ITEMS = [
  { label: "Home",    path: "/",        exact: true },
  { label: "Menu",    path: "/menu",    exact: false },
  { label: "App",     path: "/app",     exact: false },
  { label: "Contact", path: "/contact", exact: false },
];

const Navbar = ({ setShowLogin }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { token, setToken, cartItems, favorites, userName } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setShowProfileMenu(false);
    navigate("/");
  };

  const cartCount = Object.values(cartItems || {}).reduce((a, b) => a + (b > 0 ? b : 0), 0);
  const favCount = favorites?.length || 0;

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "py-3 bg-white/80 backdrop-blur-md shadow-card border-b border-slate-100" 
            : "py-5 bg-white/20 backdrop-blur-xs border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-emerald transition-all duration-300 group-hover:scale-105">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className="font-poppins font-extrabold text-xl text-slate-900 tracking-tight transition-colors">
                Tomato<span className="text-emerald-500">.</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center bg-slate-100/50 border border-slate-150/20 rounded-2xl p-1 gap-1 backdrop-blur-xs">
              {NAV_ITEMS.map(item => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      active
                        ? "text-emerald-700 font-extrabold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/30"
                    }`}
                  >
                    {active && (
                      <motion.span 
                        layoutId="active-pill" 
                        className="absolute inset-0 bg-white border border-slate-150/30 shadow-2xs rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-3">

              {/* Search Toggle */}
              <button
                onClick={() => navigate("/search")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-150/40 text-slate-550 hover:bg-white hover:border-slate-350 hover:text-slate-800 transition-all duration-300 hover:scale-105 shadow-3xs"
                aria-label="Search"
              >
                <FiSearch size={17} />
              </button>

              {/* Favorites — only when logged in */}
              {token && (
                <button
                  onClick={() => navigate("/favorites")}
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-150/40 text-slate-550 hover:bg-white hover:border-rose-200 hover:text-rose-500 transition-all duration-300 hover:scale-105 shadow-3xs"
                  aria-label="Favorites"
                >
                  <FiHeart size={17} className={favCount > 0 ? "fill-rose-550 text-rose-550" : ""} />
                  {favCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-3xs animate-fadeUp">
                      {favCount > 9 ? '9+' : favCount}
                    </span>
                  )}
                </button>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-150/40 text-slate-550 hover:bg-white hover:border-emerald-200 hover:text-emerald-650 transition-all duration-300 hover:scale-105 shadow-3xs"
                aria-label="Cart"
              >
                <FiShoppingBag size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-emerald-sm animate-fadeUp">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Auth / Account Menu */}
              {!token ? (
                <Button
                  onClick={() => setShowLogin(true)}
                  variant="primary"
                  size="sm"
                  className="hidden md:flex font-bold shadow-emerald px-5 py-2.5 h-10 text-xs uppercase tracking-wider rounded-xl"
                >
                  Sign in
                </Button>
              ) : (
                <div 
                  className="relative hidden md:block"
                  onMouseEnter={() => setShowProfileMenu(true)}
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <button 
                    className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden border border-slate-150/40 hover:border-emerald-250 transition-all duration-300 hover:scale-105 shadow-3xs" 
                    aria-label="Profile"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-poppins font-extrabold text-xs tracking-wider">
                      {userName 
                        ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : <FiUser size={16} />
                      }
                    </div>
                  </button>

                  {/* Custom animated dropdown */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2.5 w-56 bg-white rounded-2xl shadow-dropdown border border-slate-100 p-2.5 z-50 animate-fadeUp"
                      >
                        <div className="px-3 py-2 border-b border-slate-50 mb-1.5">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Account</p>
                          {userName && <p className="text-xs font-bold text-slate-800 truncate mt-1.5 leading-none">{userName}</p>}
                        </div>

                        {[
                          { label: "My Profile",    path: "/profile",   icon: <FiUser size={15} />, color: "hover:bg-slate-55 hover:text-slate-900" },
                          { label: "My Orders",     path: "/myorders",  icon: <FiShoppingBag size={15} />, color: "hover:bg-emerald-50 hover:text-emerald-605" },
                          { label: "My Favorites",  path: "/favorites", icon: <FiHeart size={15} />, color: "hover:bg-rose-50 hover:text-rose-605" },
                        ].map(item => (
                          <button
                            key={item.path}
                            onClick={() => { navigate(item.path); setShowProfileMenu(false); }}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs text-slate-655 font-bold uppercase tracking-wider rounded-xl transition-all duration-150 ${item.color}`}
                          >
                            <span className="text-slate-400 group-hover:text-inherit">{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}

                        <hr className="my-1.5 border-slate-100"/>

                        <button
                          onClick={logout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-55 rounded-xl transition-all duration-150"
                        >
                          <FiLogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Hamburger menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-150/40 transition-colors shadow-3xs"
                aria-label="Open menu"
              >
                <FiMenu size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent page content overlap */}
      <div className="h-24" />

      {/* ── Mobile Side Drawer Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col p-6 border-l border-slate-100"
            >
              {/* Close Button */}
              <div className="flex items-center justify-between mb-8">
                <span className="font-poppins font-bold text-lg text-slate-900">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Navigation links */}
              <div className="flex flex-col gap-2 mb-6">
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                      isActive(item.path, item.exact)
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Extra Account Actions in mobile drawer */}
              <div className="flex flex-col gap-2 mt-auto">
                {token ? (
                  <>
                    <button 
                      onClick={() => { navigate("/profile"); setMobileOpen(false); }} 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-750 font-semibold text-sm hover:bg-slate-50"
                    >
                      <FiUser size={18} className="text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button 
                      onClick={() => { navigate("/myorders"); setMobileOpen(false); }} 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-750 font-semibold text-sm hover:bg-slate-50"
                    >
                      <FiShoppingBag size={18} className="text-slate-400" />
                      <span>My Orders</span>
                    </button>
                    <button 
                      onClick={() => { navigate("/favorites"); setMobileOpen(false); }} 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-750 font-semibold text-sm hover:bg-slate-50"
                    >
                      <FiHeart size={18} className="text-slate-400" />
                      <span>My Favorites</span>
                    </button>
                    <button 
                      onClick={logout} 
                      className="flex items-center gap-3 w-full px-4 py-3 mt-4 rounded-2xl text-rose-650 bg-rose-50 font-bold text-sm hover:bg-rose-100 transition-colors"
                    >
                      <FiLogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-emerald-lg"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
