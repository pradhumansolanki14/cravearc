import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { FiStar, FiMessageSquare, FiRefreshCw } from "react-icons/fi";
import { Card, Button } from "../../components/ui";

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <FiStar 
        key={s} 
        size={13} 
        className={`${s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-205"}`} 
      />
    ))}
  </div>
);

const PlatformReviews = ({ url }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [editingReply, setEditingReply] = useState({});
  const [savingReply, setSavingReply] = useState("");
  const token = localStorage.getItem("adminToken");

  const fetchData = async () => {
    setLoading(true);
    try {
      const revRes = await api.get(`/api/reviews/platform`);
      if (revRes.data.success) {
        setReviews(revRes.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch { 
      toast.error("Failed to load platform reviews"); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleReply = async (review) => {
    const reply = replyText[review._id]?.trim();
    if (!reply) { 
      toast.error("Reply text cannot be empty"); 
      return; 
    }
    setSavingReply(review._id);
    try {
      const res = await api.post(`/api/reviews/platform/admin/${review._id}`, { reply });
      if (res.data.success) {
        toast.success("Admin reply successfully posted.");
        setReviews(prev => prev.map(r => r._id === review._id ? { ...r, adminReply: reply, adminRepliedAt: new Date() } : r));
        setReplyText(prev => ({ ...prev, [review._id]: "" }));
        setEditingReply(prev => ({ ...prev, [review._id]: false }));
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save reply");
    }
    setSavingReply("");
  };

  return (
    <div className="max-w-4xl animate-fadeUp space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiMessageSquare size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Platform Reviews</h1>
            <p className="text-slate-405 text-xs font-semibold">{reviews.length} reviews cataloged</p>
          </div>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" leftIcon={<FiRefreshCw size={12} />} className="font-bold border-slate-205 text-slate-655 bg-white hover:bg-slate-50">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-36 bg-white rounded-3xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center p-8">
          <FiMessageSquare size={28} className="text-slate-350 mb-3" />
          <p className="font-bold text-slate-705 text-sm">No reviews found</p>
          <p className="text-xs text-slate-400 mt-1">Platform reviews will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {reviews.map(review => {
            const isEditing = editingReply[review._id];
            const isSaving = savingReply === review._id;
            return (
              <Card key={review._id} variant="default" radius="3xl" padding="lg" className="border border-slate-100 shadow-sm hover:shadow-card transition-shadow duration-300 animate-fadeUp">
                <div className="flex items-start justify-between gap-3 mb-4.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm">
                      {review.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-none">{review.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex justify-end"><Stars rating={review.rating} /></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <p className="text-slate-655 text-sm leading-relaxed mb-5 font-medium bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {review.adminReply && !isEditing ? (
                  <div className="bg-emerald-50 border border-emerald-100/35 rounded-2xl p-4.5 mb-2 relative animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Admin Reply</p>
                      <button 
                        onClick={() => { setEditingReply(e => ({ ...e, [review._id]: true })); setReplyText(t => ({ ...t, [review._id]: review.adminReply })); }}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-wider"
                      >
                        Edit Reply
                      </button>
                    </div>
                    <p className="text-slate-700 text-xs font-semibold leading-relaxed">{review.adminReply}</p>
                  </div>
                ) : null}

                {(!review.adminReply || isEditing) && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <textarea
                      value={replyText[review._id] || ""}
                      onChange={e => setReplyText(t => ({ ...t, [review._id]: e.target.value }))}
                      placeholder="Type a response..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-150 focus:border-emerald-450 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 resize-none font-semibold"
                    />
                    <div className="flex items-center gap-2">
                      {isEditing && <Button onClick={() => setEditingReply(e => ({ ...e, [review._id]: false }))} variant="outline" size="xs" className="font-bold rounded-xl">Cancel</Button>}
                      <Button disabled={isSaving} onClick={() => handleReply(review)} variant="primary" size="xs" className="font-bold rounded-xl shadow-emerald">
                        {isSaving ? "Posting..." : isEditing ? "Update Response" : "Post Admin Reply"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlatformReviews;
