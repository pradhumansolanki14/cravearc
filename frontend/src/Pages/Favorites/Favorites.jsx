import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiHeart, FiInfo, FiLayers, FiActivity } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import { Container, Button } from '../../components/ui';

const Favorites = () => {
  const { url, token, favorites } = useContext(StoreContext);
  const [favFoods, setFavFoods] = useState([]);
  const [favRestaurants, setFavRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("food"); // "food" or "restaurant"
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchFavorites();
  }, [token, favorites]); // re-fetch whenever favorites list changes

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/favorites`, { headers: { token } });
      if (res.data.success) {
        setFavFoods(res.data.data.foods || []);
        setFavRestaurants(res.data.data.restaurants || []);
      }
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  const activeCount = activeTab === "food" ? favFoods.length : favRestaurants.length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100">
        <Container className="py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-100"
                aria-label="Go back"
              >
                <FiArrowLeft size={18} className="text-slate-650" />
              </button>
              <div>
                <h1 className="font-poppins font-extrabold text-2xl text-slate-900 flex items-center gap-2 tracking-tight">
                  <span>My Favorites</span>
                  <FiHeart className="text-rose-500 fill-rose-500 animate-pulse" size={20} />
                </h1>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">
                  {loading ? 'Loading...' : `${favFoods.length} dishes · ${favRestaurants.length} kitchens`}
                </p>
              </div>
            </div>

            {/* Premium Tab Selector */}
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
              <button
                onClick={() => setActiveTab("food")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "food"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                <FiLayers size={14} />
                <span>Gourmet Dishes ({favFoods.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("restaurant")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "restaurant"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                <FiActivity size={14} />
                <span>Favorite Kitchens ({favRestaurants.length})</span>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Grid List Content */}
      <Container className="py-8">
        {loading ? (
          /* Pulse Skeletal Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-xl w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-xl w-1/2" />
                  <div className="h-6 bg-slate-100 rounded-xl w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : activeCount === 0 ? (
          /* Empty Favorites list state */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-slate-100 rounded-3xl shadow-card p-8 animate-fadeUp">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-5">
              <FiHeart size={28} className="fill-rose-500/10" />
            </div>
            <h2 className="font-poppins font-bold text-slate-800 text-lg mb-2">No favorites yet</h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              {activeTab === "food"
                ? "Tap the heart icon on any gourmet dish to save it here for quick access later."
                : "Tap the heart icon on any kitchen cover to keep track of your favorite restaurants."}
            </p>
            <Button 
              onClick={() => navigate('/')} 
              variant="primary" 
              size="lg"
              className="font-bold shadow-emerald-lg w-full"
            >
              Explore Menu
            </Button>
          </div>
        ) : (
          <>
            {/* Quick helper tip banner */}
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-100/50 rounded-2xl mb-6 max-w-md animate-fadeUp">
              <FiInfo className="text-rose-550 flex-shrink-0" size={15} />
              <p className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">
                Tap the red heart on any card to remove it from favorites
              </p>
            </div>

            {/* Grid List */}
            {activeTab === "food" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeUp">
                {favFoods.map(item => (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeUp">
                {favRestaurants.map(r => (
                  <RestaurantCard
                    key={r._id}
                    restaurant={r}
                    url={url}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default Favorites;
