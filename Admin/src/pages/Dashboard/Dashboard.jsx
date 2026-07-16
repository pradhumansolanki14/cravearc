import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { 
  FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, 
  FiRefreshCw, FiTrendingUp, FiAward, FiPlusCircle, 
  FiList, FiAlertCircle, FiArrowRight, FiActivity, FiUsers 
} from 'react-icons/fi'
import { useAdmin } from '../../context/AdminContext'
import { Card, Badge, Button } from '../../components/ui'

const Sparkline = ({ points = [] }) => {
  if (points.length < 2) return null
  const width = 100
  const height = 30
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = max - min
  
  const coordinatePoints = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width
    const y = height - ((p - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="w-24 h-8 text-emerald-500 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        points={coordinatePoints}
      />
    </svg>
  )
}

const StatMetric = ({ label, value, description, sparkPoints, trend }) => (
  <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-premium space-y-4 hover:border-zinc-300 transition-all duration-200">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      {sparkPoints && <Sparkline points={sparkPoints} />}
    </div>
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900">{value}</span>
        {trend && (
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold text-zinc-400 mt-1 uppercase tracking-wider">{description}</p>
    </div>
  </div>
)

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState(null)
  const [platformStats, setPlatformStats] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { adminRole, formatPrice } = useAdmin()
  const token = localStorage.getItem("adminToken")

  useEffect(() => {
    fetchStats()
    fetchAnnouncements()
  }, [adminRole])

  const fetchAnnouncements = async () => {
    try {
      const role = adminRole === 'superadmin' ? 'superadmin' : 'vendor'
      const res = await axios.get(url + `/api/announcements?role=${role}`)
      if (res.data.success) {
        setAnnouncements(res.data.data || [])
      }
    } catch (e) {
      console.error("Failed to load announcements feed", e)
    }
  }

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
    <div className="max-w-6xl space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white border border-zinc-200/50 rounded-xl animate-pulse"/>)}
      </div>
      <div className="h-80 bg-white border border-zinc-200/50 rounded-xl animate-pulse"/>
    </div>
  )

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto bg-white border border-zinc-200/55 rounded-2xl shadow-premium p-8">
      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4">
        <FiAlertCircle size={20} />
      </div>
      <h2 className="text-sm font-bold text-zinc-800">Connection Failed</h2>
      <p className="text-zinc-400 text-xs font-semibold mt-1 mb-5">There was an issue fetching system dashboard stats from the server logs.</p>
      <button 
        onClick={fetchStats} 
        className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
      >
        <FiRefreshCw size={12} className="animate-spin" />
        <span>Reload telemetry</span>
      </button>
    </div>
  )

  // Dynamic Sparkline & Chart point sets (P3-R4.1)
  const activeStats = adminRole === 'superadmin' ? platformStats : stats;
  const revenuePoints = activeStats?.dailyRevenue?.map(d => d.revenue) || [10, 15, 8, 22, 18, 25, 30];
  const ordersPoints = activeStats?.dailyOrders?.map(d => d.count) || [5, 12, 18, 14, 25, 20, 30];
  const chartData = activeStats?.dailyRevenue || [];
  
  const superadminTrends = platformStats?.trends || { restaurants: "+0%", users: "+0%", orders: "+0%", revenue: "+0%" };
  const vendorTrends = stats?.trends || { revenue: "+0%", orders: "+0%", processing: "Active", delivered: "+0%" };

  return (
    <div className="max-w-6xl space-y-8 animate-fadeUp">
      
      {/* ── Top Header Section ── */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Console Analytics</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">Realtime monitoring platform stats</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold transition-all bg-white"
        >
          <FiRefreshCw size={12} />
          <span>Sync logs</span>
        </button>
      </div>

      {/* Platform Announcements Feed */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div key={ann._id} className="bg-emerald-50/45 border border-emerald-200/60 rounded-xl p-4 flex items-start gap-3 shadow-3xs">
              <span className="w-8 h-8 rounded-lg bg-emerald-100/60 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FiAlertCircle size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900">{ann.title}</p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5 leading-relaxed">{ann.message}</p>
                <p className="text-[8px] text-zinc-400 font-mono mt-1">{new Date(ann.publishedAt || ann.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Key Metrics Grids ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminRole === 'superadmin' && platformStats ? (
          <>
            <StatMetric label="Restaurants" value={platformStats.restaurants} description="Approved accounts" sparkPoints={[1, 2, 2, 3, 3, platformStats.restaurants]} trend={superadminTrends.restaurants} />
            <StatMetric label="Total Customers" value={platformStats.totalUsers} description="Registered users" sparkPoints={[10, 12, 15, 18, 22, platformStats.totalUsers]} trend={superadminTrends.users} />
            <StatMetric label="Platform Orders" value={platformStats.totalOrders} description="Placed logs" sparkPoints={ordersPoints} trend={superadminTrends.orders} />
            <StatMetric label="Total Revenue" value={formatPrice(platformStats.totalRevenue || 0)} description="Gross sales" sparkPoints={revenuePoints} trend={superadminTrends.revenue} />
          </>
        ) : (
          <>
            <StatMetric label="Total Revenue" value={formatPrice(stats.totalRevenue)} description="Gross item sales" sparkPoints={revenuePoints} trend={vendorTrends.revenue} />
            <StatMetric label="Total Orders" value={stats.totalOrders} description="Placed logs" sparkPoints={ordersPoints} trend={vendorTrends.orders} />
            <StatMetric label="Active Kitchen" value={stats.processing} description="Preparing state" sparkPoints={[1, 3, 2, 4, stats.processing]} trend={vendorTrends.processing} />
            <StatMetric label="Completed Delivery" value={stats.delivered} description="Delivered logs" sparkPoints={[5, 10, 8, 12, stats.delivered]} trend={vendorTrends.delivered} />
          </>
        )}
      </div>

      {/* ── Dashboard Content Layout Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left main: Chart section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-zinc-200/60 rounded-xl p-6 shadow-premium space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Weekly Revenue Stream</h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Last 7 days metrics</p>
              </div>
              <FiTrendingUp size={16} className="text-emerald-500" />
            </div>

            {/* Custom chart */}
            <div className="h-56 flex items-end justify-between gap-4 relative pt-4">
              {chartData.map((d, i) => {
                const maxRevenue = Math.max(...chartData.map(item => item.revenue), 1)
                const pct = (d.revenue / maxRevenue) * 100
                const day = new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover detail box */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-150 absolute bottom-full mb-2 bg-zinc-950 text-white text-[9px] font-mono px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none z-35 text-center">
                      <p className="text-zinc-400 uppercase tracking-widest text-[8px] font-bold">
                        {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-emerald-400 font-bold text-xs mt-0.5">{formatPrice(d.revenue)}</p>
                    </div>

                    {/* Vertical Bar */}
                    <div className="w-full bg-zinc-50 border border-zinc-100 group-hover:border-zinc-300 rounded-lg flex items-end overflow-hidden flex-1 transition-all duration-200">
                      <div 
                        className="w-full bg-zinc-950 group-hover:bg-emerald-500 rounded-t-md transition-colors"
                        style={{ height: `${Math.max(5, pct)}%` }}
                      />
                    </div>

                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-3">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Superadmin applications warning bar */}
          {adminRole === 'superadmin' && platformStats?.pendingApprovals > 0 && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiClock className="text-amber-600 animate-pulse" size={16} />
                <div>
                  <p className="text-xs font-bold text-amber-900">{platformStats.pendingApprovals} Restaurant applications pending</p>
                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Please review pending documents to grant console access keys.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/restaurants')}
                className="px-3 py-1.5 bg-amber-650 hover:bg-amber-700 text-white text-2xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Audit Applications
              </button>
            </div>
          )}

          {/* Revenue breakdown by Restaurant */}
          {adminRole === 'superadmin' && platformStats?.restaurantBreakdown?.length > 0 && (
            <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-premium">
              <div className="px-5 py-4 border-b border-zinc-150/45 flex items-center justify-between bg-zinc-50/50">
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Revenue Breakdown</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Approved store platforms</p>
                </div>
                <button onClick={() => navigate('/restaurants')} className="text-2xs font-bold text-zinc-500 hover:text-zinc-800 hover:underline uppercase tracking-wider">Configure</button>
              </div>

              <div className="divide-y divide-zinc-100">
                {platformStats.restaurantBreakdown.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50/40 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-850 truncate">{r.name}</p>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">{r.orderCount} orders completed</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-800">{formatPrice(r.totalRevenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side: Activity feed / Quick links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Selling Dishes list */}
          <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Catalog performance</h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Top culinary dishes</p>
              </div>
              <FiAward size={16} className="text-emerald-500" />
            </div>

            {stats.topItems?.length === 0 ? (
              <p className="text-2xs text-zinc-400 font-semibold text-center py-6">No records registered</p>
            ) : (
              <div className="space-y-3">
                {stats.topItems?.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-800 truncate">{item.name}</p>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">{item.count} orders placed</p>
                    </div>
                    <span className="font-mono font-bold text-zinc-700">{formatPrice(item.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders log */}
          <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-premium">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Recent Orders Feed</h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Realtime kitchen logs</p>
              </div>
              <button 
                onClick={() => navigate('/orders')} 
                className="text-2xs font-bold text-zinc-500 hover:text-zinc-800 hover:underline uppercase tracking-wider"
              >
                View Feed
              </button>
            </div>

            <div className="divide-y divide-zinc-100">
              {stats.recentOrders?.slice(0, 5).map((order, idx) => (
                <div key={idx} className="p-4 hover:bg-zinc-50/40 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-800">
                      {order.address?.firstName} {order.address?.lastName}
                    </p>
                    <span className="text-xs font-mono font-bold text-zinc-900">{formatPrice(order.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-semibold text-zinc-405">
                    <p className="truncate max-w-[120px]">{order.items?.map(i => i.name).join(', ')}</p>
                    <span className={`px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      order.status === 'Delivered' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {adminRole === 'superadmin' ? (
              <>
                <button 
                  onClick={() => navigate('/restaurants')}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all text-zinc-700 shadow-premium"
                >
                  <FiActivity size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Restaurants</span>
                </button>
                <button 
                  onClick={() => navigate('/users')}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all text-zinc-700 shadow-premium"
                >
                  <FiUsers size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Users Directory</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/add')}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all text-zinc-700 shadow-premium"
                >
                  <FiPlusCircle size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Create Dish</span>
                </button>
                <button 
                  onClick={() => navigate('/list')}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all text-zinc-700 shadow-premium"
                >
                  <FiList size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Food Menu</span>
                </button>
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard
