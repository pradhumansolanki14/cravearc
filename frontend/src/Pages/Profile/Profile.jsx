import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiLock, FiShoppingBag, FiMapPin, FiLogOut, FiPlus, FiTrash2, FiInfo, FiPlusCircle, FiChevronRight, FiMap } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Container, Button, Card, Input } from '../../components/ui';
import useToast from '../../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { url, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [msg, setMsg] = useState({ type: '', text: '' });

  // ─── Password Change state ──────────────────────────────────
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // ─── Addresses State ────────────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', street: '', city: '', state: '', zip: '', country: ''
  });
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchProfile();
    fetchAddresses();
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(url + '/api/user/profile', { headers: { token } });
      if (res.data.success) {
        setProfile({ name: res.data.data.name, email: res.data.data.email, phone: res.data.data.phone || '' });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.put(url + '/api/user/profile', { name: profile.name, phone: profile.phone }, { headers: { token } });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        toast.success("Profile details updated.");
      } else {
        setMsg({ type: 'error', text: res.data.message });
        toast.error(res.data.message);
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to update profile' });
      toast.error("Failed to update profile.");
    }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (pwData.newPassword.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    setPwSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.post(url + '/api/user/change-password', { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }, { headers: { token } });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Password changed successfully!' });
        toast.success("Password updated successfully.");
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMsg({ type: 'error', text: res.data.message });
        toast.error(res.data.message);
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to change password' });
      toast.error("Password modification failed.");
    }
    setPwSaving(false);
  };

  // ─── Addresses Actions ─────────────────────────────────────
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await axios.get(url + '/api/user/addresses', { headers: { token } });
      if (res.data.success && Array.isArray(res.data.data)) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
    setAddressesLoading(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      const res = await axios.post(url + '/api/user/addresses', newAddress, { headers: { token } });
      if (res.data.success) {
        toast.success("Saved new delivery address.");
        setNewAddress({ label: '', street: '', city: '', state: '', zip: '', country: '' });
        setShowAddressForm(false);
        fetchAddresses();
      } else {
        toast.error(res.data.message || "Failed to add address.");
      }
    } catch {
      toast.error("Error saving address details.");
    }
    setAddressSaving(false);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await axios.delete(`${url}/api/user/addresses/${addressId}`, { headers: { token } });
      if (res.data.success) {
        toast.success("Deleted address card.");
        fetchAddresses();
      } else {
        toast.error("Could not delete address.");
      }
    } catch {
      toast.error("Error deleting address.");
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    toast.success("Logged out successfully.");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-105">
        <Container className="py-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              aria-label="Back"
            >
              <FiUser size={18} className="text-slate-655" />
            </button>
            <div>
              <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">My Account</h1>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">Manage your profile, passwords, and addresses</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        {loading ? (
          <div className="space-y-4 max-w-3xl">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
            
            {/* Sidebar Layout */}
            <div className="space-y-4">
              
              {/* Profile Card */}
              <Card variant="default" radius="2xl" padding="md" className="border border-slate-100 shadow-xs text-center bg-white">
                <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-poppins font-extrabold text-xl mx-auto mb-3.5 shadow-sm">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <p className="font-poppins font-bold text-slate-900 text-sm leading-tight truncate">{profile.name}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1 truncate">{profile.email}</p>
              </Card>

              {/* Navigation Tabs List */}
              <Card variant="default" radius="2xl" padding="none" className="border border-slate-100 shadow-xs p-2 space-y-1 bg-white">
                {[
                  { key: 'profile', label: 'Profile Info', icon: <FiUser size={15} /> },
                  { key: 'addresses', label: 'Saved Addresses', icon: <FiMapPin size={15} /> },
                  { key: 'password', label: 'Change Password', icon: <FiLock size={15} /> },
                  { key: 'orders', label: 'My Orders', icon: <FiShoppingBag size={15} />, action: () => navigate('/myorders') },
                ].map(tab => (
                  <button 
                    key={tab.key}
                    onClick={() => tab.action ? tab.action() : setActiveTab(tab.key)}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      activeTab === tab.key && !tab.action 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="flex-1 text-left">{tab.label}</span>
                    {!tab.action && activeTab === tab.key && (
                      <FiChevronRight size={13} strokeWidth={2.5} />
                    )}
                  </button>
                ))}
                
                <hr className="border-slate-100 my-2" />
                
                <button 
                  onClick={logout} 
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-all duration-300"
                >
                  <FiLogOut size={15} /> 
                  <span className="text-left">Sign Out</span>
                </button>
              </Card>
            </div>

            {/* Main Tabs Panel Content */}
            <div className="w-full max-w-2xl">
              
              {/* Tab Feedback Alerts */}
              {msg.text && (
                <div className={`mb-5 px-4.5 py-3.5 rounded-2xl text-xs font-bold animate-fadeUp ${
                  msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {msg.text}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* ── Profile Details Form tab ── */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <FiUser className="text-emerald-600" size={18} />
                        </div>
                        <div>
                          <h2 className="font-poppins font-bold text-base text-slate-900 leading-tight">Profile Information</h2>
                          <p className="text-xs text-slate-400">Update your name and primary contact number.</p>
                        </div>
                      </div>
                      
                      <form onSubmit={saveProfile} className="space-y-4.5">
                        <Input
                          label="Full Name"
                          required
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                          placeholder="Your Full Name"
                        />
                        <div>
                          <Input
                            label="Email Address"
                            type="email"
                            disabled
                            value={profile.email}
                            placeholder="email@example.com"
                            inputClass="opacity-60 cursor-not-allowed"
                          />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 ml-1">Email cannot be modified</p>
                        </div>
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={profile.phone}
                          onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+1 (555) 000-0000"
                        />
                        <Button 
                          type="submit" 
                          disabled={saving}
                          variant="primary"
                          size="lg"
                          className="w-full font-bold shadow-emerald-lg h-12.5 rounded-2xl"
                        >
                          {saving ? 'Saving changes...' : 'Save Details'}
                        </Button>
                      </form>
                    </Card>
                  </motion.div>
                )}

                {/* ── Saved Addresses Manager tab ── */}
                {activeTab === 'addresses' && (
                  <motion.div
                    key="addresses"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
                      <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <FiMapPin className="text-emerald-600" size={18} />
                          </div>
                          <div>
                            <h2 className="font-poppins font-bold text-base text-slate-900 leading-tight">Saved Addresses</h2>
                            <p className="text-xs text-slate-400">Manage your saved delivery destinations.</p>
                          </div>
                        </div>
                        
                        {!showAddressForm && (
                          <Button
                            onClick={() => setShowAddressForm(true)}
                            variant="secondary"
                            size="sm"
                            leftIcon={<FiPlus />}
                            className="font-bold border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl"
                          >
                            Add Address
                          </Button>
                        )}
                      </div>

                      {/* Address creation form */}
                      {showAddressForm && (
                        <form onSubmit={handleAddAddress} className="mb-8 p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4 animate-scaleIn">
                          <h3 className="font-poppins font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">New Address Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="Address Label (e.g. Home, Office)"
                              required
                              type="text"
                              name="label"
                              value={newAddress.label}
                              onChange={handleAddressInputChange}
                              placeholder="Home"
                            />
                            <Input
                              label="Street Address"
                              required
                              type="text"
                              name="street"
                              value={newAddress.street}
                              onChange={handleAddressInputChange}
                              placeholder="123 Main St, Apt 4B"
                            />
                            <Input
                              label="City"
                              required
                              type="text"
                              name="city"
                              value={newAddress.city}
                              onChange={handleAddressInputChange}
                              placeholder="New York"
                            />
                            <Input
                              label="State"
                              required
                              type="text"
                              name="state"
                              value={newAddress.state}
                              onChange={handleAddressInputChange}
                              placeholder="NY"
                            />
                            <Input
                              label="Zip Code"
                              required
                              type="text"
                              name="zip"
                              value={newAddress.zip}
                              onChange={handleAddressInputChange}
                              placeholder="10001"
                            />
                            <Input
                              label="Country"
                              required
                              type="text"
                              name="country"
                              value={newAddress.country}
                              onChange={handleAddressInputChange}
                              placeholder="United States"
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button 
                              type="button" 
                              onClick={() => setShowAddressForm(false)} 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 font-bold rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={addressSaving} 
                              variant="primary" 
                              size="sm" 
                              className="flex-1 font-bold shadow-emerald-lg rounded-xl"
                            >
                              {addressSaving ? 'Saving...' : 'Save Address'}
                            </Button>
                          </div>
                        </form>
                      )}

                      {/* saved addresses display grid */}
                      {addressesLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                          <FiMap className="mx-auto text-slate-200 mb-3" size={32} />
                          <p className="font-bold text-slate-705 text-sm mb-1">No saved addresses</p>
                          <p className="text-xs text-slate-400">Save your addresses here to speed up checking out.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {addresses.map((addr) => (
                            <div 
                              key={addr._id}
                              className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between h-36 hover:border-emerald-100/50 hover:shadow-xs transition-all duration-300"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded text-slate-500">
                                    {addr.label || "Home"}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-slate-750 truncate">{addr.street}</p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                  {addr.city}, {addr.state} {addr.zip}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="self-end text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 p-1.5 rounded-lg border border-rose-100/50 transition-all duration-300 flex items-center justify-center text-xs"
                                aria-label="Delete address"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {/* ── Change Password tab ── */}
                {activeTab === 'password' && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-card bg-white">
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <FiLock className="text-slate-655" size={18} />
                        </div>
                        <div>
                          <h2 className="font-poppins font-bold text-base text-slate-900 leading-tight">Change Password</h2>
                          <p className="text-xs text-slate-400">Keep your account secure with regular updates.</p>
                        </div>
                      </div>

                      <form onSubmit={changePassword} className="space-y-4">
                        <Input
                          label="Current Password"
                          required
                          type="password"
                          value={pwData.currentPassword}
                          onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
                          placeholder="••••••••"
                        />
                        <Input
                          label="New Password"
                          required
                          type="password"
                          value={pwData.newPassword}
                          onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                          placeholder="Minimum 8 characters"
                        />
                        <Input
                          label="Confirm New Password"
                          required
                          type="password"
                          value={pwData.confirmPassword}
                          onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                          placeholder="Repeat new password"
                        />
                        <Button 
                          type="submit" 
                          disabled={pwSaving}
                          variant="primary"
                          size="lg"
                          className="w-full font-bold shadow-emerald-lg h-12.5 rounded-2xl"
                        >
                          {pwSaving ? 'Updating password...' : 'Update Password'}
                        </Button>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Profile;
