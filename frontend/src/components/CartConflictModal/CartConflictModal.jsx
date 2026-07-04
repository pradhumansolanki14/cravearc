import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

/**
 * CartConflictModal
 *
 * Shown when the customer tries to add a food item from a different
 * restaurant than the one currently in their cart.
 *
 * Two actions:
 *  - Cancel  → discard the pending item, keep current cart
 *  - Replace → clear current cart and start a new one from the new restaurant
 */
const CartConflictModal = () => {
  const {
    showCartConflictModal,
    pendingCartItem,
    confirmCartSwitch,
    cancelCartSwitch,
    food_list,
    cartRestaurantId,
  } = useContext(StoreContext);

  if (!showCartConflictModal) return null;

  // Derive the pending item name for the message (nice-to-have, not required)
  const pendingFood = pendingCartItem
    ? food_list.find(f => f._id === pendingCartItem.itemId)
    : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && cancelCartSwitch()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-conflict-title"
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Top orange accent strip */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }} />

        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          {/* Title */}
          <h2
            id="cart-conflict-title"
            className="text-xl font-bold text-slate-900 text-center mb-2"
          >
            Start a new cart?
          </h2>

          {/* Description */}
          <p className="text-slate-500 text-sm text-center leading-relaxed mb-6">
            Your cart already has items from another restaurant.
            {pendingFood && (
              <>
                {' '}Adding{' '}
                <span className="font-semibold text-slate-700">{pendingFood.name}</span>
                {' '}will clear your current cart.
              </>
            )}
            {!pendingFood && ' Adding this item will clear your current cart.'}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cancel — keep existing cart */}
            <button
              onClick={cancelCartSwitch}
              className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              Keep current cart
            </button>

            {/* Confirm — clear and start fresh */}
            <button
              onClick={confirmCartSwitch}
              className="flex-1 py-3.5 px-4 text-white font-bold rounded-2xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 15px -3px rgba(249,115,22,0.4)' }}
            >
              Replace cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartConflictModal;
