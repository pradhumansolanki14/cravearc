import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { FiX, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementsFeed = () => {
  const { url } = useContext(StoreContext);
  const [announcements, setAnnouncements] = useState([]);
  const [closedIds, setClosedIds] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${url}/api/announcements?role=customer`);
        if (res.data.success) {
          setAnnouncements(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };
    fetchAnnouncements();
  }, [url]);

  const dismiss = (id) => {
    setClosedIds(prev => [...prev, id]);
  };

  const activeAnnouncements = announcements.filter(a => !closedIds.includes(a._id));

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="bg-emerald-50/40 border-b border-emerald-100/50 py-3.5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 space-y-2">
        <AnimatePresence>
          {activeAnnouncements.map((ann) => (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start justify-between gap-3 bg-white border border-emerald-100/80 rounded-2xl p-4 shadow-3xs"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <FiInfo size={15} />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{ann.message}</p>
                </div>
              </div>
              <button
                onClick={() => dismiss(ann._id)}
                className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Dismiss announcement"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnnouncementsFeed;
