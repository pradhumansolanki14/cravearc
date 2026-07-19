import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAdmin } from '../../context/AdminContext';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSend, 
  FiMessageSquare, FiUsers, FiShoppingBag, FiInfo 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AnnouncementsPage = () => {
  const { url, adminToken } = useAdmin();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'all'
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/announcements/all`);
      if (res.data.success) {
        setAnnouncements(res.data.data || []);
      }
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [adminToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error("Please fill all fields");

    try {
      if (editingId) {
        // Update
        const res = await api.put(`/api/announcements/${editingId}`, form);
        if (res.data.success) {
          toast.success("Announcement updated");
          setEditingId(null);
        }
      } else {
        // Create
        const res = await api.post(`/api/announcements`, form);
        if (res.data.success) {
          toast.success("Announcement created as draft");
        }
      }
      setForm({ title: '', message: '', targetRole: 'all' });
      fetchAnnouncements();
    } catch {
      toast.error("Error saving announcement");
    }
  };

  const startEdit = (ann) => {
    setEditingId(ann._id);
    setForm({
      title: ann.title,
      message: ann.message,
      targetRole: ann.targetRole
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await api.delete(`/api/announcements/${id}`);
      if (res.data.success) {
        toast.success("Announcement deleted");
        fetchAnnouncements();
      }
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await api.post(`/api/announcements/${id}/publish`, {});
      if (res.data.success) {
        toast.success("Announcement published and broadcasted!");
        fetchAnnouncements();
      }
    } catch {
      toast.error("Failed to publish announcement");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-poppins font-extrabold text-zinc-900 tracking-tight">Platform Announcements</h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">Create, manage, and broadcast platform updates to customers and restaurant partners.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create / Edit Form */}
        <div className="lg:col-span-1 bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs h-fit space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2 flex items-center gap-2">
            <FiPlus className="text-emerald-500" />
            {editingId ? 'Edit Announcement' : 'Compose Broadcast'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Target Audience</label>
              <select
                value={form.targetRole}
                onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 bg-[#fafafa] rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-450 focus:bg-white"
              >
                <option value="all">All (Users & Merchants)</option>
                <option value="customer">Customers Only</option>
                <option value="vendor">Merchants Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                placeholder="Important maintenance update..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 bg-[#fafafa] rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-450 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Message Content</label>
              <textarea
                placeholder="Write your broadcast message here..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-zinc-200 bg-[#fafafa] rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-450 focus:bg-white resize-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {editingId ? 'Update Draft' : 'Save as Draft'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: '', message: '', targetRole: 'all' });
                  }}
                  className="py-2 px-3 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">
            Announcements History ({announcements.length})
          </h2>

          {loading ? (
            <p className="text-xs font-medium text-zinc-400 py-4">Fetching logs...</p>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white border border-zinc-200/50 rounded-xl">
              <FiMessageSquare size={32} className="text-zinc-200 mb-2" />
              <p className="text-xs font-bold text-zinc-500">No broadcasts found</p>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Use the composer on the left to write an announcement.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {announcements.map((ann) => (
                <div 
                  key={ann._id} 
                  className={`bg-white border rounded-xl p-5 transition-all duration-200 ${
                    ann.isPublished ? 'border-zinc-200/60 shadow-3xs' : 'border-dashed border-zinc-300 bg-zinc-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Target badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200/60 text-[9px] font-bold text-zinc-650 font-mono capitalize">
                          {ann.targetRole === 'all' ? <FiUsers size={9} /> : <FiShoppingBag size={9} />}
                          {ann.targetRole}
                        </span>
                        {/* Status badge */}
                        {ann.isPublished ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-600 font-mono">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-500 font-mono">
                            Draft
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 leading-tight">{ann.title}</h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!ann.isPublished && (
                        <button
                          onClick={() => handlePublish(ann._id)}
                          title="Publish and broadcast"
                          className="w-7 h-7 rounded-lg border border-emerald-150 hover:bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-3xs transition-colors bg-white"
                        >
                          <FiSend size={11} />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(ann)}
                        title="Edit draft"
                        className="w-7 h-7 rounded-lg border border-zinc-150 hover:bg-zinc-50 text-zinc-550 flex items-center justify-center shadow-3xs transition-colors bg-white"
                      >
                        <FiEdit2 size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(ann._id)}
                        title="Delete announcement"
                        className="w-7 h-7 rounded-lg border border-zinc-150 hover:bg-rose-50 hover:text-rose-600 text-zinc-550 flex items-center justify-center shadow-3xs transition-colors bg-white"
                      >
                        <FiTrash2 size={11} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 font-semibold leading-relaxed mt-3 border-t border-zinc-100 pt-3 break-words whitespace-pre-line">
                    {ann.message}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-[9px] font-mono font-bold text-zinc-400">
                    <span>Created: {new Date(ann.createdAt).toLocaleString()}</span>
                    {ann.isPublished && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-500">Published: {new Date(ann.publishedAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
