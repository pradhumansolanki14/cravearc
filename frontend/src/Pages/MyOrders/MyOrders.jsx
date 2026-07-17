import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiShoppingBag, FiTruck, FiCheckCircle, FiClock, FiRefreshCw, FiEye } from "react-icons/fi";
import { StoreContext } from "../../context/StoreContext";
import { Container, Button, Card, Badge, Skeleton } from "../../components/ui";
import useToast from "../../hooks/useToast";

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

  // Refund states
  const toast = useToast();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [refundType, setRefundType] = useState("FULL");
  const [refundAmountVal, setRefundAmountVal] = useState("");
  const [reason, setReason] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [refundsMap, setRefundsMap] = useState({});

  const getRefundBadge = (order) => {
    const refund = refundsMap[order._id];
    const status = refund?.status || order.refundStatus || "NONE";

    switch (status) {
      case "REQUESTED":
        return { variant: "warning", text: "Refund Requested" };
      case "UNDER_REVIEW":
        return { variant: "warning", text: "Refund Under Review" };
      case "APPROVED":
        return { variant: "success", text: "Refund Approved" };
      case "PROCESSING":
        return { variant: "primary", text: "Refund Processing" };
      case "COMPLETED":
        return { variant: "success", text: `Refund Completed: ${formatPrice(order.refundAmount || refund?.approvedAmount)}` };
      case "FAILED":
        return { variant: "danger", text: "Refund Failed (Retry Available)" };
      case "REJECTED":
        return { variant: "danger", text: "Refund Rejected (Retry Available)" };
      default:
        if (order.refundStatus === "REFUNDED") {
          return { variant: "success", text: `Refunded: ${formatPrice(order.refundAmount)}` };
        } else if (order.refundStatus === "PARTIAL") {
          return { variant: "secondary", text: `Partial Refunded: ${formatPrice(order.refundAmount)}` };
        }
        return null;
    }
  };

  const canRequestRefund = (order) => {
    if (!order.payment) return false;

    const refund = refundsMap[order._id];
    const status = refund?.status || order.refundStatus || "NONE";

    if (["REQUESTED", "UNDER_REVIEW", "APPROVED", "PROCESSING", "COMPLETED"].includes(status)) {
      return false;
    }

    if (order.refundStatus === "REFUNDED") {
      return false;
    }

    const remainingRefundable = order.amount - (order.refundAmount || 0);
    if (remainingRefundable <= 0) {
      return false;
    }

    return true;
  };

  const handleRequestRefundSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        orderId: selectedOrderForRefund._id,
        refundType,
        requestedAmount: refundType === "FULL" ? selectedOrderForRefund.amount - (selectedOrderForRefund.refundAmount || 0) : parseFloat(refundAmountVal),
        reason,
        customerMessage
      };

      const response = await axios.post(url + "/api/refunds/request", payload, { headers: { token } });
      if (response.data.success) {
        toast.success("Refund request submitted successfully!");
        setShowRefundModal(false);
        fetchOrders();
      } else {
        toast.error(response.data.message || "Failed to submit refund request");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting request");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, refundsRes] = await Promise.all([
        axios.post(url + "/api/order/userorders", {}, { headers: { token } }),
        axios.get(url + "/api/refunds/my", { headers: { token } })
      ]);
      if (ordersRes.data.success) {
        setData(ordersRes.data.data);
      }
      if (refundsRes.data.success) {
        const map = {};
        const sortedRefunds = [...refundsRes.data.data].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.requestedAt || 0);
          const dateB = new Date(b.createdAt || b.requestedAt || 0);
          return dateB - dateA;
        });
        sortedRefunds.forEach(r => {
          const ordId = r.orderId?._id || r.orderId;
          if (!map[ordId]) {
            map[ordId] = r;
          }
        });
        setRefundsMap(map);
      }
    } catch (err) {
      console.error("Error loading orders/refunds:", err);
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

                          {(() => {
                            const badgeInfo = getRefundBadge(order);
                            if (!badgeInfo) return null;
                            return (
                              <Badge 
                                variant={badgeInfo.variant} 
                                size="md" 
                                rounded="md" 
                                className="font-bold border-0 px-3 py-1 ml-2 bg-slate-100 text-rose-600"
                              >
                                {badgeInfo.text}
                              </Badge>
                            );
                          })()}

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

                          {/* Request Refund button */}
                          {canRequestRefund(order) && (
                            <Button
                              onClick={() => {
                                setSelectedOrderForRefund(order);
                                setRefundType("FULL");
                                setRefundAmountVal(String(order.amount - (order.refundAmount || 0)));
                                setReason("");
                                setCustomerMessage("");
                                setShowRefundModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="h-8 text-2xs font-bold uppercase tracking-wider border-rose-250 hover:bg-rose-50 text-rose-600 rounded-xl"
                            >
                              Request Refund
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

      {showRefundModal && selectedOrderForRefund && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 animate-fadeIn p-4">
          <form onSubmit={handleRequestRefundSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="font-poppins font-extrabold text-base text-slate-800 tracking-tight">Request Order Refund</h3>
              <button 
                type="button" 
                onClick={() => setShowRefundModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Refund Method</label>
              <select
                value={refundType}
                onChange={(e) => {
                  setRefundType(e.target.value);
                  if (e.target.value === "FULL") {
                    setRefundAmountVal(String(selectedOrderForRefund.amount - (selectedOrderForRefund.refundAmount || 0)));
                  } else {
                    setRefundAmountVal("");
                  }
                }}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:border-slate-350"
              >
                <option value="FULL">Full Refund</option>
                <option value="PARTIAL">Partial Refund</option>
              </select>
            </div>

            {refundType === "PARTIAL" && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Partial Refund Amount (Max: {formatPrice(selectedOrderForRefund.amount - (selectedOrderForRefund.refundAmount || 0))})</label>
                <input
                  type="number"
                  step="any"
                  required
                  max={selectedOrderForRefund.amount - (selectedOrderForRefund.refundAmount || 0)}
                  value={refundAmountVal}
                  onChange={(e) => setRefundAmountVal(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-150 rounded-xl focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason Category *</label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-150 rounded-xl focus:outline-none"
              >
                <option value="">Select a reason</option>
                <option value="Items Missing">Items Missing</option>
                <option value="Poor Quality">Poor Food Quality</option>
                <option value="Late Delivery">Very Late Delivery</option>
                <option value="Wrong Items Delivered">Wrong Items Delivered</option>
                <option value="Other">Other (Describe below)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Message / Details</label>
              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Detail the issue to support approval..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-150 rounded-xl focus:outline-none h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-2xs">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 font-bold rounded-xl transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 bg-rose-650 hover:bg-rose-750 text-white font-bold rounded-xl transition-all uppercase tracking-wider shadow-sm"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
