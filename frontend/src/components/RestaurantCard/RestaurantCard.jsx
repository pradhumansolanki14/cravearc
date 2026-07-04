import React from 'react';
import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/**
 * RestaurantCard
 * Displays a restaurant summary in the listing grid.
 * Non-clickable (pointer-events-none on content, no navigate) when restaurant is closed.
 */
const RestaurantCard = ({ restaurant, url }) => {
  const navigate = useNavigate();
  const isClosed = !restaurant.isOpen;

  const handleClick = () => {
    if (!isClosed) navigate(`/restaurant/${restaurant._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 
        ${isClosed
          ? 'opacity-70 cursor-not-allowed'
          : 'hover:shadow-card hover:-translate-y-1 cursor-pointer group'
        }`}
    >
      {/* Cover image / logo area */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {restaurant.coverImage ? (
          <img
            src={`${url}/images/${restaurant.coverImage}`}
            alt={restaurant.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${!isClosed ? 'group-hover:scale-105' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <span className="text-5xl">🏪</span>
          </div>
        )}

        {/* Closed overlay */}
        {isClosed && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-slate-900/80 text-white text-sm font-bold rounded-2xl backdrop-blur-sm">
              Closed
            </span>
          </div>
        )}

        {/* Logo chip */}
        {restaurant.logo && (
          <div className="absolute bottom-3 left-3 w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden">
            <img src={`${url}/images/${restaurant.logo}`} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Open badge */}
        {!isClosed && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm">
              Open
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className={`font-bold text-slate-900 text-base mb-1 truncate ${!isClosed ? 'group-hover:text-orange-500 transition-colors' : ''}`}>
          {restaurant.name}
        </h3>

        {/* Cuisine tags */}
        {restaurant.cuisine && (
          <p className="text-xs text-slate-500 mb-2 truncate">{restaurant.cuisine}</p>
        )}

        {/* Star + rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={restaurant.rating || 0} />
          <span className="text-xs font-semibold text-slate-700">{restaurant.rating?.toFixed(1) || '—'}</span>
          {restaurant.totalReviews > 0 && (
            <span className="text-xs text-slate-400">({restaurant.totalReviews})</span>
          )}
        </div>

        {/* Meta strip */}
        <div className="flex items-center gap-3 flex-wrap">
          {restaurant.deliveryFee !== undefined && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${restaurant.deliveryFee} delivery
            </span>
          )}
          {restaurant.preparationTime && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {restaurant.preparationTime} min
            </span>
          )}
          {restaurant.minOrder > 0 && (
            <span className="text-xs text-slate-400">Min ${restaurant.minOrder}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
