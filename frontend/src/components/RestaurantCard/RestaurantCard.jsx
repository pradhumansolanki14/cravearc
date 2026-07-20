import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiClock, FiTruck, FiChevronRight, FiTag, FiHeart } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Card } from '../ui';
import { toast } from 'react-hot-toast';

/**
 * RestaurantCard
 * Displays a restaurant summary in a premium 2026 SaaS layout.
 */
const RestaurantCard = ({ restaurant, url }) => {
  const navigate = useNavigate();
  const { token, toggleFavorite, isFavorite } = useContext(StoreContext);
  const isClosed = !restaurant.isOpen;
  const fav = isFavorite(restaurant._id, "restaurant");

  const handleClick = () => {
    if (!isClosed) navigate(`/restaurant/${restaurant.slug || restaurant._id}`);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    if (!token) {
      toast.error("Please login to save favorites");
      return;
    }
    toggleFavorite({ restaurantId: restaurant._id });
  };

  const cuisines = restaurant.cuisine
    ? restaurant.cuisine.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  return (
    <Card
      variant="flat"
      padding="none"
      radius="2xl"
      onClick={handleClick}
      className={`group relative flex flex-col h-full bg-white border border-slate-100 transition-all duration-300 overflow-hidden ${
        isClosed
          ? 'opacity-70 cursor-not-allowed select-none shadow-xs'
          : 'hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:border-emerald-200 cursor-pointer'
      }`}
    >
      {/* Cover Image Area */}
      <div className="relative h-32 sm:h-48 overflow-hidden bg-slate-50 rounded-t-2xl">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              !isClosed ? 'group-hover:scale-105' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-650 to-emerald-700 flex flex-col items-center justify-center text-white p-2 text-center">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-200/80 mb-0.5">CraveArc Partner</span>
            <span className="font-poppins font-black text-2xl sm:text-4xl select-none">{restaurant.name?.charAt(0)}</span>
          </div>
        )}

        {/* Status Overlay (Open/Closed) */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md shadow-xs ${
            isClosed ? 'bg-rose-600/90' : 'bg-emerald-600/90'
          }`}>
            <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${isClosed ? 'bg-rose-200' : 'bg-emerald-200 animate-pulse'}`} />
            {isClosed ? 'Closed' : 'Open'}
          </span>
        </div>

        {/* Favorite Button overlay */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <button
            type="button"
            onClick={handleFav}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md border transition-all duration-300 ${
              fav 
                ? 'bg-rose-500 border-rose-500 scale-110 text-white' 
                : 'bg-white/95 backdrop-blur-md border-slate-100/80 text-slate-500 hover:scale-110'
            }`}
          >
            <FiHeart size={11} className={fav ? 'fill-white text-white' : ''} />
          </button>
        </div>

        {/* Rating Pill overlayed on image */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10">
          <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md sm:rounded-lg text-white font-extrabold text-[10px] sm:text-xs shadow-sm">
            <FiStar size={10} className="text-amber-405 fill-amber-400" />
            <span>
              {restaurant.rating > 0 ? Number(restaurant.rating).toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </div>

      {/* Logo badge overlay (placed outside overflow-hidden cover container to prevent clipping) */}
      {restaurant.logo && (
        <div className="absolute top-[104px] sm:top-[164px] left-3 sm:left-5 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden z-20 transition-transform duration-300 group-hover:scale-105">
          <img src={restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content details */}
      <div className="pt-5 sm:pt-8 p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Restaurant Title & Arrow */}
          <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
            <h3 className="font-poppins font-extrabold text-slate-805 text-xs sm:text-base group-hover:text-emerald-600 transition-colors duration-200 truncate">
              {restaurant.name}
            </h3>
            {!isClosed && (
              <span className="hidden sm:inline-block text-emerald-500 transform translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <FiChevronRight size={16} strokeWidth={2.5} />
              </span>
            )}
          </div>

          {/* Cuisine list */}
          {cuisines.length > 0 && (
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate mb-2.5 sm:mb-4">
              {cuisines.join(' · ')}
            </p>
          )}
        </div>

        {/* Stats Grid - Ultra-clean 2026 row block */}
        <div className="border-t border-slate-100 pt-2.5 sm:pt-3.5 mt-auto flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-bold text-slate-505">
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <FiTruck size={11} className="text-emerald-550 sm:w-3.5 sm:h-3.5" />
            <span>{Number(restaurant.deliveryFee) === 0 ? "Free" : `₹${restaurant.deliveryFee}`}</span>
          </div>
          <div className="w-1 h-1 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <FiClock size={11} className="text-emerald-555 sm:w-3.5 sm:h-3.5" />
            <span>{restaurant.preparationTime ?? 30}m</span>
          </div>
          {restaurant.minOrder > 0 && (
            <>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <FiTag size={10} className="text-emerald-555 sm:w-3 sm:h-3" />
                <span>₹{restaurant.minOrder}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;
