import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTruck, FiShield, FiThumbsUp, FiCheckCircle, FiChevronRight, 
  FiSearch, FiMapPin, FiStar, FiArrowRight, FiChevronDown, 
  FiZap, FiPackage, FiMessageSquare, FiUser, FiActivity 
} from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import BannerCarousel from '../../components/BannerCarousel/BannerCarousel';
import { Button, Container, Card, Skeleton } from '../../components/ui';
import { BRAND } from '../../constants/brand';
import ReviewsWidget from '../../components/Reviews/ReviewsWidget';
import AnnouncementsFeed from '../../components/AnnouncementsFeed/AnnouncementsFeed';
import { toast } from 'react-hot-toast';

// ─── Shared Dynamic Location Selector for Search Centerpiece ───
const HomeLocationSelector = ({ url, token }) => {
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState("Set Location");
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
      } catch {
        setSelected("Current Location");
      }
    };
    load();
  }, [token, url]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center border-r border-slate-800 pr-3 mr-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Delivery location selector"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-slate-900 transition-colors text-slate-300 hover:text-emerald-400 group"
      >
        <FiMapPin size={15} className="text-emerald-500 flex-shrink-0" />
        <span className="text-xs font-bold max-w-[90px] sm:max-w-[120px] truncate">{selected}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown size={12} className="text-slate-500 group-hover:text-slate-350" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2.5 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-30"
          >
            <p className="px-3 py-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
              Delivery to
            </p>
            <button
              type="button"
              onClick={() => { setSelected("Current Location"); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors text-left"
            >
              <FiMapPin size={13} className="text-emerald-500" />
              Current Location
            </button>

            {addresses.length > 0 && (
              <>
                <div className="mx-3 my-1.5 border-t border-slate-800" />
                <p className="px-3 py-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Saved Addresses
                </p>
                {addresses.map((addr, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelected(addr.city || addr.label || "Saved Address"); setOpen(false); }}
                    className="flex items-start gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-205">{addr.label || "Home"}</p>
                      <p className="text-[10px] text-slate-500 truncate font-semibold">{[addr.street, addr.city].filter(Boolean).join(", ")}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {!token && (
              <>
                <div className="mx-3 my-1.5 border-t border-slate-800" />
                <p className="px-3 py-2 text-[10px] text-slate-550 text-center font-bold">
                  Sign in to view saved addresses
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Hero Section with Centered Search Experience ───────────
const Hero = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-950 text-white pt-24 pb-20 lg:py-28">
      {/* Background ambient flows */}
      <div 
        className="absolute top-0 right-0 w-[650px] h-[650px] rounded-full opacity-20 pointer-events-none filter blur-[130px]" 
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(10%, -20%)' }} 
      />
      <div 
        className="absolute bottom-0 left-0 w-[550px] h-[550px] rounded-full opacity-10 pointer-events-none filter blur-[110px]" 
        style={{ background: 'radial-gradient(circle, #065f46 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} 
      />
      {/* Subtle dot mesh overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <Container>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left relative z-10">
            {/* Speed Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6 shadow-emerald-sm"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase">Lightning Fast Delivery</span>
            </motion.div>

            {/* Premium Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
            >
              Your favorite cravings,<br />
              delivered in <span className="text-gradient-emerald">flow.</span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mb-8 font-semibold"
            >
              Order premium dishes from the city&apos;s best rated culinary houses. Fresh ingredients, chef-crafted recipes, and contactless delivery.
            </motion.p>

            {/* Search Centerpiece */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearchSubmit} 
              className="w-full max-w-xl flex flex-col sm:flex-row gap-3 mb-10 bg-slate-900/60 border border-slate-800 rounded-3xl p-2.5 focus-within:border-emerald-500/80 focus-within:bg-slate-900/90 focus-within:shadow-[0_8px_35px_rgba(16,185,129,0.15)] transition-all duration-500"
            >
              {/* Location Select Beside Search */}
              <HomeLocationSelector url={url} token={token} />

              {/* Search input bar */}
              <div className="flex-1 flex items-center gap-2.5 px-2">
                <FiSearch className="text-slate-500 flex-shrink-0" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines or dishes..."
                  className="flex-1 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="font-bold shadow-emerald-sm hover:shadow-emerald py-3.5 px-6 rounded-2xl whitespace-nowrap"
              >
                Search
              </Button>
            </motion.form>

            {/* Actions Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10 w-full justify-center lg:justify-start"
            >
              <Button 
                onClick={() => navigate('/restaurants')}
                variant="primary"
                size="lg"
                className="font-bold shadow-emerald"
              >
                Browse Restaurants
              </Button>
              <Button 
                onClick={() => navigate('/become-a-partner')}
                variant="outline"
                size="lg"
                className="font-bold text-white border-slate-700 hover:border-slate-500 hover:bg-white/5"
              >
                Become a Partner
              </Button>
            </motion.div>

            {/* Micro Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-4 gap-6 sm:gap-8 w-full max-w-md pt-6 border-t border-slate-900"
            >
              {[
                { value: "120+", label: "Partners" },
                { value: "35k+", label: "Deliveries" },
                { value: "20m", label: "Avg Speed" },
                { value: "4.9★", label: "Rating" },
              ].map((s, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="text-lg font-bold text-white leading-tight font-poppins">{s.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Hero Visuals */}
          <div className="lg:col-span-5 order-1 lg:order-2 relative flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 25, delay: 0.2 }}
              className="relative w-full max-w-md"
            >
              {/* Circular backing glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-950/45 via-emerald-800/10 to-transparent scale-[0.9] shadow-[0_0_80px_rgba(16,185,129,0.06)] pointer-events-none" />

              <img
                src="/header_img.png"
                alt={`${BRAND.NAME} delicious fresh cuisine`}
                className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float"
                style={{ maxHeight: '430px' }}
              />

              {/* Floating micro cards */}
              <div className="absolute top-10 -left-6 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-805/80 animate-slideRight">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-base">🥗</div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Fresh Gourmet</p>
                    <p className="text-[10px] text-emerald-450 font-extrabold">100% Organic</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 -right-6 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-805/80 animate-slideUp delay-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-base">🍔</div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Fast Bites</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FiStar key={star} size={9} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </Container>
    </section>
  );
};

// ─── Popular Categories Quick List Bar ──────────────────────
const PopularCategories = () => {
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get(`${url}/api/search/trending`);
        if (res.data.success) {
          setTrends(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching trending searches:", err);
      }
    };
    fetchTrends();
  }, [url]);

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-6">
      <Container>
        <div className="flex items-center gap-4 overflow-x-auto pb-1.5 scrollbar-hide">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Trending Searches:</span>
          {trends.map((c, i) => (
            <button
              key={i}
              onClick={() => navigate(`/search?q=${c}`)}
              className="flex-shrink-0 px-4 py-2 bg-white border border-slate-200/80 hover:border-emerald-300 text-xs font-bold text-slate-600 hover:text-emerald-600 rounded-xl transition-all duration-200 shadow-sm"
            >
              {c}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
};

// ─── Categories Section ────────────────────────────────────
const CategoriesSection = () => {
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${url}/api/categories`);
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [url]);

  const featuredCategories = categories.filter(c => c.featured === true).slice(0, 10);

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Explore Categories</span>
            </div>
            <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore your <span className="text-gradient-emerald">cravings</span>
            </h2>
          </div>
          <Button
            onClick={() => navigate('/categories')}
            variant="outline"
            size="sm"
            rightIcon={<FiChevronRight />}
            className="font-bold text-slate-600 hover:border-emerald-300"
          >
            Explore All Categories
          </Button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="flex gap-5 sm:gap-8 overflow-x-auto py-4 pb-6 scrollbar-hide">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0 animate-pulse min-w-[96px] md:min-w-[128px] lg:min-w-[144px]">
                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-slate-100" />
                <div className="h-3.5 w-16 rounded bg-slate-100 mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && featuredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border border-slate-100 rounded-3xl text-center p-8 max-w-xl mx-auto">
            <FiPackage size={32} className="text-slate-350 mb-3.5" />
            <h3 className="font-bold text-slate-705 text-sm">No featured categories</h3>
            <p className="text-xs text-slate-400 mt-1">Please explore our menu catalog directly or check back later.</p>
          </div>
        )}

        {/* Swiggy/Zomato style category scroll strip */}
        {!loading && featuredCategories.length > 0 && (
          <div className="flex gap-5 sm:gap-8 overflow-x-auto py-4 pb-6 scrollbar-hide">
            {featuredCategories.map((item) => (
              <motion.button
                key={item._id}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/menu?category=${item.name}`)}
                className="group flex flex-col items-center gap-3 focus:outline-none flex-shrink-0 min-w-[96px] md:min-w-[128px] lg:min-w-[144px]"
              >
                {/* Double nested container to completely prevent subpixel browser border clipping on rounded-full overflow */}
                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-2 border-slate-100/50 group-hover:border-emerald-500 shadow-sm transition-all duration-300 bg-white p-0.5 flex-shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <FiPackage size={28} />
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-emerald-600 transition-colors tracking-tight text-center uppercase">
                  {item.name}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

// ─── Featured Restaurants Preview Section ───────────────────
const FeaturedRestaurants = () => {
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${url}/api/food/restaurants`);
        if (res.data.success && Array.isArray(res.data.data)) {
          setRestaurants(res.data.data.slice(0, 4)); // Get top 4 restaurants
        }
      } catch (err) {
        console.error("Error loading homepage restaurants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [url]);

  return (
    <section className="py-24 bg-slate-50">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Featured</span>
            </div>
            <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
              Best rated <span className="text-gradient-emerald">restaurants</span> near you
            </h2>
          </div>
          <Button
            onClick={() => navigate('/restaurants')}
            variant="outline"
            size="sm"
            rightIcon={<FiChevronRight />}
            className="font-bold text-slate-600 hover:border-emerald-300"
          >
            Explore All Restaurants
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-100 overflow-hidden p-4 space-y-4 shadow-sm">
                <Skeleton variant="card" />
                <Skeleton variant="title" className="w-2/3" />
                <Skeleton variant="text" className="w-1/2" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto">
            <span className="text-4xl block mb-3">🏪</span>
            <h3 className="font-poppins font-bold text-slate-800 text-lg mb-1">No Restaurants Available</h3>
            <p className="text-slate-400 text-sm">Please try again later or check your network connection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((rest) => (
              <RestaurantCard key={rest._id} restaurant={rest} url={url} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

// ─── Featured Foods (Trending) Section ───────────────────────
const FeaturedFoods = () => {
  const { food_list } = useContext(StoreContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("popular"); // "popular" | "rated" | "new" | "offers"

  // Process food discovery lists
  const getDiscoveryItems = () => {
    let items = [...food_list];
    if (activeTab === "popular") {
      // Sort by deterministic rating count descending
      items.sort((a, b) => {
        const aCount = a.reviewCount || 0;
        const bCount = b.reviewCount || 0;
        return bCount - aCount;
      });
    } else if (activeTab === "rated") {
      // Sort by average rating descending
      items.sort((a, b) => {
        const aRating = a.averageRating || 0;
        const bRating = b.averageRating || 0;
        return bRating - aRating;
      });
    } else if (activeTab === "new") {
      // Sort by newest addition
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === "offers") {
      // Filter items with positive discounts
      items = items.filter(item => item.discount > 0);
    }
    return items.slice(0, 8); // Display top 8 items
  };

  const discoveryItems = getDiscoveryItems();

  return (
    <section className="py-24 bg-white">
      <Container>
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Discovery</span>
            </div>
            <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore our <span className="text-gradient-emerald font-black">signature dishes</span>
            </h2>
          </div>
          
          {/* Discovery Selector Tabs */}
          <div className="flex flex-wrap gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl md:self-end">
            {[
              { id: "popular", label: "Popular" },
              { id: "rated", label: "Highest Rated" },
              { id: "new", label: "Recently Added" },
              { id: "offers", label: "Special Offers" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {food_list.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-100 overflow-hidden p-4 space-y-4 shadow-sm">
                <Skeleton variant="card" />
                <Skeleton variant="title" className="w-2/3" />
                <Skeleton variant="text" className="w-1/2" />
              </div>
            ))}
          </div>
        ) : discoveryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-6">
            <span className="text-2xl mb-2">🍽️</span>
            <h3 className="font-poppins font-bold text-slate-800 text-sm mb-1">No items found</h3>
            <p className="text-slate-400 text-xs max-w-xs">There are currently no items under this showcase. Explore other categories or check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {discoveryItems.map(item => (
              <FoodItem 
                key={item._id} 
                id={item._id} 
                name={item.name} 
                description={item.description} 
                price={item.price} 
                image={item.image} 
                category={item.category}
                preparationTime={item.preparationTime}
                isVeg={item.isVeg}
                calories={item.calories}
                restaurantId={item.restaurantId}
                isAvailable={item.isAvailable}
                averageRating={item.averageRating}
                reviewCount={item.reviewCount}
                discount={item.discount}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

const CouponTicketCard = ({ coupon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success(`Coupon code ${coupon.code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercent = coupon.discountType === "percent";

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-3xl p-5 sm:p-6 flex items-stretch shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      {/* Semi-circle notch decorations on left and right borders of the ticket (match bg-slate-50) */}
      <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-50 z-10" />
      <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-50 z-10" />

      {/* Main Left Side of Ticket */}
      <div className="flex-1 pr-6 flex flex-col justify-between min-w-0">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 text-white text-[10px] font-black uppercase rounded-lg tracking-wider mb-2.5">
            {isPercent ? `${coupon.discount}% Discount` : `₹${coupon.discount} Discount`}
          </div>
          <h3 className="font-poppins font-black text-white text-base leading-tight">
            {isPercent ? `Save ${coupon.discount}% Off` : `₹${coupon.discount} Flat Off`}
          </h3>
          <p className="text-xs text-white/80 font-semibold leading-relaxed mt-1.5 line-clamp-2">
            {coupon.description || `Apply code ${coupon.code} on checkout to redeem discount.`}
          </p>
        </div>

        <div className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest mt-4">
          Min Order: <span className="text-white font-black">₹{coupon.minOrder || 0}</span>
        </div>
      </div>

      {/* Dashed vertical divider with tear notches */}
      <div className="w-[1px] border-l-2 border-dashed border-white/20 relative my-1">
        <div className="absolute -top-3.5 -left-1 w-2 h-2 rounded-full bg-slate-50" />
        <div className="absolute -bottom-3.5 -left-1 w-2 h-2 rounded-full bg-slate-50" />
      </div>

      {/* Right side of Ticket */}
      <div className="pl-6 w-28 flex flex-col justify-center items-center text-center flex-shrink-0">
        <span className="text-[9px] font-extrabold text-white/70 uppercase tracking-wider mb-2">PROMO CODE</span>
        <div className="w-full py-2 bg-white/15 border-2 border-dashed border-white/20 rounded-xl font-mono font-black text-xs text-white tracking-wide select-all uppercase">
          {coupon.code}
        </div>
        <button
          onClick={handleCopy}
          className={`w-full py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase mt-2.5 transition-all duration-200 ${
            copied 
              ? 'bg-emerald-500 text-white shadow-sm' 
              : 'bg-white text-slate-900 hover:bg-slate-100'
          }`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

const SpecialOffers = () => {
  const { url } = useContext(StoreContext);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackOffers = [
    {
      _id: "mock1",
      code: "WELCOME20",
      discountType: "percent",
      discount: 20,
      minOrder: 199,
      description: "Get free delivery plus 20% discount on orders above ₹199."
    },
    {
      _id: "mock2",
      code: "FEASTWEEK",
      discountType: "fixed",
      discount: 50,
      minOrder: 399,
      description: "Get ₹50 off on midweek orders. Enjoy double reward points."
    }
  ];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get(`${url}/api/coupons/public`);
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          setOffers(res.data.data);
        } else {
          setOffers(fallbackOffers);
        }
      } catch (err) {
        console.error("Error fetching public offers:", err);
        setOffers(fallbackOffers);
      }
      setLoading(false);
    };
    fetchOffers();
  }, [url]);

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Promotions</span>
            </div>
            <h2 className="font-poppins text-2xl font-extrabold text-slate-900 tracking-tight">
              Exclusive <span className="text-gradient-emerald">offers</span> for you
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className="h-32 bg-slate-100 rounded-3xl w-full"></div>
            <div className="h-32 bg-slate-100 rounded-3xl w-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map(coupon => (
              <CouponTicketCard key={coupon._id} coupon={coupon} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

// ─── Why Choose Us Section ──────────────────────────────────
const WhyChooseUs = () => {
  const items = [
    {
      icon: <FiTruck size={24} className="text-emerald-600" />,
      title: "Fast Delivery",
      desc: "Fresh, hot meals hand-delivered directly to your home in under 30 minutes average time."
    },
    {
      icon: <FiCheckCircle size={24} className="text-emerald-600" />,
      title: "Trusted Restaurants",
      desc: "We screen every restaurant for high food safety standards and culinary approval."
    },
    {
      icon: <FiThumbsUp size={24} className="text-emerald-600" />,
      title: "Fresh Ingredients",
      desc: "Access culinary partners who strictly prioritize fresh, local organic produce."
    },
    {
      icon: <FiShield size={24} className="text-emerald-600" />,
      title: "Secure Payments",
      desc: "Seamless ordering experience protected by industry-standard encrypted payment gateways."
    }
  ];

  return (
    <section className="py-24 bg-white border-b border-slate-100">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
            <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Benefits</span>
          </div>
          <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
            Why choose <span className="text-gradient-emerald">{BRAND.NAME}</span>?
          </h2>
          <p className="text-sm text-slate-400 mt-3.5 leading-relaxed font-semibold">
            We deliver visual refinement and culinary perfection from the kitchen straight to your fork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <Card
              key={index}
              variant="default"
              radius="2xl"
              padding="lg"
              className="border border-slate-100 text-center flex flex-col items-center hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(16,185,129,0.04)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-poppins font-bold text-slate-900 text-base mb-3">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

// ─── How It Works (Journey Timeline) ──────────────────────────
const HowItWorks = () => {
  const steps = [
    {
      num: "1",
      title: "Discover",
      desc: "Browse a curated catalog of premium local dining partners.",
      icon: <FiSearch size={22} className="text-emerald-600" />,
    },
    {
      num: "2",
      title: "Order",
      desc: "Customize your items and check out with security.",
      icon: <FiPackage size={22} className="text-emerald-600" />,
    },
    {
      num: "3",
      title: "Enjoy",
      desc: "Track delivery live and eat delicious hot food.",
      icon: <FiCheckCircle size={22} className="text-emerald-600" />,
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
            <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Timeline</span>
          </div>
          <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
            How it works
          </h2>
          <p className="text-sm text-slate-400 mt-3.5 leading-relaxed font-semibold">
            Your gourmet delivery journey completed in three intentional steps.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-slate-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            {steps.map((s, idx) => (
              <div key={idx} className="text-center flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Step Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm text-emerald-600 transition-transform duration-300 hover:scale-105">
                    {s.icon}
                  </div>
                  {/* Step count badge */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-poppins font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-[200px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

// ─── Platform Reviews Section ────────────
const Testimonials = () => {
  return (
    <section className="py-24 bg-white border-b border-slate-100">
      <Container>
        <div className="max-w-4xl mx-auto">
          <ReviewsWidget title="Platform Reviews" domain="platform" />
        </div>
      </Container>
    </section>
  );
};

// ─── CTA Section ──────────────────────────────────────────
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-10 pointer-events-none filter blur-3xl" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />

      <Container>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Order your favorite meal in <span className="text-gradient-emerald font-black">seconds</span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto mb-10 leading-relaxed font-semibold">
            Download our top-rated application on the App Store or Google Play for exclusive deals, interactive tracking, and simpler checkouts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/app')}
              variant="primary"
              size="lg"
              className="font-bold shadow-emerald-lg w-full sm:w-auto"
            >
              Get Mobile App
            </Button>
            <Button
              onClick={() => navigate('/menu')}
              variant="white"
              size="lg"
              rightIcon={<FiArrowRight />}
              className="font-bold w-full sm:w-auto"
            >
              Browse Full Menu
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

// ─── Main Homepage Component ──────────────────────────────
const Home = ({ setShowLogin }) => {
  return (
    <div className="bg-white flex flex-col min-h-screen">
      {/* Hero Header & Search Centerpiece */}
      <Hero setShowLogin={setShowLogin} />

      {/* Quick Search Categories */}
      <PopularCategories />

      {/* Live System Announcements Broadcast */}
      <AnnouncementsFeed />

      {/* Dynamic Banner Carousel wrapper */}
      <div className="py-8 bg-white border-b border-slate-50">
        <Container>
          <div className="rounded-3xl overflow-hidden shadow-card border border-slate-100/60">
            <BannerCarousel />
          </div>
        </Container>
      </div>

      {/* Main categories navigation grid */}
      <CategoriesSection />

      {/* Special Offers Promotional Section */}
      <SpecialOffers />

      {/* Featured dynamic restaurants */}
      <FeaturedRestaurants />

      {/* Popular dynamic food items */}
      <FeaturedFoods />

      {/* Journey Timeline */}
      <HowItWorks />

      {/* Tomato benefits card checklist */}
      <WhyChooseUs />

      {/* Customer Reviews demo carousel */}
      <Testimonials />

      {/* Brand CTA checkout section */}
      <CTASection />
    </div>
  );
};

export default Home;
