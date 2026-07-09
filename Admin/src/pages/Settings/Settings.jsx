import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSettings, FiCheck, FiInfo, FiTruck, FiDollarSign, FiClock, FiMail, FiPhone, FiMapPin, FiHome } from "react-icons/fi";
import { Card, Badge, Button, Input, Select } from "../../components/ui";

import { BRAND } from "../../constants/brand";

const Settings = ({ url }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const adminToken = localStorage.getItem("adminToken");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/settings`);
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch {
      toast.error("Failed to load settings");
    }
    setLoading(false);
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${url}/api/settings`, settings, { headers: { token: adminToken } });
      if (res.data.success) { 
        toast.success("Platform settings saved successfully!"); 
        setSettings(res.data.data); 
      } else {
        toast.error(res.data.message);
      }
    } catch { 
      toast.error("Failed to save settings"); 
    }
    setSaving(false);
  };

  useEffect(() => { 
    fetchSettings(); 
  }, []);

  if (loading) return (
    <div className="max-w-3xl space-y-5 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-2xl w-48" />
      {[1, 2].map(i => <div key={i} className="h-44 bg-slate-100 rounded-3xl" />)}
    </div>
  );

  return (
    <div className="max-w-3xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <FiSettings size={18} />
        </div>
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-405 text-xs font-semibold">Manage your restaurant storefront defaults</p>
        </div>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        
        {/* Restaurant Info */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50 flex items-center gap-2">
            <FiHome className="text-slate-400" /> Restaurant Information
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Input 
              label="Restaurant Name"
              value={settings.restaurantName || ""} 
              onChange={e => setSettings(s => ({ ...s, restaurantName: e.target.value }))} 
              placeholder={BRAND.NAME} 
            />
            <Input 
              label="Phone Number"
              leftIcon={<FiPhone size={14} />}
              value={settings.phone || ""} 
              onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} 
              placeholder="+1 (555) 000-0000" 
            />
            <Input 
              label="Email Address"
              type="email"
              leftIcon={<FiMail size={14} />}
              value={settings.email || ""} 
              onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} 
              placeholder={`contact@${BRAND.NAME.toLowerCase()}.com`} 
            />
            <Input 
              label="Opening Hours"
              leftIcon={<FiClock size={14} />}
              value={settings.openingHours || ""} 
              onChange={e => setSettings(s => ({ ...s, openingHours: e.target.value }))} 
              placeholder="9:00 AM - 11:00 PM" 
            />
            <div className="sm:col-span-2">
              <Input 
                label="Street Address"
                leftIcon={<FiMapPin size={14} />}
                value={settings.address || ""} 
                onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} 
                placeholder="123 Food Street, New York, NY" 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">About Us Description</label>
              <textarea 
                value={settings.aboutUs || ""} 
                onChange={e => setSettings(s => ({ ...s, aboutUs: e.target.value }))} 
                rows={3} 
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-emerald-450 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 resize-none font-medium"
                placeholder="Describe your kitchen storefront..." 
              />
            </div>
          </div>
        </Card>

        {/* Delivery Settings */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50 flex items-center gap-2">
            <FiTruck className="text-slate-400" /> Delivery Settings
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <Input 
              label="Delivery Fee ($)"
              type="number" 
              min="0" 
              step="0.5" 
              leftIcon={<FiDollarSign size={13} />}
              value={settings.deliveryFee ?? ""} 
              onChange={e => setSettings(s => ({ ...s, deliveryFee: parseFloat(e.target.value) }))} 
              placeholder="2" 
            />
            
            <Input 
              label="Min Order ($)"
              type="number" 
              min="0" 
              leftIcon={<FiDollarSign size={13} />}
              value={settings.minOrder ?? ""} 
              onChange={e => setSettings(s => ({ ...s, minOrder: parseFloat(e.target.value) }))} 
              placeholder="0" 
            />
            
            <Select 
              label="Platform Currency"
              value={settings.currency || "USD"} 
              onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </Select>
          </div>
        </Card>

        {/* Status settings */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50 flex items-center gap-2">
            🔆 Platform Storefront Status
          </h2>
          
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150/45 rounded-2xl">
            <div>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">Restaurant Storefront Open</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Toggle storefront closure during holiday or maintenance</p>
            </div>
            
            <button
              type="button"
              onClick={() => setSettings(s => ({ ...s, isOpen: !s.isOpen }))}
              className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                settings.isOpen 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                  : "bg-rose-50 border-rose-205 text-rose-600 hover:bg-rose-100"
              }`}
            >
              <div className={`relative w-8 h-4 rounded-full transition-colors ${settings.isOpen ? "bg-emerald-500" : "bg-slate-350"}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${settings.isOpen ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </div>
              <span>{settings.isOpen ? "Open" : "Closed"}</span>
            </button>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
            settings.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-emerald-450 animate-pulse' : 'bg-rose-450'}`} />
            <span>{settings.isOpen ? 'Platform restaurants are open for orders' : 'Platform restaurants are closed for maintenance'}</span>
          </div>
        </Card>

        {/* Submit */}
        <Button 
          type="submit" 
          disabled={saving}
          variant="primary"
          size="lg"
          className="w-full font-bold shadow-emerald-lg h-12.5"
          leftIcon={<FiCheck />}
        >
          {saving ? "Saving Configurations..." : "Save Storefront Configurations"}
        </Button>
      </form>
    </div>
  );
};

export default Settings;
