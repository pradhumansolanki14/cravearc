import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiShoppingBag, FiTag, FiX, FiTrash2, FiChevronRight, FiMinus, FiPlus } from "react-icons/fi";
import { StoreContext } from "../../context/StoreContext";
import { Container, Button, Card, Badge } from "../../components/ui";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, url, token, formatPrice } = useContext(StoreContext);
  const navigate = useNavigate();
  const cartFoods = food_list.filter(item => cartItems[item._id] > 0);

  const groupedCart = {};
  cartFoods.forEach((item) => {
    const rId = item.restaurantId?._id || item.restaurantId || "other";
    const rName = item.restaurantId?.name || "Gourmet Partner";
    const rLogo = item.restaurantId?.logo || "";
    if (!groupedCart[rId]) {
      groupedCart[rId] = {
        id: rId,
        name: rName,
        logo: rLogo,
        items: []
      };
    }
    groupedCart[rId].items.push(item);
  });
  const groups = Object.values(groupedCart);
  const hasMultipleRestaurants = groups.length > 1;

  const subtotal = getTotalCartAmount();
  const delivery = subtotal === 0 ? 0 : (hasMultipleRestaurants ? 0 : (groups[0]?.items[0]?.restaurantId?.deliveryFee ?? 2));

  const handleClearAllItem = async (itemId) => {
    const qty = cartItems[itemId] || 0;
    // Call removeFromCart repeatedly to clear the item
    for (let i = 0; i < qty; i++) {
      await removeFromCart(itemId);
    }
  };

  const total = subtotal + delivery;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-105">
        <Container className="py-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              aria-label="Go back"
            >
              <FiArrowLeft size={18} className="text-slate-655" />
            </button>
            <div>
              <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Your Cart</h1>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                {cartFoods.length === 0 ? "No items added" : `${cartFoods.length} selected item${cartFoods.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main Content Area ── */}
      <Container className="py-8">
        <AnimatePresence mode="wait">
          {cartFoods.length === 0 ? (
            /* Premium Empty State */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-slate-100 rounded-3xl shadow-card p-8"
            >
              <div className="w-18 h-18 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 shadow-xs animate-pulse">
                <FiShoppingBag size={30} />
              </div>
              <h2 className="font-poppins font-bold text-slate-900 text-lg mb-2">Your cart is empty</h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">Looks like you haven&apos;t added any delicious items to your order yet.</p>
              <Button 
                onClick={() => navigate("/")} 
                variant="primary" 
                size="lg"
                className="font-bold shadow-emerald-lg w-full rounded-2xl py-3.5"
              >
                Explore Restaurants
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col lg:flex-row gap-8 items-start"
            >
              
              {/* Cart Items List */}
              <div className="flex-1 w-full space-y-6">
                <AnimatePresence>
                  {groups.map((group) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card 
                        variant="default"
                        padding="none"
                        radius="2xl"
                        className="border border-slate-100 shadow-xs p-5 bg-white space-y-4"
                      >
                        {/* Restaurant Section Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                          <div className="flex items-center gap-3">
                            {group.logo ? (
                              <img 
                                src={`${url}/images/${group.logo}`} 
                                alt="logo" 
                                className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-xs flex-shrink-0" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <FiShoppingBag size={16} />
                              </div>
                            )}
                            <div>
                              <h2 className="font-poppins font-extrabold text-sm text-slate-800 uppercase tracking-widest">{group.name}</h2>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{group.items.length} items from this kitchen</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/order?restaurantId=${group.id}`)}
                            variant="primary"
                            size="sm"
                            className="font-bold rounded-xl px-4 text-[10px] uppercase tracking-widest shadow-emerald h-8"
                          >
                            Checkout Section
                          </Button>
                        </div>

                        {/* Items in this group */}
                        <div className="divide-y divide-slate-50">
                          {group.items.map((item) => (
                            <div key={item._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 group">
                              {/* Item Image */}
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                                <img src={`${url}/images/${item.image}`} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              </div>

                              {/* Item details */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-poppins font-bold text-slate-900 text-sm sm:text-base truncate mb-0.5 group-hover:text-emerald-600 transition-colors duration-300">
                                  {item.name}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Gourmet Serving Portion</p>
                                <span className="text-sm font-extrabold text-slate-850">{formatPrice(item.price)}</span>
                              </div>

                              {/* Quantity control */}
                              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1 shadow-sm">
                                <button
                                  onClick={() => removeFromCart(item._id)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-500 hover:border-rose-100 border border-transparent transition-all font-bold"
                                  aria-label="Decrease quantity"
                                >
                                  <FiMinus size={11} strokeWidth={2.5} />
                                </button>
                                <span className="w-5 text-center text-xs font-extrabold text-slate-800">
                                  {cartItems[item._id]}
                                </span>
                                <button
                                  onClick={() => addToCart(item._id)}
                                  className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors font-bold shadow-sm"
                                  aria-label="Increase quantity"
                                >
                                  <FiPlus size={11} strokeWidth={2.5} />
                                </button>
                              </div>

                              {/* Item totals / removal */}
                              <div className="flex flex-col items-end justify-between self-stretch pl-2">
                                <span className="font-poppins font-extrabold text-sm sm:text-base text-slate-900">
                                  {formatPrice(item.price * cartItems[item._id])}
                                </span>
                                <button 
                                  onClick={() => handleClearAllItem(item._id)} 
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100/50"
                                  aria-label={`Remove all ${item.name} from cart`}
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary details card */}
              <div className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-24">
                <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card overflow-hidden bg-white">
                  <div className="px-6 py-5 border-b border-slate-50">
                    <h3 className="font-poppins font-extrabold text-sm uppercase tracking-widest text-slate-900">Order Summary</h3>
                  </div>
                  
                  {/* List items overview */}
                  <div className="px-6 py-4 border-b border-slate-50 space-y-3 max-h-52 overflow-y-auto scrollbar-hide">
                    {cartFoods.map((item) => (
                      <div key={item._id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="neutral" size="sm" rounded="md" className="font-bold bg-slate-100 text-slate-700 px-2 py-0.5 border-0">
                            {cartItems[item._id]}x
                          </Badge>
                          <span className="text-slate-650 font-semibold truncate">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 flex-shrink-0">{formatPrice(item.price * cartItems[item._id])}</span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal fee rows */}
                  <div className="px-6 py-4 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-455 uppercase tracking-wider">
                      <span>Subtotal</span>
                      <span className="text-slate-800">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-455 uppercase tracking-wider">
                      <span>Delivery fee</span>
                      <span className={`text-slate-850 ${delivery === 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {hasMultipleRestaurants ? "Sectional" : (delivery === 0 ? 'FREE' : formatPrice(delivery))}
                      </span>
                    </div>
                  </div>

                  {/* Grand total & Checkout triggers */}
                  <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-5">
                      <span className="font-poppins font-extrabold text-xs text-slate-455 uppercase tracking-widest">Grand Total</span>
                      <span className="font-poppins font-black text-2xl text-emerald-600">{formatPrice(Math.max(0, total))}</span>
                    </div>
                    {hasMultipleRestaurants ? (
                      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-xs space-y-2">
                        <p className="font-extrabold text-amber-800 uppercase tracking-wider">Mixed Kitchens Cart</p>
                        <p className="text-slate-500 leading-relaxed font-semibold">Your cart contains items from multiple restaurants. Please checkout each restaurant section individually using the buttons in the list.</p>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => navigate(`/order?restaurantId=${groups[0]?.id}`)} 
                        variant="primary"
                        size="lg"
                        rightIcon={<FiChevronRight strokeWidth={2.5} />}
                        className="w-full font-bold shadow-emerald-lg h-12.5 rounded-2xl"
                      >
                        Proceed to Checkout
                      </Button>
                    )}
                    <button 
                      onClick={() => navigate("/")} 
                      className="w-full mt-3.5 py-1 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider text-[10px] transition-colors"
                    >
                      ← Continue Shopping
                    </button>
                  </div>
                </Card>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
};

export default Cart;
