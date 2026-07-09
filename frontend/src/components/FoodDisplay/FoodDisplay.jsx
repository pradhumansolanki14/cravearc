import React, { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext)
  const filtered = food_list.filter(item => category === "All" || category === item.category)

  return (
    <section id="food-display" className="py-8 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-3">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                {category === "All" ? "All Items" : category}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {category === "All" ? (
                <>Popular <span className="text-gradient">near you</span></>
              ) : (
                <>{category} <span className="text-gradient">dishes</span></>
              )}
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {filtered.length} items
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-5xl mb-6">
              🍽️
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Nothing here yet</h3>
            <p className="text-slate-400 text-sm text-center max-w-xs">
              We couldn't find dishes in this category. Try selecting another one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map((item) => (
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
      </div>
    </section>
  )
}

export default FoodDisplay
