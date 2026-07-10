import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiFileText, FiClock, FiTruck, FiCheckCircle, FiRefreshCw, FiMapPin, FiCreditCard, FiLock, FiInfo } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Container, Button, Card, Badge } from '../../components/ui';

const statusSteps = [
  { key: 'placed',     label: 'Order Placed',    icon: <FiFileText size={18} /> },
  { key: 'processing', label: 'Preparing',       icon: <FiClock size={18} /> },
  { key: 'delivery',   label: 'On the Way',      icon: <FiTruck size={18} /> },
  { key: 'delivered',  label: 'Delivered',       icon: <FiCheckCircle size={18} /> },
];

const getStepIndex = (status) => {
  if (status === 'Food Processing') return 1;
  if (status === 'Out for Delivery') return 2;
  if (status === 'Delivered') return 3;
  return 0;
};

const OrderDetail = () => {
  const { id } = useParams();
  const { url, token, food_list, SetCartItems, formatPrice } = useContext(StoreContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchOrder();
  }, [id, token]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/order/${id}`, { headers: { token } });
      if (res.data.success) {
        const orderData = res.data.data;
        setOrder(orderData);
        
        // Find restaurant info from order items
        const firstItem = orderData.items?.[0];
        const rId = firstItem?.restaurantId || orderData.restaurantId;
        if (rId) {
          try {
            const restRes = await axios.get(`${url}/api/food/restaurants/${rId}`);
            if (restRes.data.success) {
              setRestaurant(restRes.data.data.restaurant);
            }
          } catch (err) {
            console.error("Error fetching order restaurant details:", err);
          }
        }
      } else {
        navigate('/myorders');
      }
    } catch { 
      navigate('/myorders'); 
    }
    setLoading(false);
  };

  const handleOrderAgain = async () => {
    if (!order) return;
    setReordering(true);
    // Re-add all items to cart
    const newCart = {};
    order.items.forEach(item => { if (item._id) newCart[item._id] = item.quantity || 1; });
    SetCartItems(prev => ({ ...prev, ...newCart }));
    // Sync with backend if token
    try {
      for (const item of order.items) {
        if (item._id) {
          for (let i = 0; i < (item.quantity || 1); i++) {
            await axios.post(url + '/api/cart/add', { itemId: item._id }, { headers: { token } });
          }
        }
      }
    } catch { /* silently add locally */ }
    setReordering(false);
    navigate('/cart');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
    </div>
  );

  if (!order) return null;

  const stepIndex = getStepIndex(order.status);
  const date = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-105">
        <Container className="py-8">
          <div className="flex items-center gap-3 mb-1">
            <button 
              onClick={() => navigate('/myorders')} 
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              aria-label="Back to order history"
            >
              <FiArrowLeft size={18} className="text-slate-655" />
            </button>
            <div>
              <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Order Details</h1>
              <p className="text-slate-400 text-xs font-mono font-bold uppercase mt-0.5">ID: #{id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 max-w-4xl space-y-6">
        
        {/* Status Tracker card */}
        <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="font-poppins font-extrabold text-xs uppercase tracking-widest text-slate-500">Order Progress Timeline</h2>
            <span className="text-xs font-semibold text-slate-400">{date}</span>
          </div>

          <div className="flex items-start gap-0 relative">
            {statusSteps.map((step, i) => {
              const done = i <= stepIndex;
              const active = i === stepIndex;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  
                  {/* Progress connector lines */}
                  {i < statusSteps.length - 1 && (
                    <div 
                      className={`absolute top-5.5 h-1 rounded-full transition-all duration-700 ${
                        done && i < stepIndex ? 'bg-emerald-500' : 'bg-slate-100'
                      }`} 
                      style={{ width: '100%', left: '50%' }} 
                    />
                  )}

                  {/* Icon Circle with Active Pulse highlight */}
                  <div className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    done 
                      ? 'bg-emerald-500 text-white scale-110 shadow-emerald' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {active && (
                      <span className="absolute inset-0 rounded-2xl bg-emerald-500/30 animate-ping -z-10" />
                    )}
                    {step.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center mt-3.5 leading-tight px-1 ${
                    active ? 'text-emerald-600 font-extrabold' : done ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Details breakdown cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* List items card (Left column) */}
          <div className="md:col-span-7 space-y-6">
            <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
              <h2 className="font-poppins font-extrabold text-xs uppercase tracking-widest text-slate-500 mb-6 pb-2.5 border-b border-slate-50">
                Purchased Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, i) => {
                  const foodData = food_list.find(f => f._id === item._id);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        {foodData ? (
                          <img src={`${url}/images/${foodData.image}`} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">🍽️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity || 1} · {formatPrice(item.price)}</p>
                      </div>
                      <p className="font-poppins font-extrabold text-slate-900 text-sm flex-shrink-0">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal fee listings */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between font-bold text-slate-450 uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-slate-800">{formatPrice(order.amount - 2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-455 uppercase tracking-wider">
                  <span>Delivery fee</span>
                  <span className="text-slate-800">{formatPrice(2)}</span>
                </div>
                <div className="flex justify-between font-poppins font-extrabold text-base text-slate-900 border-t border-slate-100 pt-3.5">
                  <span>Total Amount</span>
                  <span className="text-emerald-600">{formatPrice(order.amount)}</span>
                </div>
              </div>

              {/* Reorder card action */}
              <Button
                onClick={handleOrderAgain}
                disabled={reordering}
                variant="primary"
                size="lg"
                leftIcon={<FiRefreshCw size={14} />}
                className="mt-6 w-full font-bold shadow-emerald h-11.5 rounded-2xl"
              >
                {reordering ? 'Adding items to cart...' : 'Order Again'}
              </Button>
            </Card>

            {/* Render Delivery notes if present in order address */}
            {order.address?.notes && (
              <Card variant="default" radius="2xl" padding="md" className="border border-slate-100 shadow-sm bg-white">
                <h3 className="font-poppins font-extrabold text-[10px] uppercase tracking-widest text-slate-450 mb-2 flex items-center gap-1.5">
                  <FiInfo className="text-emerald-500" size={13} />
                  <span>Delivery Instructions</span>
                </h3>
                <p className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-relaxed">
                  {order.address.notes}
                </p>
              </Card>
            )}
          </div>

          {/* Delivery, Restaurant & Payment details (Right column) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Restaurant Information Card (New Premium Section) */}
            {restaurant && (
              <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card bg-white overflow-hidden">
                <div className="h-20 bg-slate-100 relative">
                  {restaurant.coverImage && (
                    <img 
                      src={`${url}/images/${restaurant.coverImage}`} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-950/20" />
                </div>
                <div className="p-5 flex gap-3 relative mt-[-24px] z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-md overflow-hidden flex-shrink-0">
                    <img src={`${url}/images/${restaurant.logo}`} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-6 min-w-0">
                    <h3 className="font-poppins font-bold text-slate-900 text-sm truncate">{restaurant.name}</h3>
                    <p className="text-[10px] text-slate-450 font-bold truncate mt-0.5">{restaurant.cuisine}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Delivery address details */}
            <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
              <h2 className="font-poppins font-extrabold text-xs uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
                <FiMapPin className="text-emerald-500" />
                <span>Delivery Destination</span>
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100/30">
                  <FiMapPin className="text-emerald-650" size={16} />
                </div>
                <div>
                  <p className="font-poppins font-bold text-slate-900 text-sm">{order.address.firstName} {order.address.lastName}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">{order.address.street}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{order.address.country}</p>
                  <p className="text-xs font-bold text-slate-700 mt-2">{order.address.phone}</p>
                </div>
              </div>
            </Card>

            {/* Payment security info */}
            <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
              <h2 className="font-poppins font-extrabold text-xs uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
                <FiCreditCard className="text-emerald-500" />
                <span>Payment Settlement</span>
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100/30">
                  <FiLock className="text-emerald-600" size={16} />
                </div>
                <div>
                  <p className="font-poppins font-bold text-slate-905 text-sm">Stripe Payment Gateway</p>
                  <div className="mt-1.5">
                    <Badge variant={order.payment ? 'success' : 'warning'} size="sm" rounded="md" className="font-bold">
                      {order.payment ? 'Payment Confirmed' : 'Payment Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default OrderDetail;
