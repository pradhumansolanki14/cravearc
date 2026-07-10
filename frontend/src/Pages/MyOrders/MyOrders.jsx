import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiShoppingBag, FiTruck, FiCheckCircle, FiClock, FiRefreshCw, FiEye } from "react-icons/fi";
import { StoreContext } from "../../context/StoreContext";
import { Container, Button, Card, Badge, Skeleton } from "../../components/ui";

const statusConfig = {
  "Food Processing": { 
    badge: "primary", 
    icon: <FiClock size={16} />, 
    barClass: "bg-emerald-450 w-1/3" 
  },
  "Out for Delivery": { 
    badge: "secondary", 
    icon: <FiTruck size={16} />, 
    barClass: "bg-emerald-500 w-2/3" 
  },
  "Delivered": { 
    badge: "success", 
    icon: <FiCheckCircle size={16} />, 
    barClass: "bg-emerald-600 w-full" 
  },
};

const MyOrders = () => {
  const { url, token, SetCartItems, formatPrice } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const getStatus = (status) => statusConfig[status] || {
    badge: "neutral",
    icon: <FiShoppingBag size={16} />,
    barClass: "bg-slate-400 w-0"
  };

  const handleOrderAgain = async (order) => {
    const newCart = {};
    order.items.forEach(item => { if (item._id) newCart[item._id] = item.quantity || 1 });
    SetCartItems(prev => ({ ...prev, ...newCart }));
    try {
      for (const item of order.items) {
        if (item._id) {
          for (let i = 0; i < (item.quantity || 1); i++) {
            await axios.post(url + '/api/cart/add', { itemId: item._id }, { headers: { token } });
          }
        }
      }
    } catch { /* silent — local state already updated */ }
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100">
        <Container className="py-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-100"
              aria-label="Go back"
            >
              <FiArrowLeft size={18} className="text-slate-650" />
            </button>
            <div>
              <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Order History</h1>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">{data.length} total order{data.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Listing Container ── */}
      <Container className="py-8">
        {loading ? (
          <div className="space-y-4 max-w-3xl">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          /* Empty orders state */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-slate-100 rounded-3xl shadow-card p-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5">
              <FiShoppingBag size={28} />
            </div>
            <h2 className="font-poppins font-bold text-slate-800 text-lg mb-2">No orders placed</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Looks like you haven&apos;t ordered any delicious food yet.</p>
            <Button 
              onClick={() => navigate("/")} 
              variant="primary" 
              size="lg"
              className="font-bold shadow-emerald-lg w-full"
            >
              Order Food Now
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {data.map((order, index) => {
              const s = getStatus(order.status);
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-card transition-all duration-300 overflow-hidden group animate-fadeUp"
                >
                  {/* Status Progress indicator stripe */}
                  <div className="h-1.5 w-full bg-slate-100">
                    <div className={`h-full transition-all duration-500 rounded-full ${s.barClass}`} />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      
                      {/* Left icon wrapper */}
                      <div className="w-14 h-14 rounded-2xl bg-emerald-55 border border-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        {s.icon}
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-700 leading-relaxed line-clamp-2 max-w-md">
                              {order.items.map((item, i) => (
                                <span key={i}>{item.name} ×{item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
                              ))}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''} · {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <p className="font-poppins font-extrabold text-xl text-slate-900 flex-shrink-0">
                            {formatPrice(order.amount)}
                          </p>
                        </div>

                        {/* Interactive triggers */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
                          {/* Badge */}
                          <Badge variant={s.badge} size="md" rounded="md" className="font-bold border-0 px-3 py-1 bg-slate-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1" />
                            {order.status}
                          </Badge>

                          {/* Details page link */}
                          <Button
                            onClick={() => navigate(`/order/${order._id}`)}
                            variant="outline"
                            size="sm"
                            leftIcon={<FiEye size={12} />}
                            className="h-8 text-2xs font-bold uppercase tracking-wider border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xl"
                          >
                            Details
                          </Button>

                          {/* Refresh button */}
                          <Button
                            onClick={fetchOrders}
                            variant="outline"
                            size="sm"
                            leftIcon={<FiRefreshCw size={12} />}
                            className="h-8 text-2xs font-bold uppercase tracking-wider border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xl"
                          >
                            Refresh
                          </Button>

                          {/* Order Again button */}
                          {order.status === "Delivered" && (
                            <Button
                              onClick={() => handleOrderAgain(order)}
                              variant="primary"
                              size="sm"
                              leftIcon={<FiRefreshCw size={12} />}
                              className="h-8 text-2xs font-bold uppercase tracking-wider shadow-emerald rounded-xl ml-auto sm:ml-0"
                            >
                              Order Again
                            </Button>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};

export default MyOrders;
