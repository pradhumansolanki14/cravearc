import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiMapPin, FiTruck, FiCreditCard, FiLock, FiInfo, FiCheck, FiFileText, FiTag, FiX } from "react-icons/fi";
import { StoreContext } from "../../context/StoreContext";
import { Container, Button, Card, Input, Badge } from "../../components/ui";
import useToast from "../../hooks/useToast";

const steps = [
  { num: 1, label: "Delivery", active: true },
  { num: 2, label: "Payment", active: false },
  { num: 3, label: "Confirm", active: false },
];

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, formatPrice } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [data, setData] = useState({
    firstName: "", lastName: "", email: "",
    street: "", city: "", state: "",
    zipcode: "", country: "", phone: "",
    notes: "",
  });

  const fetchProfileAndAddresses = async () => {
    try {
      // 1. Fetch Profile to prefill name, email, phone
      const profRes = await axios.get(`${url}/api/user/profile`, { headers: { token } });
      if (profRes.data.success) {
        const u = profRes.data.data;
        const nameParts = (u.name || "").trim().split(/\s+/);
        const fName = nameParts[0] || "";
        const lName = nameParts.slice(1).join(" ") || "";
        setData(d => ({
          ...d,
          firstName: fName,
          lastName: lName,
          email: u.email || "",
          phone: u.phone || "",
        }));
      }

      // 2. Fetch Saved Addresses
      const addrRes = await axios.get(`${url}/api/user/addresses`, { headers: { token } });
      if (addrRes.data.success && Array.isArray(addrRes.data.data)) {
        setAddresses(addrRes.data.data);
      }
    } catch (err) {
      console.error("Error prefilling checkout:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    } else {
      fetchProfileAndAddresses();
    }
  }, [token]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(d => ({ ...d, [name]: value }));
    // Deselect saved address if they edit the form manually
    if (["street", "city", "state", "zipcode", "country"].includes(name)) {
      setSelectedAddressId(null);
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setData(d => ({
      ...d,
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zipcode: addr.zip || "",
      country: addr.country || "",
    }));
  };

  const query = new URLSearchParams(location.search);
  const checkoutRestaurantId = query.get("restaurantId");

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);   // { discount, code, message }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("express"); // "priority" or "express"

  const cartFoods = food_list.filter(item => {
    const itemRestaurantId = item.restaurantId?._id || item.restaurantId;
    return cartItems[item._id] > 0 && (!checkoutRestaurantId || itemRestaurantId === checkoutRestaurantId);
  });

  const subtotal = cartFoods.reduce((sum, item) => sum + (item.price * cartItems[item._id]), 0);
  const firstItem = cartFoods[0];
  const restaurantDetail = firstItem?.restaurantId && typeof firstItem.restaurantId === 'object' ? firstItem.restaurantId : null;
  const vendorDeliveryFee = restaurantDetail?.deliveryFee !== undefined ? Number(restaurantDetail.deliveryFee) : 2;
  const delivery = deliveryMethod === "priority" ? vendorDeliveryFee : 0;
  
  const discount = coupon ? coupon.discount : 0;
  const total = Math.max(0, subtotal + delivery - discount);

  useEffect(() => {
    if (token) {
      fetchAvailableCoupons();
    }
  }, [token, checkoutRestaurantId]);

  const fetchAvailableCoupons = async () => {
    try {
      const res = await axios.get(`${url}/api/coupons/active` + (checkoutRestaurantId ? `?restaurantId=${checkoutRestaurantId}` : ''), { headers: { token } });
      if (res.data.success) {
        setAvailableCoupons(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching available coupons:", err);
    }
  };

  const applyCoupon = async (codeToApply) => {
    const targetCode = codeToApply || couponCode;
    if (!targetCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCoupon(null);
    try {
      const res = await axios.post(`${url}/api/coupons/validate`, { code: targetCode, cartAmount: subtotal }, { headers: { token } });
      if (res.data.success) {
        setCoupon(res.data);
        setCouponCode(res.data.code);
      } else {
        setCouponError(res.data.message);
      }
    } catch { 
      setCouponError("Failed to validate code"); 
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => { 
    setCoupon(null); 
    setCouponCode(""); 
    setCouponError(""); 
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    const orderItems = [];
    cartFoods.forEach((item) => {
      let itemInfo = { ...item };
      itemInfo["quantity"] = cartItems[item._id];
      orderItems.push(itemInfo);
    });

    const orderData = {
      address: data,
      items: orderItems,
      amount: total,
      restaurantId: checkoutRestaurantId || undefined,
      couponCode: coupon?.code || undefined,
    };

    try {
      // Step 1: Place unpaid draft order
      const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (!response.data.success || !response.data.orderId) {
        toast.error(response.data.message || "Error placing order");
        setLoading(false);
        return;
      }

      const orderId = response.data.orderId;

      // Step 2: Initialize Razorpay order creation on backend
      const paymentRes = await axios.post(url + "/api/payments/create-order", { orderId }, { headers: { token } });
      if (!paymentRes.data.success) {
        toast.error(paymentRes.data.message || "Failed to initialize payment gateway");
        setLoading(false);
        return;
      }

      const { key_id, razorpayOrderId, amount, currency } = paymentRes.data;

      // Step 3: Open Razorpay modal overlay
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "CraveArc",
        description: "Food Delivery Checkout",
        order_id: razorpayOrderId,
        handler: async function (res) {
          setLoading(true);
          try {
            // Step 4: Cryptographically verify transaction signature on backend
            const verifyRes = await axios.post(url + "/api/payments/verify", {
              orderId,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_signature: res.razorpay_signature
            }, { headers: { token } });

            if (verifyRes.data.success) {
              toast.success("Payment verified, order placed successfully");
              navigate("/order-success");
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed");
              setLoading(false);
            }
          } catch (err) {
            console.error("Verification failed:", err);
            toast.error("Error during payment verification");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async function () {
            toast.error("Payment cancelled");
            try {
              await axios.post(url + "/api/payments/failure", { 
                orderId, 
                errorReason: "User dismissed checkout popup" 
              }, { headers: { token } });
            } catch (err) {
              console.error("Failed to log checkout cancellation:", err);
            }
            setLoading(false);
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (failedResponse) {
        const errorDesc = failedResponse.error?.description || "Payment failed";
        toast.error(errorDesc);
        try {
          await axios.post(url + "/api/payments/failure", {
            orderId,
            errorReason: errorDesc
          }, { headers: { token } });
        } catch (err) {
          console.error("Failed to log payment failure reason:", err);
        }
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Page Header & Progress ── */}
      <div className="bg-white border-b border-slate-105">
        <Container className="py-6">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => navigate("/cart")}
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              aria-label="Back to cart"
            >
              <FiArrowLeft size={18} className="text-slate-655" />
            </button>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Checkout</h1>
          </div>

          {/* Stepper Progress bar */}
          <div className="flex items-center gap-0 max-w-lg">
            {steps.map((step, i) => (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step.active 
                      ? 'bg-emerald-500 text-white shadow-emerald' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.num}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    step.active ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-150 mx-4" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Container>
      </div>

      {/* ── Main Form Area ── */}
      <Container className="py-8">
        <form onSubmit={placeOrder} className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column — Saved Addresses & Delivery Inputs */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Saved Addresses Selector */}
            {addresses.length > 0 && (
              <Card variant="default" radius="2xl" padding="md" className="border border-slate-100 shadow-xs bg-white">
                <h3 className="font-poppins font-bold text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                  <FiMapPin className="text-emerald-555" />
                  <span>Choose from Saved Addresses</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50/15' 
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-450 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">
                            {addr.label || "Home"}
                          </span>
                          {isSelected && (
                            <span className="text-emerald-500">
                              <FiCheck size={16} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-750 truncate">{addr.street}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Form Inputs Details */}
            <Card variant="default" radius="2xl" padding="md" className="border border-slate-100 shadow-xs bg-white">
              <h3 className="font-poppins font-bold text-xs uppercase tracking-widest text-slate-500 mb-4.5 flex items-center gap-2">
                <FiMapPin className="text-emerald-500" />
                <span>Delivery Details</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  type="text"
                  name="firstName"
                  onChange={onChangeHandler}
                  value={data.firstName}
                  placeholder="e.g. John"
                />
                <Input
                  label="Last Name"
                  required
                  type="text"
                  name="lastName"
                  onChange={onChangeHandler}
                  value={data.lastName}
                  placeholder="e.g. Doe"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Email Address"
                    required
                    type="email"
                    name="email"
                    onChange={onChangeHandler}
                    value={data.email}
                    placeholder="e.g. john.doe@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    required
                    type="text"
                    name="street"
                    onChange={onChangeHandler}
                    value={data.street}
                    placeholder="e.g. 123 Main St, Apt 4B"
                  />
                </div>
                <Input
                  label="City"
                  required
                  type="text"
                  name="city"
                  onChange={onChangeHandler}
                  value={data.city}
                  placeholder="e.g. New York"
                />
                <Input
                  label="State"
                  required
                  type="text"
                  name="state"
                  onChange={onChangeHandler}
                  value={data.state}
                  placeholder="e.g. NY"
                />
                <Input
                  label="Zip Code"
                  required
                  type="text"
                  name="zipcode"
                  onChange={onChangeHandler}
                  value={data.zipcode}
                  placeholder="e.g. 10001"
                />
                <Input
                  label="Country"
                  required
                  type="text"
                  name="country"
                  onChange={onChangeHandler}
                  value={data.country}
                  placeholder="e.g. United States"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Phone Number"
                    required
                    type="text"
                    name="phone"
                    onChange={onChangeHandler}
                    value={data.phone}
                    placeholder="e.g. +1 (555) 000-0000"
                  />
                </div>

                {/* Delivery Notes / Instructions Textarea */}
                <div className="sm:col-span-2">
                  <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Delivery Instructions / Order Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={data.notes}
                    onChange={onChangeHandler}
                    placeholder="e.g. Leave at front door, ring bell twice, call on arrival..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Delivery Speed / Option block */}
            <Card variant="default" radius="2xl" padding="md" className="border border-slate-100 shadow-xs bg-white">
              <h3 className="font-poppins font-bold text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <FiTruck className="text-emerald-500" />
                <span>Delivery Method</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { 
                    title: "Lightning Fast", 
                    time: "Deliver in 10 mins (Priority)", 
                    price: formatPrice(vendorDeliveryFee), 
                    value: "priority" 
                  },
                  { 
                    title: "Express Courier", 
                    time: "Average 20–30 mins speed", 
                    price: "Free", 
                    value: "express" 
                  },
                ].map((opt, i) => {
                  const isSelected = deliveryMethod === opt.value;
                  return (
                    <div 
                      key={i} 
                      onClick={() => setDeliveryMethod(opt.value)}
                      className={`flex items-center justify-between gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/15' 
                          : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-750">{opt.title}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{opt.time}</p>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-650 flex-shrink-0">
                        {opt.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column — Summary & Checkout actions */}
          <div className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-24 space-y-4 animate-fadeUp">
            {/* Delivery Speed banner */}
            <Card variant="default" radius="2xl" padding="sm" className="border border-emerald-100 bg-emerald-50/20 text-emerald-800 shadow-xs flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <FiTruck size={15} />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wide leading-none">
                  {deliveryMethod === "priority" ? "Priority Delivery" : "Lightning Express"}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                  Estimated delivery time: {deliveryMethod === "priority" ? "under 10 minutes" : "20-30 minutes"}
                </p>
              </div>
            </Card>

            {/* Promo Code & Available Coupons applying card */}
            <Card variant="default" radius="2xl" padding="md" className="border border-slate-100 shadow-sm bg-white">
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FiTag size={14} className="text-emerald-500" /> 
                <span>Offers & Coupons</span>
              </p>
              
              {coupon ? (
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-scaleIn">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{coupon.message}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Code: <span className="font-mono font-bold bg-emerald-100/85 px-1.5 py-0.5 rounded">{coupon.code}</span></p>
                  </div>
                  <button 
                    onClick={removeCoupon} 
                    className="text-emerald-600 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                    aria-label="Remove coupon"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="ENTER PROMO CODE"
                      className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border-2 border-slate-100 focus:border-emerald-450 focus:bg-white rounded-2xl text-xs text-slate-905 font-mono font-bold placeholder-slate-400 outline-none transition-all duration-300"
                    />
                    <Button 
                      onClick={() => applyCoupon()} 
                      disabled={couponLoading || !couponCode.trim()}
                      variant="primary"
                      size="sm"
                      className="font-bold border border-emerald-650 whitespace-nowrap px-4 rounded-xl text-2xs uppercase tracking-wider"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-rose-505 font-bold flex items-center gap-1">Error: {couponError}</p>}
                  
                  {/* Active Coupons List */}
                  {availableCoupons.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Available Coupons</p>
                      <div className="space-y-2.5 max-h-40 overflow-y-auto scrollbar-hide pr-1">
                        {availableCoupons.map((c) => (
                          <div key={c._id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-black text-[10px] rounded-lg tracking-wider mb-1">
                                {c.code}
                              </span>
                              <p className="text-[10px] text-slate-700 font-bold leading-tight">{c.description || `${c.discount}% discount`}</p>
                              {c.minOrder > 0 && (
                                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Min Order: ₹{c.minOrder}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => applyCoupon(c.code)}
                              disabled={subtotal < c.minOrder}
                              className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all ${
                                subtotal < c.minOrder 
                                  ? 'bg-slate-105 text-slate-300 cursor-not-allowed border border-slate-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300'
                              }`}
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card overflow-hidden bg-white">
              <div className="px-6 pt-6 pb-4 border-b border-slate-50">
                <h3 className="font-poppins font-extrabold text-xs uppercase tracking-widest text-slate-900">Summary</h3>
                <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider mt-1">{cartFoods.length} selected items</p>
              </div>

              {/* Items overview scroll */}
              <div className="px-6 py-4 space-y-3.5 max-h-48 overflow-y-auto scrollbar-hide">
                {cartFoods.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-50 border border-slate-100" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-755 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Qty: {cartItems[item._id]}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 flex-shrink-0">
                      {formatPrice(item.price * cartItems[item._id])}
                    </span>
                  </div>
                ))}
              </div>

              {/* pricing details */}
              <div className="px-6 py-4 space-y-3.5 border-t border-slate-50 text-xs">
                <div className="flex justify-between font-bold text-slate-450 uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-455 uppercase tracking-wider">
                  <span>Delivery fee</span>
                  <span className="text-slate-850">{formatPrice(delivery)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-bold uppercase tracking-wider text-emerald-600">
                    <span>Promo Discount ({couponCode})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              {/* CTA payment triggers */}
              <div className="px-6 py-5 bg-slate-50">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-poppins font-extrabold text-xs text-slate-450 uppercase tracking-widest">Checkout Total</span>
                  <span className="font-poppins font-extrabold text-2xl text-emerald-650">{formatPrice(total)}</span>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-emerald-lg h-12.5 text-sm flex items-center justify-center gap-2 rounded-2xl"
                >
                  {loading ? (
                    <>Processing Secure Checkout...</>
                  ) : (
                    <>
                      <FiLock size={15} strokeWidth={2.5} />
                      Pay {formatPrice(total)}
                    </>
                  )}
                </Button>

                {/* secure checkout guarantee */}
                <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400">
                  <FiLock size={12} className="text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center">Secured Razorpay checkout</span>
                </div>
              </div>
            </Card>
          </div>

        </form>
      </Container>
    </div>
  );
};

export default PlaceOrder;
