import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FiStar, FiMessageSquare, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { StoreContext } from '../../context/StoreContext';
import { Button, Card } from '../ui';
import { toast } from 'react-hot-toast';

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => setRating && setRating(s)}
          className="focus:outline-none"
        >
          <FiStar
            size={18}
            className={`${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} ${setRating ? 'hover:scale-110 transition-transform' : ''}`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewsWidget = ({ title = "Reviews", domain, entityId = "" }) => {
  const { url, token, userId } = useContext(StoreContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Calculate average locally or use state
  const average = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const endpoint = entityId ? `/api/reviews/${domain}/${entityId}` : `/api/reviews/${domain}`;
      const res = await axios.get(url + endpoint);
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [domain, entityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { rating, comment };
      if (domain === "food") payload.foodId = entityId;
      if (domain === "restaurant") payload.restaurantId = entityId;
      
      const res = await axios.post(url + `/api/reviews/${domain}`, payload, { headers: { token } });
      if (res.data.success) {
        toast.success(isEditing ? "Review updated!" : "Review submitted!");
        setComment("");
        setRating(5);
        setIsEditing(false);
        fetchReviews();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to submit review");
    }
    setSubmitting(false);
  };

  const handleEditClick = (review) => {
    setRating(review.rating);
    setComment(review.comment);
    setIsEditing(true);
    window.scrollTo({ top: document.getElementById('review-form-area')?.offsetTop - 80, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setRating(5);
    setComment("");
    setIsEditing(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      const res = await axios.delete(`${url}/api/reviews/${domain}/${reviewId}`, { headers: { token } });
      if (res.data.success) {
        toast.success("Review deleted successfully");
        if (isEditing) handleCancelEdit();
        fetchReviews();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-poppins font-extrabold text-xl text-slate-900">{title}</h3>
        <div className="flex items-center gap-2">
          <StarRating rating={average} />
          <span className="text-sm font-bold text-slate-700">{average}</span>
          <span className="text-xs text-slate-400">({reviews.length})</span>
        </div>
      </div>

      {/* Write a review section */}
      <Card id="review-form-area" variant="default" radius="2xl" padding="lg" className="border border-slate-100 bg-slate-50/50 shadow-sm">
        <h4 className="font-bold text-sm text-slate-800 mb-3">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Your Rating</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div>
            <textarea
              rows="3"
              placeholder="Share your experience..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={submitting} className="font-bold shadow-emerald px-6">
              {submitting ? "Submitting..." : isEditing ? "Save Changes" : "Submit Review"}
            </Button>
            {isEditing && (
              <Button type="button" onClick={handleCancelEdit} className="bg-slate-100 hover:bg-slate-200 text-slate-655 font-bold px-6">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-slate-100 rounded-2xl w-full"></div>
            <div className="h-24 bg-slate-100 rounded-2xl w-full"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <FiMessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">No reviews yet</p>
            <p className="text-xs text-slate-400">Be the first to review!</p>
          </div>
        ) : (
          reviews.map(review => {
            const isAuthor = userId && review.userId === userId;
            return (
              <Card key={review._id} variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm transition-hover hover:shadow-card relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {review.name?.charAt(0) || <FiUser />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900">{review.name}</p>
                        {isAuthor && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-650 tracking-wider">You</span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StarRating rating={review.rating} />
                    {isAuthor && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleEditClick(review)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                          title="Edit review"
                        >
                          <FiEdit2 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                          title="Delete review"
                        >
                          <FiTrash2 size={11} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                
                {review.vendorReply && (
                  <div className="mt-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3.5">
                    <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-1">Store Reply</p>
                    <p className="text-xs text-slate-700 font-medium">{review.vendorReply}</p>
                  </div>
                )}
                {review.adminReply && (
                  <div className="mt-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3.5">
                    <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-1">Admin Reply</p>
                    <p className="text-xs text-slate-700 font-medium">{review.adminReply}</p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewsWidget;
