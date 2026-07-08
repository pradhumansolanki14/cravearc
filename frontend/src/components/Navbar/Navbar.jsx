import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiMapPin,
  FiChevronDown,
  FiStar,
  FiGrid,
  FiPackage,
  FiHome,
} from "react-icons/fi";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

/* ────────────────────────────────────────────────────────────
   NAV LINKS  — marketplace-grade, not tutorial-grade
──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Discover",    path: "/",            exact: true,  icon: <FiStar size={14} /> },
  { label: "Restaurants", path: "/restaurants", exact: false, icon: <FiGrid size={14} /> },
];

/* ────────────────────────────────────────────────────────────
   PROFILE DROPDOWN ITEMS (logged in)
──────────────────────────────────────────────────────────── */
const PROFILE_ITEMS = [
  { label: "My Profile",       path: "/profile",   icon: <FiUser size={15} /> },
  { label: "My Orders",        path: "/myorders",  icon: <FiPackage size={15} /> },
  { label: "Saved Addresses",  path: "/profile",   icon: <FiMapPin size={15} /> },
  { label: "Favorites",        path: "/favorites", icon: <FiHeart size={15} /> },
];

/* ════════════════════════════════════════════════════════════
   EXPANDABLE SEARCH — desktop: pill that expands inline
════════════════════════════════════════════════════════════ */
const ExpandableSearch = () => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const expand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const collapse = () => { if (!query) setExpanded(false); };

  const submit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setExpanded(false);
    }
  };

  return (
    <form onSubmit={submit} className="hidden md:flex items-center">
      <motion.div
        animate={{ width: expanded ? 280 : 44 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative flex items-center h-11 overflow-hidden rounded-2xl bg-slate-100/80 border border-slate-200/60 backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={expanded ? submit : expand}
          aria-label="Search"
          className="absolute left-0 z-10 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors flex-shrink-0"
        >
          <FiSearch size={18} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.input
              ref={inputRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={collapse}
              placeholder="Restaurants, cuisines, dishes…"
              className="absolute inset-0 pl-11 pr-10 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
            />
          )}
        </AnimatePresence>

        {expanded && query && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
          >
            <FiX size={12} />
          </button>
        )}
      </motion.div>
    </form>
  );
};

/* ════════════════════════════════════════════════════════════
   LOCATION SELECTOR
════════════════════════════════════════════════════════════ */
const LocationSelector = ({ url, token }) => {
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState("Current Location");
  const ref = useRef(null);

  useEffect(() => {
    if (!token) { setSelected("Set Location"); return; }
    const load = async () => {
      try {
        const res = await axios.get(`${url}/api/user/addresses`, { headers: { token } });
        if (res.data.success && res.data.data?.length) {
          setAddresses(res.data.data);
          const primary = res.data.data[0];
          setSelected(primary.city || primary.label || "Saved Address");
        } else {
          setSelected("Current Location");
        }
      } catch { setSelected("Current Location"); }
    };
    load();
  }, [token, url]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden lg:flex items-center">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Delivery location"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-600 transition-all duration-200 group"
      >
        <FiMapPin size={15} className="text-emerald-500 flex-shrink-0" />
        <span className="text-sm font-semibold max-w-[120px] truncate">{selected}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown size={13} className="text-slate-400 group-hover:text-slate-600" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
          >
            <p className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Delivery To
            </p>
            <button
              onClick={() => { setSelected("Current Location"); setOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-sm font-semibold text-slate-700 transition-colors text-left"
            >
              <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <FiMapPin size={13} className="text-emerald-600" />
              </span>
              Current Location
            </button>

            {addresses.length > 0 && (
              <>
                <div className="mx-3 my-1.5 border-t border-slate-100" />
                <p className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Saved Addresses
                </p>
                {addresses.map((addr, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelected(addr.city || addr.label || "Saved Address"); setOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors text-left"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FiHome size={13} className="text-slate-500" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-800">{addr.label || "Home"}</p>
                      <p className="text-xs text-slate-400 truncate font-medium">{[addr.street, addr.city].filter(Boolean).join(", ")}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {!token && (
              <>
                <div className="mx-3 my-1.5 border-t border-slate-100" />
                <p className="px-3 py-2 text-xs text-slate-400 text-center font-medium">
                  Sign in to see saved addresses
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   PROFILE DROPDOWN
════════════════════════════════════════════════════════════ */
const ProfileDropdown = ({ userName, onLogout, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
          open ? "border-emerald-400 shadow-emerald-sm" : "border-slate-200 hover:border-emerald-300"
        }`}
      >
        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-poppins font-extrabold text-xs tracking-wider">
          {initials}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Account menu"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
          >
            <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-50 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate leading-tight">{userName || "Account"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">My Account</p>
              </div>
            </div>

            {PROFILE_ITEMS.map((item) => (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => { onNavigate(item.path); setOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
              >
                <span className="text-slate-400">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="my-1.5 border-t border-slate-100" />

            <button
              role="menuitem"
              onClick={() => { onLogout(); setOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-400"
            >
              <FiLogOut size={15} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MOBILE DRAWER
════════════════════════════════════════════════════════════ */
const MobileDrawer = ({ open, onClose, token, userName, cartCount, favCount, setShowLogin, setShowPartnerModal, onLogout, navigate }) => {
  const [mobileSearch, setMobileSearch] = useState("");

  const submitMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileSearch("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] cursor-pointer"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl z-[70] flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <FiMapPin size={14} className="text-white" />
                </div>
                <span className="font-poppins font-extrabold text-lg text-slate-900">
                  Tomato<span className="text-emerald-500">.</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-5 pt-5">
              <form onSubmit={submitMobileSearch} className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-3">
                <FiSearch size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Restaurants, cuisines, dishes…"
                  className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
                />
              </form>
            </div>

            {/* Nav Links */}
            <nav className="px-3 pt-5 space-y-1">
              <p className="px-2 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Browse</p>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-slate-400">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mx-5 my-4 border-t border-slate-100" />

            {/* Become a Partner — only when NOT logged in */}
            {!token && (
              <div className="px-3 space-y-1">
                <p className="px-2 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Partners</p>
                <button
                  onClick={() => { setShowPartnerModal(true); onClose(); }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
                >
                  <FiStar size={15} className="text-emerald-500" />
                  Become a Partner
                </button>
              </div>
            )}

            {/* Account section */}
            <div className="px-3 mt-4 space-y-1">
              {token ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {userName ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{userName || "Account"}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Logged in</p>
                    </div>
                  </div>

                  <p className="px-2 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Account</p>
                  {PROFILE_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.path); onClose(); }}
                      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => { navigate("/cart"); onClose(); }}
                      className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <FiShoppingBag size={15} />
                      Cart {cartCount > 0 && <span className="bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
                    </button>
                    <button
                      onClick={() => { navigate("/favorites"); onClose(); }}
                      className="flex items-center justify-center gap-2 px-3 py-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      <FiHeart size={15} />
                      Saved {favCount > 0 && <span className="bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{favCount}</span>}
                    </button>
                  </div>

                  <button
                    onClick={() => { onLogout(); onClose(); }}
                    className="flex items-center gap-3 w-full px-4 py-3.5 mt-2 rounded-2xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    <FiLogOut size={15} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <p className="px-2 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Account</p>
                  <button
                    onClick={() => { setShowLogin(true); onClose(); }}
                    className="flex items-center justify-center w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-emerald"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setShowLogin(true); onClose(); }}
                    className="flex items-center justify-center w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors mt-1"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>

            <div className="h-8" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN NAVBAR
════════════════════════════════════════════════════════════ */
const Navbar = ({ setShowLogin, setShowPartnerModal }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { token, setToken, cartItems, favorites, userName, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  }, [setToken, navigate]);

  const cartCount = Object.values(cartItems || {}).reduce((a, b) => a + (b > 0 ? b : 0), 0);
  const favCount  = favorites?.length || 0;

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <>
      {/* ── Sticky Nav Bar ───────────────────────────────────── */}
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_32px_-4px_rgba(0,0,0,0.10)] border-b border-slate-100/80"
            : "bg-white/60 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center h-[68px] gap-4">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
              aria-label="Tomato — Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-emerald-sm transition-all duration-300 group-hover:scale-105">
                <FiMapPin size={16} className="text-white" />
              </div>
              <span className="font-poppins font-extrabold text-xl text-slate-900 tracking-tight">
                Tomato<span className="text-emerald-500">.</span>
              </span>
            </Link>

            {/* ── Location Selector ── */}
            <div className="hidden lg:flex items-center border-r border-slate-200 pr-4">
              <LocationSelector url={url} token={token} />
            </div>

            {/* ── Desktop Nav Links ── */}
            <nav role="navigation" aria-label="Main navigation" className="hidden md:flex items-center gap-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      active
                        ? "text-emerald-700"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-emerald-50 border border-emerald-100/80 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className={active ? "text-emerald-600" : "text-slate-400"}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}

              {/* Become a Partner — only when NOT logged in */}
              {!token && (
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <FiStar size={14} className="text-slate-400" />
                  Become a Partner
                </button>
              )}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2 ml-auto">

              {/* Expandable Search */}
              <ExpandableSearch />

              {/* Favorites — logged in only */}
              {token && (
                <Link
                  to="/favorites"
                  aria-label={`Favorites${favCount > 0 ? `, ${favCount} items` : ""}`}
                  className="relative hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 text-slate-500 hover:bg-rose-50 hover:text-rose-500 border border-slate-200/60 hover:border-rose-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <FiHeart size={18} className={favCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
                  {favCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                      {favCount > 9 ? "9+" : favCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200/60 hover:border-emerald-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <FiShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-emerald-sm">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Auth — logged out */}
              {!token && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-emerald-sm hover:shadow-emerald transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Profile Dropdown — logged in */}
              {token && (
                <div className="hidden md:block">
                  <ProfileDropdown
                    userName={userName}
                    onLogout={logout}
                    onNavigate={(path) => navigate(path)}
                  />
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/80 text-slate-700 hover:bg-slate-200 border border-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <FiMenu size={20} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[68px]" aria-hidden="true" />

      {/* ── Mobile Drawer ── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        token={token}
        userName={userName}
        cartCount={cartCount}
        favCount={favCount}
        setShowLogin={setShowLogin}
        setShowPartnerModal={setShowPartnerModal}
        onLogout={logout}
        navigate={navigate}
      />
    </>
  );
};

export default Navbar;
