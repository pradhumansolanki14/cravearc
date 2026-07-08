import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiStar, FiMessageSquare, FiRefreshCw, FiArrowRight, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { Card, Badge, Button, Select } from "../../components/ui";

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

const Reviews = ({ url }) => {
  const [reviews, setReviews] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFood, setFilterFood] = useState("All");
  const [filterRating, setFilterRating] = useState(0);
  const [replyText, setReplyText] = useState({});
  const [editingReply, setEditingReply] = useState({});
  const [savingReply, setSavingReply] = useState("");
  const token = localStorage.getItem("adminToken");

  const fetchData = async () => {
    setLoading(true);
    try {
      const foodRes = await axios.get(`${url}/api/food/my/items`, { headers: { token } });
      if (!foodRes.data.success) { 
        setLoading(false); 
        return; 
      }
      const items = foodRes.data.data;
      setFoodItems(items);

      const allReviews = [];
      for (const food of items) {
        try {
          const revRes = await axios.get(`${url}/api/reviews/${food._id}`);
          if (revRes.data.success) {
            revRes.data.data.forEach(r => allReviews.push({ ...r, foodName: food.name }));
          }
        } catch {}
      }
      setReviews(allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch { 
      toast.error("Failed to load reviews"); 
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
      const res = await axios.put(`${url}/api/admin/reviews/${review._id}/reply`, { reply }, { headers: { token } });
      if (res.data.success) {
        toast.success("Vendor reply successfully posted.");
        setReviews(prev => prev.map(r => r._id === review._id ? { ...r, vendorReply: reply, vendorRepliedAt: new Date() } : r));
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

  const filtered = reviews.filter(r => {
    const matchFood = filterFood === "All" || r.foodName === filterFood;
    const matchRating = filterRating === 0 || r.rating === filterRating;
    return matchFood && matchRating;
  });

  const uniqueFoodNames = [...new Set(reviews.map(r => r.foodName))];

  return (
    <div className="max-w-4xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiMessageSquare size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Reviews</h1>
            <p className="text-slate-405 text-xs font-semibold">{reviews.length} customer reviews cataloged</p>
          </div>
        </div>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          size="sm"
          leftIcon={<FiRefreshCw size={12} />}
          className="font-bold border-slate-205 text-slate-655 bg-white hover:bg-slate-50"
        >
          Refresh
        </Button>
      </div>

      {/* ── Filtering selections ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-100 shadow-2xs p-3.5 rounded-2xl">
        <select 
          value={filterFood} 
          onChange={e => setFilterFood(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-150 focus:border-emerald-450 focus:bg-white rounded-xl text-2xs font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer"
        >
          <option value="All">All Food Items</option>
          {uniqueFoodNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select 
          value={filterRating} 
          onChange={e => setFilterRating(Number(e.target.value))}
          className="px-3.5 py-2 bg-slate-50 border border-slate-150 focus:border-emerald-450 focus:bg-white rounded-xl text-2xs font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer"
        >
          <option value={0}>All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? "s" : ""}</option>)}
        </select>

        {(filterFood !== "All" || filterRating !== 0) && (
          <button 
            onClick={() => { setFilterFood("All"); setFilterRating(0); }} 
            className="text-2xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors p-1"
          >
            Clear Filters
          </button>
        )}
        <span className="ml-auto text-2xs font-bold uppercase tracking-widest text-slate-400">
          Showing {filtered.length} review{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Reviews Cards List ── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-36 bg-white rounded-3xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center p-8">
          <FiMessageSquare size={28} className="text-slate-350 mb-3" />
          <p className="font-bold text-slate-705 text-sm">No reviews found</p>
          <p className="text-xs text-slate-400 mt-1">Reviews matching your query parameters will display here.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filtered.map(review => {
            const isEditing = editingReply[review._id];
            const isSaving = savingReply === review._id;
            return (
              <Card 
                key={review._id} 
                variant="default" 
                radius="3xl" 
                padding="lg" 
                className="border border-slate-100 shadow-sm hover:shadow-card transition-shadow duration-300 animate-fadeUp"
              >
                
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-4.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm">
                      {review.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-none">{review.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{review.foodName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="flex justify-end"><Stars rating={review.rating} /></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-slate-655 text-sm leading-relaxed mb-5 font-medium bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Vendor Reply Bubble block */}
                {review.vendorReply && !isEditing ? (
                  <div className="bg-emerald-50 border border-emerald-100/35 rounded-2xl p-4.5 mb-2 relative animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Your Store Reply</p>
                      <button 
                        onClick={() => { 
                          setEditingReply(e => ({ ...e, [review._id]: true })); 
                          setReplyText(t => ({ ...t, [review._id]: review.vendorReply })); 
                        }}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-wider"
                      >
                        Edit Reply
                      </button>
                    </div>
                    <p className="text-slate-700 text-xs font-semibold leading-relaxed">{review.vendorReply}</p>
                    {review.vendorRepliedAt && (
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-2.5">
                        Replied on {new Date(review.vendorRepliedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Input Text Box for replying */}
                {(!review.vendorReply || isEditing) && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <textarea
                      value={replyText[review._id] || ""}
                      onChange={e => setReplyText(t => ({ ...t, [review._id]: e.target.value }))}
                      placeholder="Type a polite store reply response..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-150 focus:border-emerald-450 focus:bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 resize-none font-semibold"
                    />
                    
                    <div className="flex items-center gap-2">
                      {isEditing && (
                        <Button 
                          onClick={() => setEditingReply(e => ({ ...e, [review._id]: false }))}
                          variant="outline"
                          size="xs"
                          className="font-bold rounded-xl"
                        >
                          Cancel
                        </Button>
                      )}
                      
                      <Button 
                        disabled={isSaving} 
                        onClick={() => handleReply(review)}
                        variant="primary"
                        size="xs"
                        className="font-bold rounded-xl shadow-emerald"
                      >
                        {isSaving ? "Posting..." : isEditing ? "Update Response" : "Post Store Reply"}
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

export default Reviews;
