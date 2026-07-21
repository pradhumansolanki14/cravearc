/**
 * App-wide constants
 * Single source of truth for values used across multiple files.
 */

// ── API ───────────────────────────────────────────────────────
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ── Routes ───────────────────────────────────────────────────
export const ROUTES = {
  HOME:              '/',
  MENU:              '/menu',
  CART:              '/cart',
  ORDER:             '/order',
  VERIFY:            '/verify',
  ORDER_SUCCESS:     '/order-success',
  MY_ORDERS:         '/myorders',
  PROFILE:           '/profile',
  FAVORITES:         '/favorites',
  SEARCH:            '/search',
  CONTACT:           '/contact',
  RESTAURANTS:       '/restaurants',
  RESTAURANT_DETAIL: '/restaurant/:id',
  FOOD_DETAIL:       '/food/:id',
  ORDER_DETAIL:      '/order/:id',
  NOT_FOUND:         '*',
}

// ── Breakpoints (matches Tailwind defaults) ──────────────────
export const BREAKPOINTS = {
  SM:  640,
  MD:  768,
  LG:  1024,
  XL:  1280,
  XXL: 1536,
}

// ── Design tokens ─────────────────────────────────────────────
export const COLORS = {
  PRIMARY:   '#10b981', // Emerald 500
  SECONDARY: '#22c55e', // Green 500 (Mint)
  ORANGE:    '#f97316', // Existing brand color — kept for compat
  ERROR:     '#f43f5e',
  WARNING:   '#f59e0b',
  SUCCESS:   '#10b981',
  INFO:      '#3b82f6',
}

// ── Delivery & Orders ─────────────────────────────────────────
export const DELIVERY_FEE = 2
export const MIN_ORDER    = 10

// ── Pagination ────────────────────────────────────────────────
export const PAGE_SIZE = 12

// ── Local Storage keys ────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'token',
}
