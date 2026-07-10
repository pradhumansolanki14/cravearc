import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiFolder, FiPackage, FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Container, Button, Card } from '../../components/ui';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { url, food_list } = useContext(StoreContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${url}/api/categories`);
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [url]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <Container>
        
        {/* Header Block */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
            aria-label="Go back"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">All Categories</h1>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">Browse categories and menu folders</p>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-28 bg-white border border-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center p-8 max-w-sm mx-auto shadow-sm">
            <FiPackage size={32} className="text-slate-300 mb-3.5" />
            <h3 className="font-bold text-slate-705 text-sm">No Categories Cataloged</h3>
            <p className="text-xs text-slate-400 mt-1">Check back later for menu folders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => {
              // Calculate food count dynamically from active food list
              const foodCount = food_list.filter(f => f.category === cat.name).length;

              return (
                <Card
                  key={cat._id}
                  variant="default"
                  radius="2xl"
                  padding="sm"
                  className="group flex items-center justify-between border border-slate-100 hover:border-emerald-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/menu?category=${cat.name}`)}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Category Image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-2xs border border-slate-100 flex-shrink-0 bg-slate-50">
                      {cat.image ? (
                        <img 
                          src={`${url}/images/${cat.image}`} 
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-350">
                          <FiFolder size={20} />
                        </div>
                      )}
                    </div>
                    {/* Category Details */}
                    <div>
                      <h3 className="font-poppins font-bold text-slate-850 text-xs tracking-tight group-hover:text-emerald-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                        {foodCount} Dish{foodCount !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Icon */}
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors mr-1">
                    <FiChevronRight size={14} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </Container>
    </div>
  );
};

export default CategoriesPage;
