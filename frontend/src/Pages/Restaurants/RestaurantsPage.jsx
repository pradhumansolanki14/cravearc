import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-slate-100" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-slate-100 rounded-xl w-3/4" />
      <div className="h-3 bg-slate-50 rounded-xl w-1/2" />
      <div className="h-3 bg-slate-50 rounded-xl w-2/3" />
    </div>
  </div>
);

const RestaurantsPage = () => {
  const { url } = useContext(StoreContext);
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [search, setSearch] = useState('');

  const fetchRestaurants = async (cuisineId) => {
    setLoading(true);
    try {
      const params = cuisineId ? `?cuisineId=${cuisineId}` : '';
      const res = await axios.get(`${url}/api/food/restaurants${params}`);
      if (res.data.success) setRestaurants(res.data.data);
    } catch {
      setRestaurants([]);
    }
    setLoading(false);
  };

  const fetchCuisines = async () => {
    try {
      const res = await axios.get(`${url}/api/cuisines`);
      if (res.data.success) setCuisines(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchCuisines();
    fetchRestaurants('');
    window.scrollTo(0, 0);
  }, []);

  const handleCuisineChange = (id) => {
    setSelectedCuisine(id);
    fetchRestaurants(id);
  };

  // Client-side search filter by name or cuisine text
  const filtered = restaurants.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-bold text-3xl sm:text-4xl text-slate-900 mb-1">Restaurants</h1>
              <p className="text-slate-400 text-sm">
                {loading ? 'Loading...' : `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-2.5 w-full sm:w-72 focus-within:border-orange-300 transition-colors">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search restaurants..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-300 hover:text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cuisine filter bar */}
        {cuisines.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
            <button
              onClick={() => handleCuisineChange('')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                !selectedCuisine
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-500'
              }`}
            >
              All Cuisines
            </button>
            {cuisines.map(c => (
              <button
                key={c._id}
                onClick={() => handleCuisineChange(c._id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                  selectedCuisine === c._id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-500'
                }`}
              >
                {c.icon && <span>{c.icon}</span>}
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🏪</span>
            <h3 className="font-bold text-xl text-slate-900 mb-2">
              {search ? 'No restaurants match your search' : 'No restaurants available'}
            </h3>
            <p className="text-slate-400 text-sm">
              {search ? 'Try a different search term' : 'Check back later for new restaurants'}
            </p>
            {(search || selectedCuisine) && (
              <button
                onClick={() => { setSearch(''); handleCuisineChange(''); }}
                className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(r => (
              <RestaurantCard key={r._id} restaurant={r} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
