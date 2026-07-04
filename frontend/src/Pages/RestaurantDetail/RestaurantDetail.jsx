import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url, cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVeg, setIsVeg] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get restaurant details
      const rRes = await axios.get(`${url}/api/food/restaurants/${id}`);
      if (!rRes.data.success) { navigate('/restaurants'); return; }
      setRestaurant(rRes.data.data.restaurant);

      // Get menu (will re-fetch with isVeg filter when toggled)
      const mRes = await axios.get(`${url}/api/food/list?restaurantId=${id}`);
      if (mRes.data.success) setMenu(mRes.data.data);
    } catch {
      navigate('/restaurants');
    }
    setLoading(false);
  };

  const fetchMenu = async (vegFilter) => {
    try {
      const params = `?restaurantId=${id}${vegFilter ? '&isVeg=true' : ''}`;
      const res = await axios.get(`${url}/api/food/list${params}`);
      if (res.data.success) setMenu(res.data.data);
    } catch {}
  };

  const handleVegToggle = () => {
    const newVal = !isVeg;
    setIsVeg(newVal);
    fetchMenu(newVal);
  };

  // Client-side menu search
  const filteredMenu = menu.filter(item => {
    if (!menuSearch) return true;
    const q = menuSearch.toLowerCase();
    return item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
  });

  // Group filtered menu by category
  const grouped = filteredMenu.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const isClosed = restaurant && !restaurant.isOpen;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="h-56 bg-slate-200" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="h-8 bg-slate-200 rounded-2xl w-1/2" />
        <div className="h-4 bg-slate-100 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-48 bg-white rounded-3xl mt-6" />
      </div>
    </div>
  );

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover image */}
      <div className="relative h-56 sm:h-72 bg-slate-200 overflow-hidden">
        {restaurant.coverImage ? (
          <img
            src={`${url}/images/${restaurant.coverImage}`}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <span className="text-7xl">🏪</span>
          </div>
        )}
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate('/restaurants')}
          className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-700 hover:bg-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Open/Closed badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 text-sm font-bold rounded-2xl shadow-sm ${
            restaurant.isOpen
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-900/80 text-white backdrop-blur-sm'
          }`}>
            {restaurant.isOpen ? '● Open' : '✕ Closed'}
          </span>
        </div>

        {/* Logo */}
        {restaurant.logo && (
          <div className="absolute bottom-4 left-4 sm:left-6 w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden">
            <img src={`${url}/images/${restaurant.logo}`} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* Restaurant info card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 -mt-6 mb-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className={restaurant.logo ? 'sm:pl-14' : ''}>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 mb-2">{restaurant.name}</h1>

              {/* Cuisine tags */}
              {restaurant.cuisine && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {restaurant.cuisine.split(',').map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-xl border border-orange-100">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={restaurant.rating || 0} />
                <span className="text-sm font-bold text-slate-900">{restaurant.rating?.toFixed(1) || '—'}</span>
                {restaurant.totalReviews > 0 && (
                  <span className="text-xs text-slate-400">({restaurant.totalReviews} reviews)</span>
                )}
              </div>

              {/* Description */}
              {restaurant.description && (
                <p className="text-slate-500 text-sm leading-relaxed max-w-lg">{restaurant.description}</p>
              )}
            </div>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-50">
            {[
              { icon: '💰', label: 'Delivery fee', value: `$${restaurant.deliveryFee ?? 2}` },
              { icon: '⏱', label: 'Prep time', value: `${restaurant.preparationTime ?? 30} min` },
              { icon: '🕐', label: 'Hours', value: restaurant.openingHours || '—' },
              { icon: '🛒', label: 'Min order', value: restaurant.minOrder > 0 ? `$${restaurant.minOrder}` : 'None' },
            ].map((info, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl">
                <span className="text-xl flex-shrink-0">{info.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">{info.label}</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Closed banner */}
          {isClosed && (
            <div className="mt-4 p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">⏸</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">This restaurant is currently closed</p>
                <p className="text-xs text-slate-500">You can browse the menu but cannot place an order right now.</p>
              </div>
            </div>
          )}
        </div>

        {/* Menu section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8">
          {/* Menu header + filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="font-bold text-xl text-slate-900">Menu</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Veg filter toggle */}
              <button
                onClick={handleVegToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all border ${
                  isVeg
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                <span>🥦</span>
                Veg only
              </button>

              {/* Menu search */}
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-2 focus-within:border-orange-300 transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-36"
                />
                {menuSearch && (
                  <button onClick={() => setMenuSearch('')} className="text-slate-300 hover:text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grouped menu items */}
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <span className="text-5xl mb-3">🍽️</span>
              <p className="font-semibold text-slate-600">No items found</p>
              {(isVeg || menuSearch) && (
                <button
                  onClick={() => { setIsVeg(false); setMenuSearch(''); fetchMenu(false); }}
                  className="mt-3 px-4 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold rounded-xl text-xs transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="flex-shrink-0">{category}</span>
                    <span className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400 font-normal tracking-normal">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  </h3>
                  <div className="space-y-3">
                    {items.map(item => {
                      const qty = cartItems[item._id] || 0;
                      return (
                        <div key={item._id}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-orange-50/30 transition-colors group">
                          {/* Image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                            <img
                              src={`${url}/images/${item.image}`}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                              {item.isVeg && (
                                <span className="flex-shrink-0 w-4 h-4 rounded border-2 border-emerald-500 flex items-center justify-center">
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">{item.description}</p>
                            )}
                            <p className="font-bold text-orange-500">${item.price}</p>
                          </div>

                          {/* Cart controls */}
                          <div className="flex-shrink-0">
                            {isClosed ? (
                              <span className="text-xs text-slate-400 font-medium px-3 py-1.5 bg-slate-100 rounded-xl">Closed</span>
                            ) : qty === 0 ? (
                              <button
                                onClick={() => addToCart(item._id, id)}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow-md"
                              >
                                Add
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 bg-white border-2 border-orange-100 rounded-xl px-1 py-1">
                                <button
                                  onClick={() => removeFromCart(item._id)}
                                  className="w-7 h-7 rounded-lg bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-500 transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="font-bold text-slate-900 text-sm w-5 text-center">{qty}</span>
                                <button
                                  onClick={() => addToCart(item._id, id)}
                                  className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
