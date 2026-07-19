import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const AUTO_SLIDE_INTERVAL = 4500; // ms

/**
 * BannerCarousel
 *
 * Fetches GET /api/banners (public, sorted by `order` ascending from backend).
 * Auto-slides every 4.5 s. Manual prev/next + dot navigation.
 * Clicking a banner with restaurantId navigates to /restaurant/:restaurantId.
 * Renders nothing when the banners array is empty.
 *
 * Requirements: 24.1, 24.2, 24.3, 24.4
 */
const BannerCarousel = () => {
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState({});
  const timerRef = useRef(null);

  // ─── Fetch ───────────────────────────────────────────────
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${url}/api/banners`);
        if (res.data.success && Array.isArray(res.data.data)) {
          setBanners(res.data.data); // already sorted by order from backend
        }
      } catch {
        // Fail silently — component simply won't render (Req 24.4)
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [url]);

  // ─── Auto-slide ──────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, AUTO_SLIDE_INTERVAL);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length > 1) startTimer();
    return () => clearInterval(timerRef.current);
  }, [banners.length, startTimer]);

  // ─── Navigation ─────────────────────────────────────────
  const goTo = (idx) => {
    setCurrent(idx);
    if (banners.length > 1) startTimer(); // reset timer on manual nav
  };
  const prev = () => goTo((current - 1 + banners.length) % banners.length);
  const next = () => goTo((current + 1) % banners.length);

  // ─── Click handler ───────────────────────────────────────
  const handleBannerClick = (banner) => {
    if (banner.restaurantId) {
      const dest = typeof banner.restaurantId === 'object' ? (banner.restaurantId.slug || banner.restaurantId._id) : banner.restaurantId;
      navigate(`/restaurant/${dest}`);
    }
  };

  // Render nothing while loading or when array is empty (Req 24.4)
  if (loading || banners.length === 0) return null;

  const displayBanners = [];
  if (banners.length > 0) {
    displayBanners.push(banners[current]);
    if (banners.length > 1) {
      displayBanners.push(banners[(current + 1) % banners.length]);
    }
  }

  return (
    <div className="w-full relative select-none">
      <div className={`grid grid-cols-1 ${banners.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
        {displayBanners.map((banner) => {
          const imgSrc = banner.image;
          const hasImgError = imgErrors[banner._id];

          return (
            <div
              key={banner._id}
              onClick={() => handleBannerClick(banner)}
              className={`group relative w-full h-44 sm:h-52 md:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-900 transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                banner.restaurantId ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Image */}
              {!hasImgError ? (
                <img
                  src={imgSrc}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  onError={() => setImgErrors(prev => ({ ...prev, [banner._id]: true }))}
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />

              {/* Text content */}
              <div className="absolute inset-0 p-5 sm:p-6 lg:p-8 flex flex-col justify-end">
                <div className="max-w-md">
                  {banner.title && (
                    <h3 className="font-poppins font-bold text-white text-base sm:text-lg lg:text-xl leading-tight mb-1 drop-shadow-sm">
                      {banner.title}
                    </h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-white/85 text-2xs sm:text-xs lg:text-sm font-semibold leading-relaxed drop-shadow-sm line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.restaurantId && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-xs border border-white/20 rounded-xl text-white text-3xs sm:text-2xs font-extrabold uppercase tracking-wider transition-all group-hover:bg-white/25">
                      Order Now
                      <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next navigation arrows on the sides of the grid */}
      {banners.length > 2 && (
        <div className="hidden lg:block">
          <button
            onClick={prev}
            aria-label="Previous banners"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-25 w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-650 hover:text-emerald-600 hover:border-emerald-300 shadow-sm flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={next}
            aria-label="Next banners"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-25 w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-655 hover:text-emerald-600 hover:border-emerald-300 shadow-sm flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Dots underneath the grid for indicators */}
      {banners.length > 2 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to set ${i + 1}`}
              className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${
                i === current
                  ? 'w-5 bg-emerald-600'
                  : 'w-1.5 bg-slate-200 hover:bg-slate-350'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
