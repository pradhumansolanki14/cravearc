import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiShoppingBag, FiTag, FiX, FiTrash2, FiChevronRight, FiMinus, FiPlus } from "react-icons/fi";
import { StoreContext } from "../../context/StoreContext";
import { Container, Button, Card, Badge } from "../../components/ui";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const cartFoods = food_list.filter(item => cartItems[item._id] > 0);
  const subtotal = getTotalCartAmount();
  const delivery = subtotal === 0 ? 0 : 2;

  // ─── Coupon state ────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);   // { discount, code, message }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!token) { setCouponError("Sign in to apply a promo code"); return; }
    setCouponLoading(true);
    setCouponError("");
    setCoupon(null);
    try {
      const res = await axios.post(`${url}/api/coupons/validate`, { code: couponCode, cartAmount: subtotal }, { headers: { token } });
      if (res.data.success) {
        setCoupon(res.data);
      } else {
        setCouponError(res.data.message);
      }
    } catch { setCouponError("Failed to validate code"); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setCoupon(null); setCouponCode(""); setCouponError(""); };

  const handleClearAllItem = async (itemId) => {
    const qty = cartItems[itemId] || 0;
    // Call removeFromCart repeatedly to clear the item
    for (let i = 0; i < qty; i++) {
      await removeFromCart(itemId);
    }
  };

  const discount = coupon ? coupon.discount : 0;
  const total = subtotal + delivery - discount;

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
              <div className="flex-1 w-full space-y-4">
                <AnimatePresence>
                  {cartFoods.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card 
                        variant="default"
                        padding="none"
                        radius="2xl"
                        className="border border-slate-100 shadow-xs p-4 group bg-white hover:border-emerald-100/50 hover:shadow-sm transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          {/* Item Image */}
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                            <img src={`${url}/images/${item.image}`} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>

                          {/* Item details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-poppins font-bold text-slate-900 text-base truncate mb-0.5 group-hover:text-emerald-600 transition-colors duration-300">
                              {item.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Gourmet Serving Portion</p>
                            <span className="text-sm font-extrabold text-slate-900">${item.price}</span>
                          </div>

                          {/* Quantity control controller */}
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

                          {/* Item totals / removal triggers */}
                          <div className="flex flex-col items-end justify-between self-stretch pl-2">
                            <span className="font-poppins font-extrabold text-base text-slate-900">
                              ${(item.price * cartItems[item._id]).toFixed(2)}
                            </span>
                            <button 
                              onClick={() => handleClearAllItem(item._id)} 
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100/50"
                              aria-label={`Remove all ${item.name} from cart`}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Promo Code applying card */}
                <Card variant="default" radius="2xl" padding="md" className="border border-slate-100 shadow-sm mt-6">
                  <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FiTag size={14} className="text-emerald-500" /> 
                    <span>Have a promo coupon?</span>
                  </p>
                  {coupon ? (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-scaleIn">
                      <div>
                        <p className="text-sm font-bold text-emerald-800">{coupon.message}</p>
                        <p className="text-2xs text-emerald-600 font-semibold mt-0.5">Code: <span className="font-mono font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded">{coupon.code}</span></p>
                      </div>
                      <button 
                        onClick={removeCoupon} 
                        className="text-emerald-555 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                        aria-label="Remove coupon"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                            onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                            placeholder="ENTER PROMO CODE"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-emerald-450 focus:bg-white rounded-2xl text-sm text-slate-900 font-mono font-bold placeholder-slate-400 outline-none transition-all duration-300"
                          />
                        </div>
                        <Button 
                          onClick={applyCoupon} 
                          disabled={couponLoading || !couponCode.trim()}
                          variant="primary"
                          size="md"
                          className="font-bold border border-emerald-600 whitespace-nowrap px-6 rounded-2xl"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-rose-500 mt-2.5 font-bold flex items-center gap-1">✕ {couponError}</p>}
                    </div>
                  )}
                </Card>
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
                        <span className="font-bold text-slate-900 flex-shrink-0">${(item.price * cartItems[item._id]).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal fee rows */}
                  <div className="px-6 py-4 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-450 uppercase tracking-wider">
                      <span>Subtotal</span>
                      <span className="text-slate-800">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-450 uppercase tracking-wider">
                      <span>Delivery fee</span>
                      <span className={`text-slate-850 ${delivery === 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}
                      </span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-emerald-650 animate-scaleIn">
                        <span>Promo Discount ({coupon.code})</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Grand total & Checkout triggers */}
                  <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-5">
                      <span className="font-poppins font-extrabold text-xs text-slate-450 uppercase tracking-widest">Grand Total</span>
                      <span className="font-poppins font-black text-2xl text-emerald-600">${Math.max(0, total).toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={() => navigate("/order", { state: { couponCode: coupon?.code, discount: discount } })} 
                      variant="primary"
                      size="lg"
                      rightIcon={<FiChevronRight strokeWidth={2.5} />}
                      className="w-full font-bold shadow-emerald-lg h-12.5 rounded-2xl"
                    >
                      Proceed to Checkout
                    </Button>
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
