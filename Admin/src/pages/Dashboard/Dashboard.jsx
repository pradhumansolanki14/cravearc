import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiRefreshCw, FiTrendingUp, FiAward, FiPlusCircle, FiList, FiAlertCircle } from 'react-icons/fi'
import { useAdmin } from '../../context/AdminContext'
import { Card, Badge, Button, Spinner } from '../../components/ui'

const StatCard = ({ icon, label, value, sub, variant = 'primary' }) => (
  <Card variant="default" radius="2xl" padding="md" className="border border-slate-100/80 shadow-sm animate-fadeUp flex flex-col justify-between h-32 relative overflow-hidden group">
    {/* Decorative blur backdrop */}
    <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-emerald-500/5 group-hover:scale-125 transition-transform duration-505" />
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
        variant === 'success' 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
          : variant === 'warning' 
            ? 'bg-amber-50 border-amber-100 text-amber-600' 
            : variant === 'blue' 
              ? 'bg-blue-50 border-blue-100 text-blue-600'
              : 'bg-slate-50 border-slate-100 text-slate-500'
      }`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="font-poppins font-extrabold text-2xl text-slate-905 tracking-tight">{value}</p>
      {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sub}</p>}
    </div>
  </Card>
)

const MiniBar = ({ value, max }) => (
  <div className="flex items-center gap-3 flex-1">
    <div className="flex-1 h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}/>
    </div>
    <span className="text-xs font-bold text-slate-700 w-12 text-right">${value.toFixed(0)}</span>
  </div>
)

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState(null)
  const [platformStats, setPlatformStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { adminRole } = useAdmin()
  const token = localStorage.getItem("adminToken")

  useEffect(() => {
    fetchStats()
  }, [adminRole])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await axios.get(url + '/api/order/stats', { headers: { token } })
      if (res.data.success) setStats(res.data.data)
      if (adminRole === 'superadmin') {
        const pRes = await axios.get(url + '/api/admin/platform-stats', { headers: { token } })
        if (pRes.data.success) setPlatformStats(pRes.data.data)
      }
    } catch (e) { 
      console.error(e) 
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="max-w-5xl animate-fadeUp">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-3xl border border-slate-100 animate-pulse"/>)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[1,2].map(i => <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse"/>)}
      </div>
    </div>
  )

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-slate-100 rounded-3xl shadow-card p-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-550 mb-5 border border-rose-100/50">
        <FiAlertCircle size={24} />
      </div>
      <h2 className="font-poppins font-bold text-slate-800 text-base mb-1">Could not load stats</h2>
      <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">There was an issue fetching dashboard analytics.</p>
      <Button 
        onClick={fetchStats} 
        variant="primary" 
        size="sm"
        leftIcon={<FiRefreshCw size={12} />}
        className="font-bold shadow-emerald w-full"
      >
        Retry Reloading
      </Button>
    </div>
  )

  const maxRevenue = Math.max(...stats.dailyRevenue.map(d => d.revenue), 1)

  return (
    <div className="max-w-5xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-405 text-xs font-semibold mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button 
          onClick={fetchStats} 
          variant="outline" 
          size="sm"
          leftIcon={<FiRefreshCw size={12} />}
          className="font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
        >
          Refresh
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adminRole === 'superadmin' && platformStats ? (
          <>
            <StatCard icon={<FiList size={16} />} label="Restaurants" value={platformStats.restaurants} sub="Approved accounts" variant="blue" />
            <StatCard icon={<FiShoppingBag size={16} />} label="Total Customers" value={platformStats.totalUsers} sub="Registered users" variant="primary" />
            <StatCard icon={<FiShoppingBag size={16} />} label="Platform Orders" value={platformStats.totalOrders} sub="Total placed" variant="warning" />
            <StatCard icon={<FiDollarSign size={16} />} label="Total Revenue" value={`$${(platformStats.totalRevenue || 0).toFixed(0)}`} sub="All time sales" variant="success" />
          </>
        ) : (
          <>
            <StatCard icon={<FiShoppingBag size={16} />} label="Total Orders" value={stats.totalOrders} sub="Completed & active" variant="blue" />
            <StatCard icon={<FiDollarSign size={16} />} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} sub="Net item sales" variant="success" />
            <StatCard icon={<FiClock size={16} />} label="In Kitchen" value={stats.processing} sub="Active preparing" variant="warning" />
            <StatCard icon={<FiCheckCircle size={16} />} label="Delivered" value={stats.delivered} sub="Completed orders" variant="primary" />
          </>
        )}
      </div>

      {/* ── Platform approvals notification (Platform admin only) ── */}
      {adminRole === 'superadmin' && platformStats?.pendingApprovals > 0 && (
        <Card variant="default" radius="2xl" padding="md" className="bg-amber-50/50 border border-amber-200/60 p-4 flex items-center justify-between animate-fadeUp">
          <div className="flex items-center gap-3">
            <FiClock size={20} className="text-amber-500 animate-pulse" />
            <div>
              <p className="font-bold text-amber-800 text-sm">{platformStats.pendingApprovals} restaurant{platformStats.pendingApprovals !== 1 ? 's' : ''} pending approval</p>
              <p className="text-xs text-amber-600 font-semibold mt-0.5">Please review pending applications to verify vendors.</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/restaurants')} 
            variant="primary" 
            size="xs"
            className="font-bold bg-amber-550 border-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm"
          >
            Review Applications
          </Button>
        </Card>
      )}

      {/* ── Revenue Graph & Top Selling grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Revenue chart bar */}
        <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
            <div>
              <h3 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider">Weekly Revenue</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Daily breakdown (7 days)</p>
            </div>
            <FiTrendingUp size={18} className="text-emerald-500" />
          </div>
          
          <div className="space-y-4">
            {stats.dailyRevenue.map((d, i) => {
              const day = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-24 flex-shrink-0">{day}</span>
                  <MiniBar value={d.revenue} max={maxRevenue} />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top selling list card */}
        <Card variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
            <div>
              <h3 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider">Top Selling Dishes</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Most ordered menu items</p>
            </div>
            <FiAward size={18} className="text-emerald-500" />
          </div>

          {stats.topItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <FiAward size={28} className="text-slate-300 mb-3" />
              <p className="text-xs font-bold text-slate-500">No order data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
                    i === 0 
                      ? 'bg-amber-400' 
                      : i === 1 
                        ? 'bg-slate-400' 
                        : i === 2 
                          ? 'bg-amber-700' 
                          : 'bg-slate-205 text-slate-600'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.count} orders · ${item.revenue.toFixed(0)} revenue</p>
                  </div>
                  <div className="w-16 h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${(item.count / stats.topItems[0].count) * 100}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      {/* ── Recent Orders ── */}
      <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider">Recent Orders</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Last 5 orders placed</p>
          </div>
          <button 
            onClick={() => navigate('/orders')} 
            className="text-xs font-bold text-emerald-650 hover:underline uppercase tracking-wider"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-440">
              <FiShoppingBag className="text-slate-300 mb-3" size={28} />
              <p className="text-xs font-bold text-slate-600">No active orders yet</p>
            </div>
          ) : stats.recentOrders.map((order, i) => {
            const statusVariants = {
              'Food Processing': 'warning',
              'Out for Delivery': 'blue',
              'Delivered': 'success',
            }
            return (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <FiShoppingBag size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {order.address?.firstName} {order.address?.lastName}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                    {order.items?.map(item => item.name).join(', ')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-slate-900">${order.amount}</p>
                  <div className="mt-1">
                    <Badge variant={statusVariants[order.status] || 'neutral'} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* ── Platform-wide details breakdown (Platform admin only) ── */}
      {adminRole === 'superadmin' && platformStats?.restaurantBreakdown?.length > 0 && (
        <Card variant="default" radius="3xl" padding="none" className="border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-poppins font-bold text-slate-805 text-sm uppercase tracking-wider">Revenue by Restaurant</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">All active platforms performance</p>
            </div>
            <button onClick={() => navigate('/restaurants')} className="text-xs font-bold text-emerald-650 hover:underline uppercase tracking-wider">Manage</button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {platformStats.restaurantBreakdown.slice(0, 8).map((r, i) => {
              const maxRev = platformStats.restaurantBreakdown[0]?.totalRevenue || 1;
              return (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <span className="w-6 text-[10px] font-extrabold text-slate-400 text-center">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{r.name}</p>
                    <div className="h-2 bg-slate-50 border border-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(r.totalRevenue / maxRev) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-900">${r.totalRevenue.toFixed(0)}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{r.orderCount} orders</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Quick Actions buttons strip ── */}
      <div className="grid grid-cols-3 gap-4">
        {adminRole === 'superadmin' ? [
          { label: 'Restaurants', icon: <FiList size={18} />, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600', action: () => navigate('/restaurants') },
          { label: 'Categories', icon: <FiPlusCircle size={18} />, color: 'bg-gradient-to-r from-blue-500 to-blue-600', action: () => navigate('/categories') },
          { label: 'All Orders', icon: <FiShoppingBag size={18} />, color: 'bg-gradient-to-r from-slate-800 to-slate-900', action: () => navigate('/orders') },
        ].map((a, i) => (
          <button key={i} onClick={a.action} className={`${a.color} text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm`}>
            {a.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{a.label}</span>
          </button>
        )) : [
          { label: 'Add Dish', icon: <FiPlusCircle size={18} />, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald', action: () => navigate('/add') },
          { label: 'View Menu', icon: <FiList size={18} />, color: 'bg-gradient-to-r from-blue-500 to-blue-650', action: () => navigate('/list') },
          { label: 'All Orders', icon: <FiShoppingBag size={18} />, color: 'bg-gradient-to-r from-slate-800 to-slate-900', action: () => navigate('/orders') },
        ].map((a, i) => (
          <button key={i} onClick={a.action} className={`${a.color} text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm`}>
            {a.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">{a.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}

export default Dashboard
