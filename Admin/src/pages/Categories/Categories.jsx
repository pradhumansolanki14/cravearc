import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiFolder, FiPlus, FiX, FiInfo, FiLayers, FiDollarSign } from "react-icons/fi";
import { Card, Badge, Button, Input } from "../../components/ui";

const DEFAULT_CATEGORIES = [
  { name: "Salad",     emoji: "🥗", color: "border-green-150/45 text-green-700 bg-green-50/10" },
  { name: "Rolls",     emoji: "🌯", color: "border-amber-150/45 text-amber-705 bg-amber-50/10" },
  { name: "Deserts",   emoji: "🍰", color: "border-pink-150/45 text-pink-700 bg-pink-50/10" },
  { name: "Sandwich",  emoji: "🥪", color: "border-yellow-150/45 text-yellow-800 bg-yellow-50/10" },
  { name: "Cake",      emoji: "🎂", color: "border-purple-150/45 text-purple-700 bg-purple-50/10" },
  { name: "Pure Veg",  emoji: "🥦", color: "border-emerald-150/45 text-emerald-705 bg-emerald-50/10" },
  { name: "Pasta",     emoji: "🍝", color: "border-orange-150/45 text-orange-700 bg-orange-50/10" },
  { name: "Noodles",   emoji: "🍜", color: "border-red-150/45 text-red-700 bg-red-50/10" },
];

const EMOJI_OPTIONS = ["🥗","🌯","🍰","🥪","🎂","🥦","🍝","🍜","🍕","🍔","🌮","🍱","🍛","🥩","🦐","🍣","🥟","🧆","🫕"];

const Categories = ({ url }) => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", emoji: "🍽️" });

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/food/list`);
      if (res.data.success) {
        setFoodList(res.data.data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { 
    fetchFoods(); 
  }, []);

  const categoryStats = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    count: foodList.filter(f => f.category === cat.name).length,
    avgPrice: foodList.filter(f => f.category === cat.name).length
      ? (foodList.filter(f => f.category === cat.name).reduce((a, b) => a + b.price, 0) / foodList.filter(f => f.category === cat.name).length).toFixed(0)
      : 0,
  }));

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    toast.info(`Category "${newCat.name}" noted! Add it to categories array in Add.jsx to make it available.`);
    setShowAdd(false);
    setNewCat({ name: "", emoji: "🍽️" });
  };

  return (
    <div className="max-w-4xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiFolder size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Categories</h1>
            <p className="text-slate-405 text-xs font-semibold">{DEFAULT_CATEGORIES.length} structure groups · {foodList.length} total items</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowAdd(f => !f)}
          variant="primary" 
          size="sm"
          leftIcon={<FiPlus />}
          className="font-bold shadow-emerald"
        >
          Add Category
        </Button>
      </div>

      {/* Add Form Drawer */}
      {showAdd && (
        <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card animate-fadeUp">
          <h2 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider mb-4">New Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Input 
                label="Category Name"
                required
                value={newCat.name} 
                onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))} 
                placeholder="e.g. Burgers" 
              />
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Emoji Icon</label>
                <div className="grid grid-cols-10 gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  {EMOJI_OPTIONS.map(em => (
                    <button 
                      key={em} 
                      type="button" 
                      onClick={() => setNewCat(c => ({ ...c, emoji: em }))}
                      className={`w-7 h-7 rounded-xl text-sm flex items-center justify-center transition-all ${
                        newCat.emoji === em 
                          ? 'bg-emerald-100 ring-2 ring-emerald-400' 
                          : 'bg-white hover:bg-slate-100 shadow-3xs'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100/70 rounded-2xl flex gap-2">
              <FiInfo className="text-amber-600 mt-0.5 flex-shrink-0" size={14} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 leading-normal">
                After adding a category here, please insert it in the CATEGORIES array in Admin/src/pages/Add/Add.jsx to support menu creations.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={() => setShowAdd(false)} variant="outline" size="md" className="flex-1 font-bold">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" className="flex-1 font-bold shadow-emerald-lg">
                Add Category
              </Button>
            </div>

          </form>
        </Card>
      )}

      {/* Categories stats grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((cat, i) => (
            <Card 
              key={i} 
              variant="default"
              radius="2xl"
              padding="md"
              className={`border-2 border-slate-100/60 shadow-sm relative overflow-hidden flex flex-col justify-between h-36 hover:-translate-y-1 transition-all duration-300 ${cat.color}`}
            >
              <div>
                <span className="text-3xl block mb-2">{cat.emoji}</span>
                <h3 className="font-poppins font-extrabold text-sm uppercase tracking-wider text-slate-805 leading-none">{cat.name}</h3>
              </div>
              <div>
                <div className="space-y-1 text-slate-500 font-semibold text-2xs uppercase tracking-wider">
                  <div className="flex justify-between">
                    <span>Dishes</span>
                    <span className="font-bold text-slate-900">{cat.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Price</span>
                    <span className="font-bold text-slate-900">${cat.avgPrice}</span>
                  </div>
                </div>
                {/* mini bar */}
                <div className="mt-2.5 h-1 bg-slate-150/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${foodList.length > 0 ? (cat.count / foodList.length) * 100 : 0}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Breakdown percentages */}
      {!loading && (
        <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-sm">
          <h2 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider pb-3 border-b border-slate-50 mb-5">
            Dishes Distribution
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {categoryStats.map((cat, i) => {
              const pct = foodList.length > 0 ? Math.round((cat.count / foodList.length) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50">
                  <span className="text-lg w-7 text-center">{cat.emoji}</span>
                  <span className="text-xs font-bold text-slate-800 w-24 flex-shrink-0">{cat.name}</span>
                  
                  <div className="flex-1 h-2 bg-slate-100 border border-slate-200/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${cat.count > 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-slate-200'}`}
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                  <span className="text-2xs font-mono font-extrabold text-slate-655 w-14 text-right">
                    {cat.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

    </div>
  );
};

export default Categories;
