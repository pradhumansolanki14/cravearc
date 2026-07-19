import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FiBell, FiShoppingBag, FiTag, FiMessageSquare, 
  FiSettings, FiCheck, FiTrash2, FiAlertCircle, FiArrowRight 
} from 'react-icons/fi';
import { useAdmin } from '../../context/AdminContext';
import { toast } from 'react-hot-toast';

const NotificationCenter = () => {
  const { url, adminToken } = useAdmin();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!adminToken) return;
    try {
      const res = await axios.get(`${url}/api/notifications`, { headers: { token: adminToken } });
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
      
      const countRes = await axios.get(`${url}/api/notifications/unread-count`, { headers: { token: adminToken } });
      if (countRes.data.success) {
        setUnreadCount(countRes.data.count || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [adminToken]);

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
      const res = await axios.put(`${url}/api/notifications/${id}/read`, {}, { headers: { token: adminToken } });
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
      const res = await axios.put(`${url}/api/notifications/read-all`, {}, { headers: { token: adminToken } });
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
      const res = await axios.delete(`${url}/api/notifications/${id}`, { headers: { token: adminToken } });
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
      case 'order': return <FiShoppingBag className="text-zinc-650" />;
      case 'announcement': return <FiMessageSquare className="text-zinc-650" />;
      case 'vendor': return <FiAlertCircle className="text-emerald-600" />;
      default: return <FiSettings className="text-zinc-550" />;
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case 'order': return 'bg-zinc-100';
      case 'announcement': return 'bg-zinc-100';
      case 'vendor': return 'bg-emerald-50';
      default: return 'bg-zinc-50';
    }
  };

  if (!adminToken) return null;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View console notifications"
        className={`relative w-8 h-8 rounded-lg border flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
          isOpen
            ? 'bg-zinc-950 text-white border-zinc-950'
            : 'hover:bg-zinc-50 border-zinc-150 text-zinc-500 hover:text-zinc-800'
        }`}
      >
        <FiBell size={14} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-[340px] bg-white rounded-xl shadow-lg border border-zinc-200/60 p-3 z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
            <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wider font-mono">Console Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[260px] overflow-y-auto space-y-1.5 scrollbar-thin pr-0.5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-zinc-400 text-center">
                <FiAlertCircle size={18} className="mb-1 text-zinc-200" />
                <p className="text-[11px] font-semibold text-zinc-500">No events logged</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">Your console mailbox is empty.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`group flex items-start gap-2.5 p-2 rounded-lg border transition-all duration-150 ${
                    n.isRead ? 'bg-white border-zinc-100 hover:bg-zinc-50/50' : 'bg-zinc-50/50 border-zinc-200/80 shadow-3xs hover:bg-zinc-50'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${getBgClass(n.type)}`}>
                    {getIcon(n.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-[11px] leading-snug truncate ${n.isRead ? 'text-zinc-700 font-semibold' : 'text-zinc-950 font-bold'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal mt-0.5 break-words">
                      {n.message}
                    </p>
                    <p className="text-[8px] text-zinc-400 font-mono mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Hover Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n._id)}
                        title="Mark read"
                        className="w-4 h-4 rounded border border-zinc-200 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center shadow-3xs bg-white"
                      >
                        <FiCheck size={10} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(n._id, n.isRead)}
                      title="Dismiss notification"
                      className="w-4 h-4 rounded border border-zinc-200 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center shadow-3xs bg-white"
                    >
                      <FiTrash2 size={9} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
