import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiShoppingBag, FiTag, FiMessageSquare, 
  FiSettings, FiCheck, FiTrash2, FiAlertCircle 
} from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import useToast from '../../hooks/useToast';

const NotificationCenter = ({ isHome, scrolled }) => {
  const { url, token } = useContext(StoreContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toast = useToast();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${url}/api/notifications`, { headers: { token } });
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
      
      const countRes = await axios.get(`${url}/api/notifications/unread-count`, { headers: { token } });
      if (countRes.data.success) {
        setUnreadCount(countRes.data.count || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      const res = await axios.put(`${url}/api/notifications/${id}/read`, {}, { headers: { token } });
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      const res = await axios.put(`${url}/api/notifications/read-all`, {}, { headers: { token } });
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark all read");
    }
  };

  const deleteNotif = async (id, isRead) => {
    try {
      const res = await axios.delete(`${url}/api/notifications/${id}`, { headers: { token } });
      if (res.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (!isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <FiShoppingBag className="text-blue-500" />;
      case 'coupon': return <FiTag className="text-emerald-500" />;
      case 'announcement': return <FiMessageSquare className="text-purple-500" />;
      default: return <FiSettings className="text-zinc-500" />;
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-50';
      case 'coupon': return 'bg-emerald-50';
      case 'announcement': return 'bg-purple-50';
      default: return 'bg-zinc-50';
    }
  };

  if (!token) return null;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications menu"
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-450 ${
          isOpen
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/35'
            : !scrolled && isHome
              ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
              : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200 border border-slate-200/60'
        }`}
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-emerald-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2.5 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-[100]"
          >
            {/* Dropdown Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-poppins font-extrabold text-slate-900 tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-emerald-600 hover:underline focus:outline-none"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[280px] overflow-y-auto space-y-1.5 scrollbar-hide pr-0.5">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-350 text-center">
                  <FiAlertCircle size={22} className="mb-2 text-slate-200" />
                  <p className="text-xs font-bold text-slate-500">Inbox Clean</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">You have no active notifications.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = n.isRead || n.readBy?.includes(token); // wait, for broadcast, check custom id check:
                  // Actually since token is mapped in JWT as userId, we can just use decoded userId. 
                  // But wait, the client doesn't have decoded userId directly unless they decode the token. 
                  // A very easy way is: backend returns isRead: true for that specific user in n.isRead dynamically, 
                  // or we can decode token/read it. Wait! In our backend controller n.isRead is computed dynamically or checked?
                  // Ah! In notificationController `getNotifications`, we can return the items with isRead mapped properly:
                  // Let's verify: In getNotifications, did we map it? No, we returned raw documents. 
                  // Let's map it on backend in getNotifications: n.isRead = n.userId ? n.isRead : n.readBy.includes(userId);
                  // That is a brilliant design choice! We will make sure the backend handles the mapping. 
                  // That way, the frontend just reads `n.isRead` directly! Excellent.
                  return (
                    <div 
                      key={n._id} 
                      className={`group flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:bg-slate-50 ${
                        n.isRead ? 'bg-white border-slate-100' : 'bg-slate-50/40 border-slate-200/80 shadow-3xs'
                      }`}
                    >
                      {/* Avatar Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getBgClass(n.type)}`}>
                        {getIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className={`text-xs font-semibold leading-snug truncate ${n.isRead ? 'text-slate-700' : 'text-slate-900 font-bold'}`}>
                            {n.title}
                          </p>
                          {/* Unread Indicator dot */}
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed break-words">
                          {n.message}
                        </p>
                        <p className="text-[8px] text-slate-400 font-bold font-mono uppercase mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={() => markRead(n._id)}
                            title="Mark as read"
                            className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center shadow-3xs focus:outline-none"
                          >
                            <FiCheck size={11} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotif(n._id, n.isRead)}
                          title="Delete notification"
                          className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-550 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center shadow-3xs focus:outline-none"
                        >
                          <FiTrash2 size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
