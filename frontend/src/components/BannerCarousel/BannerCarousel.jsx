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

  const active = banners[current];

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 select-none" aria-label="Promotional banners">
      {/* Slide track */}
      <div className="relative w-full" style={{ paddingBottom: 'clamp(220px, 32vw, 420px)' }}>
        {banners.map((banner, i) => {
          const isActive = i === current;
          const imgSrc = `${url}/images/${banner.image}`;
          const hasImgError = imgErrors[banner._id];

          return (
            <div
              key={banner._id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              } ${banner.restaurantId ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => isActive && handleBannerClick(banner)}
            >
              {/* Image */}
              {!hasImgError ? (
                <img
                  src={imgSrc}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgErrors(prev => ({ ...prev, [banner._id]: true }))}
                  draggable={false}
                />
              ) : (
                // Fallback gradient when image fails to load
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
              )}

              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

              {/* Text content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
                <div className="max-w-xl">
                  {banner.title && (
                    <h2 className="font-bold text-white text-xl sm:text-2xl lg:text-3xl leading-tight mb-1 drop-shadow-sm">
                      {banner.title}
                    </h2>
                  )}
                  {banner.subtitle && (
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed drop-shadow-sm">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.restaurantId && (
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white text-xs font-semibold transition-all hover:bg-white/30">
                      View Restaurant
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next arrows — only show when >1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default BannerCarousel;
