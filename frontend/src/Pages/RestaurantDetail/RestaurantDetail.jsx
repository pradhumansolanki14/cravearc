import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiClock, FiTruck, FiStar, FiSearch, FiX,
  FiPhone, FiMail, FiMapPin, FiGlobe, FiHeart, FiShare2,
  FiShoppingCart, FiPlus, FiMinus, FiInfo, FiNavigation,
  FiCalendar, FiTag, FiWifi, FiAward, FiZap, FiCheck,
  FiMenu, FiMessageSquare, FiUser,
} from "react-icons/fi";
import { MdOutlineLocalParking, MdOutlineFoodBank, MdOutlineTableRestaurant } from "react-icons/md";
import { StoreContext } from "../../context/StoreContext";
import ReviewsWidget from "../../components/Reviews/ReviewsWidget";

const axiosInstance = axios;

const Stars = ({ rating, size = 14 }) => {
  const r = Math.round(Number(rating) || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <FiStar key={s} size={size}
          className={s <= r ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
      ))}
    </div>
  );
};

const amenityIcon = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes("wifi") || t.includes("wi-fi")) return <FiWifi size={13} />;
  if (t.includes("park"))                         return <MdOutlineLocalParking size={13} />;
  if (t.includes("veg"))                          return <MdOutlineFoodBank size={13} />;
  if (t.includes("dine") || t.includes("seat"))  return <MdOutlineTableRestaurant size={13} />;
  if (t.includes("ac") || t.includes("air"))     return <FiZap size={13} />;
  if (t.includes("fast") || t.includes("expr"))  return <FiTruck size={13} />;
  if (t.includes("award") || t.includes("cert")) return <FiAward size={13} />;
  return <FiCheck size={13} />;
};

const StorefrontSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
      <div className="relative rounded-3xl bg-slate-200 h-44 sm:h-60" />
      <div className="flex items-end gap-5 mt-4">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-300 border-4 border-white shadow-lg flex-shrink-0" style={{ marginTop: "-48px" }} />
        <div className="mb-4 space-y-2">
          <div className="h-6 w-48 bg-slate-300 rounded-xl" />
          <div className="h-4 w-32 bg-slate-300 rounded-lg" />
        </div>
      </div>
    </div>
    <div className="h-14 bg-white border-b border-slate-100 mt-6 flex items-center gap-8 px-6">
      {[1,2,3,4].map(i => <div key={i} className="h-4 w-16 bg-slate-100 rounded-lg" />)}
    </div>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 pb-20 space-y-5">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
    </div>
  </div>
);

const FoodCard = ({ item, url, cartItems, addToCart, removeFromCart, formatPrice, isClosed }) => {
  const count = cartItems[item._id] || 0;
  const discounted = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
  const unavailable = !item.isAvailable || isClosed;
  return (
    <div className={`bg-white rounded-2xl border flex gap-0 overflow-hidden transition-all hover:shadow-md ${unavailable ? "opacity-55" : "border-slate-100 hover:border-emerald-100"}`}>
      <div className="relative flex-shrink-0 w-32 sm:w-36 self-stretch bg-slate-100 min-h-[110px]">
        {item.image ? (
          <img src={`${url}/images/${item.image}`} alt={item.name} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200">
            <FiTag size={28} />
          </div>
        )}
        {item.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full z-10">
            -{item.discount}%
          </span>
        )}
        {item.isVeg && (
          <span className="absolute top-2 right-2 w-4 h-4 rounded border-2 border-green-600 bg-white flex items-center justify-center z-10">
            <span className="w-2 h-2 rounded-full bg-green-600" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-4">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm leading-snug">{item.name}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {item.preparationTime != null && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <FiClock size={9} /> {item.preparationTime} min
              </span>
            )}
            {item.calories && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <FiZap size={9} /> {item.calories} cal
              </span>
            )}
            {item.rating > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold">
                <FiStar size={9} className="fill-amber-400" /> {Number(item.rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex-1 min-w-0">
            <span className="font-bold text-slate-900">{formatPrice(discounted)}</span>
            {item.discount > 0 && (
              <span className="text-xs text-slate-400 line-through ml-1.5">{formatPrice(item.price)}</span>
            )}
          </div>
          {unavailable ? (
            <span className="text-[10px] text-slate-400 font-semibold border border-slate-200 px-2 py-1 rounded-lg flex-shrink-0">
              {isClosed ? "Closed" : "Unavailable"}
            </span>
          ) : count === 0 ? (
            <button onClick={() => addToCart(item._id, item.restaurantId)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0">
              <FiPlus size={12} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-2 py-1 flex-shrink-0">
              <button onClick={() => removeFromCart(item._id)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                <FiMinus size={10} />
              </button>
              <span className="font-bold text-emerald-700 text-sm w-4 text-center">{count}</span>
              <button onClick={() => addToCart(item._id, item.restaurantId)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                <FiPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewCard = ({ restaurant, formatPrice, isFav, toggleFav, handleShare, isMobile }) => {
  const isClosed = !restaurant.isOpen;
  if (isMobile) {
    return (
      <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-3.5 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
              <FiStar size={12} className="text-amber-500 fill-amber-500" />
              <span className="font-extrabold text-xs text-amber-700">
                {restaurant.rating > 0 ? Number(restaurant.rating).toFixed(1) : "New"}
              </span>
            </div>
            {restaurant.totalReviews > 0 && (
              <span className="text-[10px] font-bold text-slate-400">{restaurant.totalReviews} reviews</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleFav} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-150 hover:bg-slate-100 transition-colors">
              <FiHeart size={13} className={isFav ? "fill-red-500 text-red-500 border-none" : "text-slate-400"} />
            </button>
            <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-150 hover:bg-slate-100 transition-colors">
              <FiShare2 size={13} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Delivery</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {Number(restaurant.deliveryFee) === 0 ? "Free" : "₹" + restaurant.deliveryFee}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Prep Time</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{restaurant.preparationTime ?? 30}m</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Min Order</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">₹{restaurant.minOrder}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {restaurant.phone && (
            <a href={"tel:" + restaurant.phone}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl text-center shadow-sm">
              <FiPhone size={12} /> Call
            </a>
          )}
          {restaurant.address && (
            <button
              onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(restaurant.address), "_blank")}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl border border-slate-205">
              <FiNavigation size={12} /> Directions
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-72 bg-white rounded-3xl p-4.5 shadow-xl border border-slate-100 text-slate-800"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
            <FiStar size={13} className="text-amber-550 fill-amber-500" />
            <span className="font-extrabold text-xs text-amber-700">
              {restaurant.rating > 0 ? Number(restaurant.rating).toFixed(1) : "New"}
            </span>
          </div>
          {restaurant.totalReviews > 0 && (
            <span className="text-[10px] font-bold text-slate-400">{restaurant.totalReviews} reviews</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={toggleFav}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:text-red-500 transition-all text-slate-400">
            <FiHeart size={14} className={isFav ? "fill-red-500 text-red-500 border-none" : ""} />
          </button>
          <button onClick={handleShare}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100 hover:text-emerald-500 transition-all text-slate-400">
            <FiShare2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Delivery</p>
          <p className="text-xs font-bold text-slate-800">
            {Number(restaurant.deliveryFee) === 0 ? "Free" : "₹" + restaurant.deliveryFee}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Prep Time</p>
          <p className="text-xs font-bold text-slate-800">{restaurant.preparationTime ?? 30} mins</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Min Order</p>
          <p className="text-xs font-bold text-slate-800">₹{restaurant.minOrder}</p>
        </div>
        {restaurant.openingHours && (
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Hours</p>
            <p className="text-xs font-bold text-slate-800 truncate">{restaurant.openingHours}</p>
          </div>
        )}
      </div>

      {restaurant.address && (
        <div className="flex items-start gap-1.5 mb-3.5">
          <FiMapPin size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed line-clamp-2">{restaurant.address}</p>
        </div>
      )}

      <div className="flex gap-2">
        {restaurant.phone && (
          <a href={"tel:" + restaurant.phone}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-50 text-center">
            <FiPhone size={12} /> Call
          </a>
        )}
        {restaurant.address && (
          <button
            onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(restaurant.address), "_blank")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all border border-slate-200">
            <FiNavigation size={12} /> Directions
          </button>
        )}
      </div>
    </motion.div>
  );
};

const SECTIONS = [
  { key: "menu",    label: "Menu" },
  { key: "about",   label: "About & Gallery" },
  { key: "reviews", label: "Reviews" },
  { key: "contact", label: "Contact" },
];

const SectionNav = ({ activeSection, setActiveSection }) => {
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1">
          {SECTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-5 py-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all ${
                activeSection === key
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url, cartItems, addToCart, removeFromCart, formatPrice, token, toggleFavorite, isFavorite } = useContext(StoreContext);

  const [restaurant, setRestaurant]         = useState(null);
  const [menu, setMenu]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [isVeg, setIsVeg]                   = useState(false);
  const [menuSearch, setMenuSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSection, setActiveSection]   = useState("menu");
  const [relatedRestaurants, setRelated]    = useState([]);
  const [actualRestaurantId, setActualId]   = useState("");
  const categoryNavRef                      = useRef(null);

  const isFav = isFavorite(actualRestaurantId, "restaurant");

  const toggleFav = async () => {
    if (!token) {
      toast.error("Please login to save favorites");
      return;
    }
    const result = await toggleFavorite({ restaurantId: actualRestaurantId });
    if (result !== null) {
      toast.success(result ? "Added to favourites" : "Removed from favourites");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: restaurant?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rRes = await axiosInstance.get(url + "/api/food/restaurants/" + id);
      if (!rRes.data.success) { navigate("/restaurants"); return; }
      const r = rRes.data.data.restaurant;
      setRestaurant(r);
      setActualId(r._id);
      const mRes = await axiosInstance.get(url + "/api/food/list?restaurantId=" + r._id);
      if (mRes.data.success) setMenu(mRes.data.data);
      const relRes = await axiosInstance.get(url + "/api/food/restaurants");
      if (relRes.data.success) {
        setRelated(relRes.data.data.filter(x => x._id !== r._id).slice(0, 3));
      }
    } catch {
      navigate("/restaurants");
    }
    setLoading(false);
  };

  const fetchMenu = async (vegFilter) => {
    try {
      const params = "?restaurantId=" + (actualRestaurantId || id) + (vegFilter ? "&isVeg=true" : "");
      const res = await axiosInstance.get(url + "/api/food/list" + params);
      if (res.data.success) setMenu(res.data.data);
    } catch {}
  };

  const handleVegToggle = () => {
    const next = !isVeg;
    setIsVeg(next);
    fetchMenu(next);
  };

  const filteredMenu = menu.filter(item => {
    if (!menuSearch) return true;
    const q = menuSearch.toLowerCase();
    return item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
  });

  const grouped = filteredMenu.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  useEffect(() => {
    const handleScroll = () => {
      if (activeSection !== "menu") return;
      for (const cat of categories) {
        const el = document.getElementById("cat-" + cat.replace(/\s+/g, "-"));
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveCategory(cat);
            const pill = document.getElementById("pill-" + cat.replace(/\s+/g, "-"));
            if (pill && categoryNavRef.current) {
              categoryNavRef.current.scrollTo({ left: pill.offsetLeft - 16, behavior: "smooth" });
            }
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [grouped, activeSection]);

  const scrollToCategory = (catName) => {
    setActiveCategory(catName);
    const el = document.getElementById("cat-" + catName.replace(/\s+/g, "-"));
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 170;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  if (loading) return <StorefrontSkeleton />;
  if (!restaurant) return null;

  const isClosed = !restaurant.isOpen;
  const cuisines = restaurant.cuisine
    ? restaurant.cuisine.split(",").map(c => c.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* COVER BANNER (FULL BLEED) */}
      <div className="relative bg-slate-900 text-white w-full overflow-visible">
        {/* Background Cover Image */}
        {restaurant.coverImage ? (
          <img
            src={url + "/images/" + restaurant.coverImage}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-teal-900" />
        )}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/30" />

        {/* Content container */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-8 z-10">
          {/* Back button */}
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-sm mb-6"
            aria-label="Go back">
            <FiArrowLeft size={16} />
          </button>

          {/* Grid layout for Title & Overview Card */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Left: Logo & Identity */}
            <div className="flex items-center sm:items-end gap-5 flex-wrap sm:flex-nowrap">
              {/* Logo */}
              <div className="flex-shrink-0">
                {restaurant.logo ? (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-2 border-white/90 shadow-lg overflow-hidden">
                    <img src={url + "/images/" + restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-450 to-teal-500 border-2 border-white/90 shadow-lg flex items-center justify-center">
                    <span className="text-white font-black text-4xl">{restaurant.name?.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={"inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-2xs " +
                    (isClosed ? "bg-red-500 text-white" : "bg-emerald-500 text-white")}>
                    {isClosed ? "Closed" : "Open"}
                  </span>
                  {restaurant.featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-400 text-amber-955 shadow-2xs">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-white font-black text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight drop-shadow-sm">
                  {restaurant.name}
                </h1>
                {cuisines.length > 0 && (
                  <p className="text-white/85 text-xs sm:text-sm font-semibold">{cuisines.join(" · ")}</p>
                )}
              </div>
            </div>

            {/* Right: Overview Card (floating white card overlaying the background image) */}
            <div className="w-full md:w-auto flex-shrink-0">
              {/* Desktop OverviewCard */}
              <div className="hidden md:block">
                <OverviewCard restaurant={restaurant} formatPrice={formatPrice}
                  isFav={isFav} toggleFav={toggleFav} handleShare={handleShare} />
              </div>
              {/* Mobile OverviewCard */}
              <div className="md:hidden">
                <OverviewCard restaurant={restaurant} formatPrice={formatPrice}
                  isFav={isFav} toggleFav={toggleFav} handleShare={handleShare} isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY SECTION NAV */}
      <SectionNav activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Spacer */}
      <div className="h-6" />

      {/* ACTIVE SECTION / TAB BODY */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* MENU SECTION / TAB */}
        {activeSection === "menu" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} className="space-y-6">
            
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Menu Highlights</h2>
              <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {menu.length} items
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input type="text" value={menuSearch} onChange={e => setMenuSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full pl-10 pr-9 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all shadow-xs" />
                {menuSearch && (
                  <button onClick={() => setMenuSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <FiX size={14} />
                  </button>
                )}
              </div>
              <button onClick={handleVegToggle}
                className={"flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex-shrink-0 shadow-xs " +
                  (isVeg ? "bg-green-50 border-green-400 text-green-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-350")}>
                <span className="w-4 h-4 rounded border-2 border-current flex items-center justify-center">
                  <span className={"w-2 h-2 rounded-full " + (isVeg ? "bg-green-600" : "bg-transparent")} />
                </span>
                Veg Only
              </button>
            </div>

            {categories.length > 1 && (
              <div ref={categoryNavRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
                {categories.map(cat => (
                  <button key={cat} id={"pill-" + cat.replace(/\s+/g, "-")}
                    onClick={() => scrollToCategory(cat)}
                    className={"flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all " +
                      (activeCategory === cat
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-white text-slate-605 border border-slate-200 hover:border-emerald-300")}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {categories.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs">
                <FiInfo size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">No items matched your search</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the veg filter or search term</p>
              </div>
            ) : (
              <div className="space-y-10">
                {categories.map(cat => (
                  <div key={cat} id={"cat-" + cat.replace(/\s+/g, "-")} className="scroll-mt-36">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">{cat}</h3>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
                        {grouped[cat].length}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grouped[cat].map(item => (
                        <FoodCard key={item._id} item={item} url={url}
                          cartItems={cartItems} addToCart={addToCart}
                          removeFromCart={removeFromCart} formatPrice={formatPrice} isClosed={isClosed} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {/* ABOUT & GALLERY TAB */}
        {activeSection === "about" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} className="space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Our Story</h3>
                <p className="text-sm text-slate-655 leading-relaxed font-medium">
                  {restaurant.description || "Welcome to our kitchen! We serve delicious dishes crafted with premium ingredients and passion."}
                </p>
              </div>

              {cuisines.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Cuisines</h3>
                  <div className="flex flex-wrap gap-2">
                    {cuisines.map(c => (
                      <span key={c} className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {restaurant.tags?.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Amenities</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {restaurant.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100">
                        {amenityIcon(tag)} {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Section */}
            {restaurant.gallery && restaurant.gallery.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Hotel Gallery</h3>
                  <p className="text-xs text-slate-450 font-medium">Photos of hotel ambiance, luxury dining, customers, and menu highlights.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {restaurant.gallery.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs">
                      <img src={url + "/images/" + img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* REVIEWS TAB */}
        {activeSection === "reviews" && actualRestaurantId && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <ReviewsWidget title="" domain="restaurant" entityId={actualRestaurantId} />
          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeSection === "contact" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {restaurant.phone && (
                <a href={"tel:" + restaurant.phone}
                  className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-250 hover:bg-emerald-50/20 transition-all group">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-105 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-200 transition-all flex-shrink-0">
                    <FiPhone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                    <p className="text-sm font-semibold text-slate-805 truncate">{restaurant.phone}</p>
                  </div>
                </a>
              )}
              {restaurant.email && (
                <a href={"mailto:" + restaurant.email}
                  className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-250 hover:bg-emerald-50/20 transition-all group">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-105 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-200 transition-all flex-shrink-0">
                    <FiMail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-slate-805 truncate">{restaurant.email}</p>
                  </div>
                </a>
              )}
              {restaurant.website && (
                <a href={restaurant.website.startsWith("http") ? restaurant.website : "https://" + restaurant.website}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-250 hover:bg-emerald-50/20 transition-all group">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-105 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-200 transition-all flex-shrink-0">
                    <FiGlobe size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Website</p>
                    <p className="text-sm font-semibold text-slate-805 truncate">{restaurant.website}</p>
                  </div>
                </a>
              )}
              {restaurant.openingHours && (
                <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-105 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <FiCalendar size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Hours</p>
                    <p className="text-sm font-semibold text-slate-805 truncate">{restaurant.openingHours}</p>
                  </div>
                </div>
              )}
              {restaurant.address && (
                <div className="flex items-start gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm sm:col-span-2">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-105 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMapPin size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">{restaurant.address}</p>
                    <button
                      onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(restaurant.address), "_blank")}
                      className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                      <FiNavigation size={12} /> Get Directions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* RELATED RESTAURANTS (EXPLORE MORE) */}
        {relatedRestaurants.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-5">Explore More Restaurants</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedRestaurants.map(r => (
                <Link key={r._id} to={"/restaurant/" + (r.slug || r._id)}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all group">
                  <div className="h-32 bg-slate-100 relative overflow-hidden">
                    {r.coverImage ? (
                      <img src={url + "/images/" + r.coverImage} alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                        <span className="text-5xl font-black text-emerald-200">{r.name?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className={"absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full " +
                      (r.isOpen ? "bg-emerald-500 text-white" : "bg-slate-500 text-white")}>
                      {r.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-sm text-slate-900 truncate">{r.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{r.cuisine || "Restaurant"}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      {r.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <FiStar size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-slate-700">{Number(r.rating).toFixed(1)}</span>
                        </div>
                      ) : <span />}
                      <span className="text-[10px] text-slate-400">{formatPrice(r.deliveryFee || 0)} delivery</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
