import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { FiX, FiPackage } from 'react-icons/fi'
import { StoreContext } from '../../context/StoreContext'

const ExploreMenu = ({ category, setCategory }) => {
  const { url } = useContext(StoreContext)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${url}/api/categories`)
        if (res.data.success) setCategories(res.data.data)
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [url])

  return (
    <section id="explore-menu" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl mb-3">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Categories</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              What are you{' '}
              <span className="text-gradient">craving?</span>
            </h2>
          </div>
          {category !== 'All' && (
            <button
              onClick={() => setCategory('All')}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-orange-500 transition-colors"
            >
              <FiX size={16} />
              Clear filter
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 p-3 sm:p-4 rounded-2xl border-2 border-slate-100 bg-white animate-pulse">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200" />
                <div className="h-2.5 w-12 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <FiPackage size={32} />
            <p className="text-sm font-semibold mt-3 text-slate-400">No categories available yet.</p>
          </div>
        )}

        {/* Category Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categories.map((item) => {
              const isActive = category === item.name
              return (
                <button
                  key={item._id}
                  onClick={() => setCategory(prev => prev === item.name ? 'All' : item.name)}
                  className={`group flex flex-col items-center gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-orange-500 border-orange-500 shadow-orange scale-105'
                      : 'bg-white border-slate-100 hover:border-orange-200 hover:scale-105 hover:shadow-card'
                  }`}
                >
                  <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-white/40' : ''}`}>
                    {item.image ? (
                      <img
                        src={`${url}/images/${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <FiPackage size={20} />
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-orange-500/20" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight transition-colors ${
                    isActive ? 'text-white' : 'text-slate-700 group-hover:text-orange-500'
                  }`}>
                    {item.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Active filter strip */}
        {category !== 'All' && (
          <div className="mt-6 flex items-center gap-2 p-4 bg-orange-50 border border-orange-100 rounded-2xl animate-fadeUp">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <FiPackage size={14} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Showing <span className="text-orange-500">{category}</span> dishes
              </p>
              <p className="text-xs text-slate-400">Click the category again or "Clear filter" to show all</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ExploreMenu
