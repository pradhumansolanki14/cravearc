import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiPlus, FiMinus, FiStar, FiClock, FiActivity, FiX, FiEye, FiArrowRight } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Card, Button, Badge } from '../ui';

const FoodItem = ({ 
  id, 
  name, 
  price, 
  description, 
  image, 
  category, 
  preparationTime = 20, 
  isVeg, 
  calories, 
  restaurantId, 
  isAvailable,
  averageRating = 0,
  reviewCount = 0,
  discount = 0,
  searchQuery = ""
}) => {
  const { cartItems, addToCart, removeFromCart, url, toggleFavorite, isFavorite, token, food_list, formatPrice } = useContext(StoreContext);
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const qty = cartItems[id] || 0;
  const fav = isFavorite(id);

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!token) return;
    setFavAnimating(true);
    await toggleFavorite(id);
    setTimeout(() => setFavAnimating(false), 400);
  };

  const handleRestaurantNav = (e) => {
    e.stopPropagation();
    const rId = typeof restaurantId === 'object' ? (restaurantId?.slug || restaurantId?._id) : restaurantId;
    if (rId) navigate(`/restaurant/${rId}`);
  };

  // Find alternative offers of the same food from different restaurants
  const currentRestaurantId = typeof restaurantId === 'object' ? restaurantId?._id : restaurantId;
  const alternatives = food_list.filter(item => 
    item.name.toLowerCase() === name.toLowerCase() && 
    item._id !== id && 
    (typeof item.restaurantId === 'object' ? item.restaurantId?._id : item.restaurantId) !== currentRestaurantId
  );

  const highlightText = (text, highlight) => {
    if (!highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) 
            ? <mark key={i} className="bg-amber-100 text-amber-900 rounded-sm px-0.5">{part}</mark>
            : part
        )}
      </span>
    );
  };

  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : "New";

  return (
    <>
      <Card
        variant="default"
        padding="none"
        radius="2xl"
        className="group relative flex flex-col h-full overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1.5 hover:border-emerald-100/80 transition-all duration-500 animate-fadeIn"
      >
        {/* ── Visual Media Area ── */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
          {/* Availability Status */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-xl shadow-md">
                Out of Stock
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && isAvailable && (
            <div className="absolute top-3.5 left-3.5 z-20">
              <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-0.5 animate-scaleIn">
                {discount}% OFF
              </span>
            </div>
          )}

          {/* Skeleton Loader placeholder */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
          )}

          {/* Core Image element */}
          <img
            src={`${url}/images/${image}`}
            alt={name}
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Smooth Bottom Gradient Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Floating Top Widgets */}
          <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-2">
            {/* Favorite Button */}
            <button
              type="button"
              onClick={handleFav}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border transition-all duration-300 ${
                fav 
                  ? 'bg-rose-500 border-rose-500 scale-110' 
                  : 'bg-white/90 backdrop-blur-md border-slate-100 opacity-0 group-hover:opacity-100'
              } ${favAnimating ? 'scale-125' : ''}`}
            >
              <FiHeart 
                size={13} 
                className={fav ? 'text-white fill-white' : 'text-slate-500'} 
              />
            </button>

            {/* Quick View Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 hover:text-emerald-500 shadow-md transition-all duration-300"
              title="Quick View Details"
            >
              <FiEye size={13} />
            </button>
          </div>

          {/* Rating chip overlay (floating top-left) */}
          {discount === 0 && (
            <div className="absolute top-3.5 left-3.5">
              <Badge variant="white" size="sm" rounded="full" className="backdrop-blur-md shadow-sm bg-white/90 border border-slate-100/50 font-bold flex items-center gap-1">
                <FiStar className="text-amber-400 fill-amber-400" size={12} />
                <span className="text-[10px] text-slate-700">{displayRating}</span>
              </Badge>
            </div>
          )}

          {/* Floating Category tag at bottom-right */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2 py-0.5 bg-slate-900/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider rounded-md">
              {category}
            </span>
          </div>

          {/* Floating Veg/Non-veg Status Box at bottom-left */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className={`w-5 h-5 rounded-md border-2 bg-white/95 flex items-center justify-center shadow-xs ${
              isVeg ? 'border-emerald-500' : 'border-rose-500'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isVeg ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </div>
          </div>
        </div>

        {/* ── Content details area ── */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Restaurant Avatar & Tag */}
            {typeof restaurantId === 'object' && restaurantId?.name && (
              <div 
                onClick={handleRestaurantNav}
                className="flex items-center gap-1.5 mb-2 cursor-pointer hover:opacity-85 group/rest w-fit"
              >
                {restaurantId.logo ? (
                  <img 
                    src={`${url}/images/${restaurantId.logo}`}
                    alt={restaurantId.name}
                    className="w-5 h-5 rounded-full object-cover border border-slate-105 shadow-2xs"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] text-emerald-600 font-extrabold uppercase">
                    {restaurantId.name.charAt(0)}
                  </div>
                )}
                <span className="text-[10px] font-bold text-slate-400 group-hover/rest:text-emerald-600 uppercase tracking-wider transition-colors duration-200">
                  {restaurantId.name}
                </span>
              </div>
            )}

            {/* Food Name */}
            <h3 className="font-poppins font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors duration-300">
              {highlightText(name, searchQuery)}
            </h3>

            {/* Description */}
            <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2 mb-3.5">
              {highlightText(description, searchQuery)}
            </p>

            {/* Metrics Chips line */}
            <div className="flex items-center gap-2 mb-4 border-t border-slate-50 pt-3">
              <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100/50">
                <FiClock size={10} className="text-emerald-500" />
                {preparationTime} mins
              </span>
              {calories && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100/50">
                  <FiActivity size={10} className="text-emerald-500" />
                  {calories} kcal
                </span>
              )}
              {averageRating > 0 && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100/50">
                  <FiStar size={10} className="text-amber-500 fill-amber-500" />
                  {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Pricing and Cart Buttons footer */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-base font-poppins font-black text-slate-900 leading-none">
                {formatPrice(price)}
              </span>
              {discount > 0 && (
                <span className="text-[9px] text-slate-400 font-bold line-through mt-1">
                  {formatPrice(price / (1 - discount/100))}
                </span>
              )}
            </div>

            <div onClick={e => e.stopPropagation()}>
              {!isAvailable ? (
                <Badge variant="neutral" size="sm" rounded="xl" className="font-bold border-slate-100 px-3.5 py-1.5 text-2xs uppercase tracking-wider text-slate-405">
                  Sold Out
                </Badge>
              ) : qty === 0 ? (
                <button
                  onClick={() => addToCart(id, typeof restaurantId === 'object' ? restaurantId?._id : restaurantId)}
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-extrabold rounded-2xl flex items-center justify-center gap-1 transition-all duration-300 hover:scale-103 shadow-2xs hover:shadow-emerald"
                  aria-label={`Add ${name} to cart`}
                >
                  <FiPlus size={11} strokeWidth={2.5} />
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-0.5 shadow-2xs">
                  <button 
                    onClick={() => removeFromCart(id)} 
                    className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-500 transition-colors font-bold"
                    aria-label="Decrease quantity"
                  >
                    <FiMinus size={10} strokeWidth={2.5} />
                  </button>
                  <span className="w-4 text-center text-xs font-black text-slate-800">{qty}</span>
                  <button 
                    onClick={() => addToCart(id, typeof restaurantId === 'object' ? restaurantId?._id : restaurantId)} 
                    className="w-7 h-7 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors font-bold"
                    aria-label="Increase quantity"
                  >
                    <FiPlus size={10} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Quick View Detail Modal ── */}
      {showQuickView && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setShowQuickView(false); }}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-fadeUp flex flex-col md:flex-row gap-6 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setShowQuickView(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-505 transition-colors z-10"
            >
              <FiX size={16} />
            </button>

            {/* Left side visual columns */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-2xs relative">
                <img
                  src={`${url}/images/${image}`}
                  alt={name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl absolute top-3 left-3 shadow-md">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Extra specifications stats */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <FiClock className="text-emerald-500" size={11} /> Prep Time
                  </span>
                  <span className="text-sm font-black text-slate-800">{preparationTime} Minutes</span>
                </div>
                {calories && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <FiActivity className="text-emerald-500" size={11} /> Calories
                    </span>
                    <span className="text-sm font-black text-slate-800">{calories} kcal</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side info columns */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  {typeof restaurantId === 'object' && restaurantId?.name && (
                    <span 
                      onClick={(e) => { setShowQuickView(false); handleRestaurantNav(e); }}
                      className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider mb-1 cursor-pointer hover:underline"
                    >
                      {restaurantId.name}
                    </span>
                  )}
                  <h2 className="font-poppins font-black text-slate-900 text-xl leading-snug">{name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <FiStar 
                        key={s} 
                        size={12} 
                        className={s <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{displayRating}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">({reviewCount} customer reviews)</span>
                </div>

                <p className="text-slate-550 text-xs font-medium leading-relaxed">{description}</p>

                {/* Compare Restaurants section if the same dish is sold elsewhere */}
                {alternatives.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
                      Compare Restaurants
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {alternatives.map((altItem) => {
                        const altRest = altItem.restaurantId;
                        const altQty = cartItems[altItem._id] || 0;
                        return (
                          <div 
                            key={altItem._id}
                            className="flex items-center justify-between p-2.5 bg-slate-50/50 hover:bg-emerald-50/10 border border-slate-105 rounded-2xl transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {altRest?.logo ? (
                                <img 
                                  src={`${url}/images/${altRest.logo}`}
                                  className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs"
                                  alt={altRest.name}
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-extrabold uppercase">
                                  {altRest?.name?.charAt(0) || "?"}
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] font-black text-slate-805 leading-none mb-0.5">{altRest?.name || "Other Restaurant"}</p>
                                <p className="text-[9px] font-semibold text-slate-400 leading-none">⏱ {altItem.preparationTime || 20}m</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-805">{formatPrice(altItem.price)}</span>
                              <div>
                                {altQty === 0 ? (
                                  <button
                                    onClick={() => addToCart(altItem._id, altRest?._id)}
                                    className="px-2.5 py-1 bg-emerald-505 hover:bg-emerald-600 text-[9px] uppercase tracking-wider text-white font-extrabold rounded-lg transition-colors"
                                  >
                                    Add
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                                    <button onClick={() => removeFromCart(altItem._id)} className="w-5 h-5 rounded-md bg-slate-55 flex items-center justify-center text-slate-500 font-bold text-[10px]"><FiMinus size={8} /></button>
                                    <span className="text-[10px] font-black text-slate-800">{altQty}</span>
                                    <button onClick={() => addToCart(altItem._id, altRest?._id)} className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]"><FiPlus size={8} /></button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submitting/Cart actions in Modal footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5 block">Price</span>
                  <span className="text-xl font-poppins font-black text-slate-900">{formatPrice(price)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    onClick={(e) => { setShowQuickView(false); handleRestaurantNav(e); }}
                    variant="secondary" 
                    size="sm"
                    className="font-bold rounded-2xl flex items-center gap-1"
                  >
                    Go to Shop <FiArrowRight size={13} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FoodItem;
