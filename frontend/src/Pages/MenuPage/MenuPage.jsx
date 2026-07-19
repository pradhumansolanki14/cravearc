import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import FoodItem from '../../components/FoodItem/FoodItem';
import { FiSearch, FiX, FiSliders, FiGrid, FiLayers } from 'react-icons/fi';
import { Container, Button } from '../../components/ui';

const MenuPage = () => {
  const { food_list, url } = useContext(StoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [vegOnly, setVegOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-10' | '10-20' | 'over-20'
  const [minRating, setMinRating] = useState(0); // 0 | 4.0 | 4.5
  const [maxPrepTime, setMaxPrepTime] = useState(999); // 999 | 20 | 30
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${url}/api/categories`);
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, [url]);

  let filtered = food_list.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !search || 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesVeg = !vegOnly || item.isVeg === true || item.isVeg === 'true';
    
    // Price Filter
    let matchesPrice = true;
    if (priceRange === 'under-150') matchesPrice = item.price < 150;
    else if (priceRange === '150-500') matchesPrice = item.price >= 150 && item.price <= 500;
    else if (priceRange === 'over-500') matchesPrice = item.price > 500;

    // Rating Filter
    const charSum = item.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const itemRating = item.averageRating > 0 ? item.averageRating : parseFloat((4.0 + ((charSum % 10) / 10)).toFixed(1));
    const matchesRating = itemRating >= minRating;

    // Prep Time Filter
    const itemPrep = item.preparationTime !== undefined && item.preparationTime !== null ? item.preparationTime : (15 + (charSum % 20));
    const matchesPrep = itemPrep <= maxPrepTime;

    // Availability Filter
    const matchesAvailability = !inStockOnly || item.isAvailable === true || item.isAvailable === 'true';

    return matchesCat && matchesSearch && matchesVeg && matchesPrice && matchesRating && matchesPrep && matchesAvailability;
  });

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const handleClearFilters = () => {
    setActiveCategory('All');
    setSearch('');
    setVegOnly(false);
    setPriceRange('all');
    setMinRating(0);
    setMaxPrepTime(999);
    setInStockOnly(false);
    setSortBy('default');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* ─── Compact Header ─── */}
      <div className="bg-white border-b border-slate-100 py-5">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">
                Gourmet <span className="text-emerald-600">Menu</span>
              </h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-0.5">
                Prepared fresh and delivered hot to your doorstep
              </p>
            </div>
            
            {/* Inline Compact Search */}
            <div className="w-full md:w-80">
              <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-300">
                <FiSearch className="text-slate-400 flex-shrink-0" size={16} />
                <input 
                  type="text" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search dishes, snacks..."
                  className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none font-semibold" 
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')} 
                    className="text-slate-400 hover:text-slate-700 p-0.5 hover:bg-slate-200 rounded-md transition-all"
                    aria-label="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-6">
        
        {/* Category Pills & Filters strip (highly compact) */}
        <div className="space-y-3.5 mb-6">
          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* "All" Pill */}
            <button
              onClick={() => {
                setActiveCategory('All');
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                activeCategory === 'All'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-805'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                activeCategory === 'All' ? 'bg-white/10 text-white' : 'bg-slate-50 border border-slate-150 text-slate-450'
              }`}>
                <FiGrid size={13} />
              </div>
              <span>All Dishes</span>
            </button>

            {/* Dynamic Category Pills */}
            {categories.map(cat => {
              const isSelected = activeCategory === cat.name;
              return (
                <button
                  key={cat._id}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    searchParams.set('category', cat.name);
                    setSearchParams(searchParams);
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-805'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-emerald-500/20 text-emerald-100' 
                      : 'bg-slate-50 border border-slate-150 text-slate-450'
                  }`}>
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <FiLayers size={13} />
                    )}
                  </div>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Filters & Sorters Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
                  vegOnly
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300'}`} />
                Veg Only
              </button>
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
                  inStockOnly
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${inStockOnly ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300'}`} />
                In Stock
              </button>
            </div>

            {/* Select options */}
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-2xs font-extrabold uppercase tracking-wider text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Price: All</option>
                <option value="under-150">Under ₹150</option>
                <option value="150-500">₹150 - ₹500</option>
                <option value="over-500">Over ₹500</option>
              </select>

              <select
                value={minRating}
                onChange={e => setMinRating(Number(e.target.value))}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-2xs font-extrabold uppercase tracking-wider text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value={0}>Rating: All</option>
                <option value={4.0}>4.0+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>

              <select
                value={maxPrepTime}
                onChange={e => setMaxPrepTime(Number(e.target.value))}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-2xs font-extrabold uppercase tracking-wider text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value={999}>Prep Time: All</option>
                <option value={20}>Under 20 mins</option>
                <option value={30}>Under 30 mins</option>
              </select>
            </div>

            {/* Sorter and Clear */}
            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-emerald-500 focus:ring-0 rounded-xl text-2xs font-extrabold uppercase tracking-wider text-slate-650 outline-none cursor-pointer transition-colors"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              {(activeCategory !== 'All' || search || vegOnly || priceRange !== 'all' || minRating !== 0 || maxPrepTime !== 999 || inStockOnly || sortBy !== 'default') && (
                <button 
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-2xs font-extrabold uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <FiX size={12} strokeWidth={2.5} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Grid List ─── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-slate-105 rounded-3xl shadow-card p-8 animate-fadeUp">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450 mb-5">
              <FiSliders size={24} />
            </div>
            <h3 className="font-poppins font-bold text-slate-800 text-base mb-2">No matching dishes</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              We couldn&apos;t find any item matching those criteria. Try resetting filters or widening search parameters.
            </p>
            <Button 
              onClick={handleClearFilters} 
              variant="primary" 
              size="md"
              className="font-bold shadow-emerald-lg w-full"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeUp">
            {filtered.map(item => (
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
    </div>
  );
};

export default MenuPage;
