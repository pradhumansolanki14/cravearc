import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiMapPin, FiTruck, FiCreditCard, FiLock, FiInfo, FiCheck, FiFileText } from "react-icons/fi";
import { StoreContext } from "../../context/StoreContext";
import { Container, Button, Card, Input, Badge } from "../../components/ui";
import useToast from "../../hooks/useToast";

const steps = [
  { num: 1, label: "Delivery", active: true },
  { num: 2, label: "Payment", active: false },
  { num: 3, label: "Confirm", active: false },
];

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
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

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    const orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    const couponCode = location.state?.couponCode || "";
    const discount = location.state?.discount || 0;

    const orderData = {
      address: data,
      items: orderItems,
      amount: Math.max(0, getTotalCartAmount() + 2 - discount),
      couponCode: couponCode || undefined,
    };

    try {
      const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (response.data.success) {
        window.location.replace(response.data.session_url);
      } else {
        toast.error("Error placing order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const cartFoods = food_list.filter(item => cartItems[item._id] > 0);
  const subtotal = getTotalCartAmount();
  const discount = location.state?.discount || 0;
  const couponCode = location.state?.couponCode || "";
  const total = Math.max(0, subtotal + 2 - discount);

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
                  { title: "Express Courier", time: "20–30 mins speed", price: "$2.00", checked: true },
                  { title: "Standard Delivery", time: "45–60 mins speed", price: "Free", checked: false },
                ].map((opt, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      opt.checked 
                        ? 'border-emerald-500 bg-emerald-50/15' 
                        : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-750">{opt.title}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{opt.time}</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600">
                      {opt.price}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column — Summary & Checkout actions */}
          <div className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-24 space-y-4">
            {/* Delivery Speed banner */}
            <Card variant="default" radius="2xl" padding="sm" className="border border-emerald-100 bg-emerald-50/20 text-emerald-800 shadow-xs flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <FiTruck size={15} />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wide leading-none">⚡ Lightning Express</p>
                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Estimated delivery time: 20-30 minutes</p>
              </div>
            </Card>

            <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-card overflow-hidden bg-white">
              <div className="px-6 pt-6 pb-4 border-b border-slate-50">
                <h3 className="font-poppins font-extrabold text-xs uppercase tracking-widest text-slate-900">Summary</h3>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-1">{cartFoods.length} selected items</p>
              </div>

              {/* Items overview scroll */}
              <div className="px-6 py-4 space-y-3.5 max-h-48 overflow-y-auto scrollbar-hide">
                {cartFoods.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img 
                      src={`${url}/images/${item.image}`} 
                      alt={item.name} 
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-50 border border-slate-100" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-755 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Qty: {cartItems[item._id]}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 flex-shrink-0">
                      ${(item.price * cartItems[item._id]).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* pricing details */}
              <div className="px-6 py-4 space-y-3.5 border-t border-slate-50 text-xs">
                <div className="flex justify-between font-bold text-slate-450 uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-455 uppercase tracking-wider">
                  <span>Delivery fee</span>
                  <span className="text-slate-850">$2.00</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-bold uppercase tracking-wider text-emerald-600">
                    <span>Promo Discount ({couponCode})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* CTA payment triggers */}
              <div className="px-6 py-5 bg-slate-50">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-poppins font-extrabold text-xs text-slate-450 uppercase tracking-widest">Checkout Total</span>
                  <span className="font-poppins font-extrabold text-2xl text-emerald-650">${total.toFixed(2)}</span>
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
                      Pay ${total.toFixed(2)}
                    </>
                  )}
                </Button>

                {/* secure checkout guarantee */}
                <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400">
                  <FiLock size={12} className="text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center">Secured Stripe checkout</span>
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
