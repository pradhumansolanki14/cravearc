import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiInfo, FiTrendingUp, FiSearch, FiSliders } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import { Container, SearchInput, Button } from '../../components/ui';

const CATEGORIES = ["All", "Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];

const SearchPage = () => {
  const { food_list } = useContext(StoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.toLowerCase().trim();

  let results = food_list.filter(item => {
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price-asc') results = [...results].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') results = [...results].sort((a, b) => b.price - a.price);
  if (sortBy === 'name') results = [...results].sort((a, b) => a.name.localeCompare(b.name));

  const handleSearch = (val) => {
    setQuery(val);
    if (val) setSearchParams({ q: val });
    else setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Search Header Bar ── */}
      <div className="bg-white border-b border-slate-100 sticky top-20 z-40 shadow-sm">
        <Container className="py-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors flex-shrink-0 border border-slate-100"
              aria-label="Go back"
            >
              <FiArrowLeft size={18} className="text-slate-650" />
            </button>

            {/* Input field */}
            <div className="flex-1">
              <SearchInput
                ref={inputRef}
                placeholder="Search for delicious dishes, cuisines, categories..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onClear={() => handleSearch('')}
              />
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main Results Area ── */}
      <Container className="py-8">
        
        {/* Filters Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          
          {/* Categories Pill list */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide flex-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4.5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-emerald-500 text-white shadow-emerald'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-350 hover:text-emerald-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selection Box */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <FiSliders />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-450 cursor-pointer shadow-sm"
            >
              <option value="default">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Results Metadata Summary */}
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {q ? (
              <>Found <span className="font-bold text-slate-800">{results.length}</span> menu result{results.length !== 1 ? 's' : ''} for &quot;<span className="text-emerald-600 font-bold">{query}</span>&quot;</>
            ) : (
              <><span className="font-bold text-slate-800">{results.length}</span> dishes available in catalog</>
            )}
          </p>
        </div>

        {/* ── Search Output ── */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-slate-100 rounded-3xl shadow-card p-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5">
              <FiInfo size={28} />
            </div>
            <h3 className="font-poppins font-bold text-slate-800 text-lg mb-2">No Items Found</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We couldn&apos;t find any dishes matching &quot;{query}&quot;. Please try search suggestions or browsing alternative categories.
            </p>
            <Button
              onClick={() => { handleSearch(''); setActiveCategory('All'); }}
              variant="primary"
              size="md"
              className="font-bold shadow-emerald-lg"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(item => (
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

        {/* Popular Searches Suggestion block (visible only when query is empty) */}
        {!q && (
          <div className="mt-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-poppins font-extrabold text-sm text-slate-800 mb-5 uppercase tracking-widest flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" />
              Trending Queries
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {["Pizza", "Pasta", "Salad", "Cake", "Noodles", "Sandwich", "Rolls", "Ice Cream"].map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-150 hover:border-emerald-250 text-xs font-bold text-slate-650 hover:text-emerald-600 rounded-xl transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

      </Container>
    </div>
  );
};

export default SearchPage;
