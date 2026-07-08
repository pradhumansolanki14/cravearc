import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiThumbsUp, FiCheckCircle, FiChevronRight, FiSearch, FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { menu_list } from '../../assets/assets';
import FoodItem from '../../components/FoodItem/FoodItem';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import BannerCarousel from '../../components/BannerCarousel/BannerCarousel';
import { Button, Container, Card, Skeleton } from '../../components/ui';

// ─── Hero Section ──────────────────────────────────────────
const Hero = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      navigate(`/search?q=${encodeURIComponent(address)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-slate-950 text-white pt-10 pb-20 lg:py-24">
      {/* Premium ambient glow background filters */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none filter blur-[120px]" 
        style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)', transform: 'translate(10%, -20%)' }} 
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none filter blur-[100px]" 
        style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} 
      />
      {/* Decorative dot grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Speed Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              <span className="w-2 h-2 bg-emerald-450 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Lightning Fast Delivery</span>
            </div>

            {/* Headline */}
            <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Craving satisfied in{" "}
              <span className="relative inline-block text-gradient-emerald">
                minutes
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6C40 2 100 1 198 6" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg mb-8">
              Order premium food from the city&apos;s best rated restaurants. Fresh ingredients, professional chefs, and contactless delivery to your doorstep.
            </p>

            {/* Search Address Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg flex flex-col sm:flex-row gap-3 mb-10">
              <div className="flex-1 flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3.5 focus-within:border-emerald-500/80 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300">
                <FiMapPin className="text-slate-500 flex-shrink-0" size={18} />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your delivery address..."
                  className="flex-1 bg-transparent text-sm font-medium text-white placeholder-slate-500 outline-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<FiSearch size={16} strokeWidth={2.5} />}
                className="font-bold whitespace-nowrap shadow-emerald-lg"
              >
                Find Food
              </Button>
            </form>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-4 gap-6 sm:gap-8 w-full max-w-md pt-6 border-t border-slate-900">
              {[
                { value: "100+", label: "Restaurants" },
                { value: "20k+", label: "Orders" },
                { value: "25m", label: "Avg Time" },
                { value: "4.9★", label: "Rating" },
              ].map((s, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="text-lg font-bold text-white leading-tight font-poppins">{s.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Hero Visuals */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Circular backing decor */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-950/40 via-emerald-800/10 to-transparent scale-[0.92] shadow-[0_0_80px_rgba(16,185,129,0.06)] pointer-events-none" />

              <img
                src="/header_img.png"
                alt="Tomato delicious fresh cuisine"
                className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float"
                style={{ maxHeight: '460px' }}
              />

              {/* Float Item Card 1 - Dark Glass */}
              <div className="absolute top-10 -left-6 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-800/80 animate-slideRight">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">🥗</div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Fresh Salad</p>
                    <p className="text-[10px] text-emerald-400 font-bold">100% Organic</p>
                  </div>
                </div>
              </div>

              {/* Float Item Card 2 - Dark Glass */}
              <div className="absolute bottom-10 -right-6 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-800/80 animate-slideUp delay-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg">🍔</div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Fast Burger</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FiStar key={star} size={9} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
};

// ─── Popular Categories Quick Link Bar ──────────────────────
const PopularCategories = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-slate-50 border-y border-slate-150/40 py-6">
      <Container>
        <div className="flex items-center gap-4 overflow-x-auto pb-1.5 scrollbar-hide">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Popular Searches:</span>
          {["Burgers", "Pizza", "Noodles", "Salads", "Desserts", "Wraps", "Cake"].map((c, i) => (
            <button
              key={i}
              onClick={() => navigate(`/menu?category=${c}`)}
              className="flex-shrink-0 px-4 py-2 bg-white border border-slate-200/80 hover:border-emerald-455 text-xs font-bold text-slate-600 hover:text-emerald-600 rounded-xl transition-all duration-200 shadow-sm"
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
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Categories</span>
            </div>
            <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore your <span className="text-gradient-emerald">cravings</span>
            </h2>
          </div>
          <Button
            onClick={() => navigate('/menu')}
            variant="outline"
            size="sm"
            rightIcon={<FiChevronRight />}
            className="font-bold text-slate-600 hover:border-emerald-300"
          >
            View Full Menu
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {menu_list.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate(`/menu?category=${item.menu_name}`)}
              className="group flex flex-col items-center gap-3.5 p-4 rounded-3xl border border-slate-100/60 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-card transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={item.menu_image}
                  alt={item.menu_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600 tracking-tight text-center">
                {item.menu_name}
              </span>
            </motion.button>
          ))}
        </div>
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
    <section className="py-20 bg-slate-50">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
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

// ─── Featured Foods Section ────────────────────────────────
const FeaturedFoods = () => {
  const { food_list } = useContext(StoreContext);
  const navigate = useNavigate();
  const featured = food_list.slice(0, 8); // Slice top 8 items

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Popular</span>
            </div>
            <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
              Trending <span className="text-gradient-emerald">dishes</span> this week
            </h2>
          </div>
          <Button
            onClick={() => navigate('/menu')}
            variant="outline"
            size="sm"
            rightIcon={<FiChevronRight />}
            className="font-bold text-slate-600 hover:border-emerald-300"
          >
            Browse Full Menu
          </Button>
        </div>

        {featured.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-100 overflow-hidden p-4 space-y-4 shadow-sm">
                <Skeleton variant="card" />
                <Skeleton variant="title" className="w-2/3" />
                <Skeleton variant="text" className="w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map(item => (
              <FoodItem 
                key={item._id} 
                id={item._id} 
                name={item.name} 
                description={item.description} 
                price={item.price} 
                image={item.image} 
              />
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
      title: "Lightning Fast Delivery",
      desc: "Fresh, hot meals hand-delivered directly to your home in under 30 minutes average time."
    },
    {
      icon: <FiCheckCircle size={24} className="text-emerald-600" />,
      title: "100% Quality Foods",
      desc: "We screen every restaurant for high food safety standards and chef excellence."
    },
    {
      icon: <FiThumbsUp size={24} className="text-emerald-600" />,
      title: "Highly Rated Kitchens",
      desc: "Access exclusively top-rated culinary partners and trending local favorites."
    },
    {
      icon: <FiShield size={24} className="text-emerald-600" />,
      title: "Secure Fast Checkout",
      desc: "Seamless ordering experience protected by industry-standard encrypted checkout."
    }
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
            <span className="text-2xs font-bold text-emerald-700 uppercase tracking-widest">Benefits</span>
          </div>
          <h2 className="font-poppins text-3xl font-extrabold text-slate-900 tracking-tight">
            Why choose <span className="text-gradient-emerald">Tomato</span>?
          </h2>
          <p className="text-sm text-slate-400 mt-3.5 leading-relaxed">
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
              className="border border-slate-100 text-center flex flex-col items-center hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-poppins font-bold text-slate-905 text-base mb-3">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </Card>
          ))}
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
      {/* Background visual graphics */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-10 pointer-events-none filter blur-3xl" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />

      <Container>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Order your favorite meal in <span className="text-gradient-emerald font-black">seconds</span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto mb-10 leading-relaxed">
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
      {/* Hero Header */}
      <Hero setShowLogin={setShowLogin} />

      {/* Quick Search Categories */}
      <PopularCategories />

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

      {/* Featured dynamic restaurants */}
      <FeaturedRestaurants />

      {/* Popular dynamic food items */}
      <FeaturedFoods />

      {/* Tomato benefits card checklist */}
      <WhyChooseUs />

      {/* Brand CTA checkout section */}
      <CTASection />
    </div>
  );
};

export default Home;
