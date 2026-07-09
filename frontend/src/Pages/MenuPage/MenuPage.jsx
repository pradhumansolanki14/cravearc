import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { menu_list } from '../../assets/assets';
import FoodItem from '../../components/FoodItem/FoodItem';
import { FiSearch, FiX, FiFilter, FiSliders, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { Container, Button, Card, Select } from '../../components/ui';

const CATEGORIES = ["All", ...menu_list.map(m => m.menu_name)];

const MenuPage = () => {
  const { food_list } = useContext(StoreContext);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');

  let filtered = food_list.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const handleClearFilters = () => {
    setActiveCategory('All');
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Hero Banner ── */}
      <div className="relative bg-slate-900 overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
        </div>
        
        <Container className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-xl mb-4.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Gourmet Selection</span>
          </div>
          <h1 className="font-poppins font-extrabold text-4xl sm:text-5xl text-white mb-3 tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-mint-300">Catalog Menu</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-md mb-8 leading-relaxed">
            Browse through every single gourmet masterpiece we prepare — cooked with fresh, top-tier locally sourced ingredients.
          </p>

          {/* Search box overlay */}
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 max-w-md focus-within:ring-2 focus-within:ring-emerald-500/30 border border-slate-200 transition-all duration-300 shadow-sm">
            <FiSearch className="text-slate-400 flex-shrink-0" size={18} />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gourmet dishes..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-medium" 
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-50 rounded-lg transition-all"
                aria-label="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </Container>
      </div>

      {/* ── Main Catalog Grid ── */}
      <Container className="py-8">
        
        {/* Category Pills & Sorting Select */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Horizontal scroll selection pills */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide flex-1">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort selection dropdown */}
          <div className="flex-shrink-0 min-w-[170px]">
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Results Counter / Filter Reset row */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">
            Found <span className="text-slate-800 font-extrabold">{filtered.length}</span> dish{filtered.length !== 1 ? 'es' : ''}
            {activeCategory !== 'All' && <> in <span className="text-emerald-600 font-extrabold">{activeCategory}</span></>}
            {search && <> matching &ldquo;<span className="text-emerald-600 font-extrabold">{search}</span>&rdquo;</>}
          </p>
          
          {(activeCategory !== 'All' || search) && (
            <button 
              onClick={handleClearFilters}
              className="text-2xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 p-1"
            >
              <FiX size={12} strokeWidth={2.5} />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Catalog items display list */}
        {filtered.length === 0 ? (
          /* Empty search catalog states */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-slate-100 rounded-3xl shadow-card p-8 animate-fadeUp">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-5">
              <FiSearch size={24} />
            </div>
            <h3 className="font-poppins font-bold text-slate-800 text-base mb-2">No dishes found</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">We couldn&apos;t find any item matching those criteria. Try expanding your search queries or selecting another category.</p>
            <Button 
              onClick={handleClearFilters} 
              variant="outline" 
              size="md"
              className="font-bold border-slate-200 text-slate-600 w-full"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map(item => (
              <FoodItem 
                key={item._id} 
                id={item._id} 
                name={item.name} 
                description={item.description} 
                price={item.price} 
                image={item.image} 
                category={item.category}
              />
            ))}
          </div>
        )}

      </Container>
    </div>
  );
};

export default MenuPage;
