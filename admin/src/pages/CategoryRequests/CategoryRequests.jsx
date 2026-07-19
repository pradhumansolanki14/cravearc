import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { 
  FiFolder, FiPlusCircle, FiCheckCircle, FiXCircle, 
  FiClock, FiRefreshCw, FiInfo, FiLayers, FiMessageSquare, FiAlertCircle 
} from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import { Card, Button, Badge } from "../../components/ui";

const CategoryRequests = ({ url }) => {
  const { adminToken, adminRole } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form states for creating a request
  const [reqName, setReqName] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form states for rejecting a request
  const [rejectReasonText, setRejectReasonText] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const endpoint = adminRole === "superadmin" 
        ? "/api/categories/requests/all"
        : "/api/categories/requests/my";
      
      const res = await api.get(endpoint);
      if (res.data.success) {
        setRequests(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to load category requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (adminToken) {
      fetchRequests();
    }
  }, [adminToken, adminRole]);

  // Handle request submission (Vendor only)
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!reqName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(
        `/api/categories/requests`,
        { name: reqName, description: reqDesc, reason: reqReason }
      );
      if (res.data.success) {
        toast.success("Category request submitted successfully.");
        setShowRequestModal(false);
        setReqName("");
        setReqDesc("");
        setReqReason("");
        fetchRequests();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
    setSubmitting(false);
  };

  // Handle request approval (Admin only)
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this category and add it to the master catalog?")) return;
    try {
      const res = await api.post(
        `/api/categories/requests/${id}/approve`,
        {}
      );
      if (res.data.success) {
        toast.success("Category approved.");
        fetchRequests();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Approve action failed");
    }
  };

  // Handle request rejection (Admin only)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setRejecting(true);
    try {
      const res = await api.post(
        `/api/categories/requests/${selectedRequest._id}/reject`,
        { rejectionReason: rejectReasonText }
      );
      if (res.data.success) {
        toast.success("Category rejected.");
        setShowRejectModal(false);
        setRejectReasonText("");
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Reject action failed");
    }
    setRejecting(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge variant="success" className="font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-md">Approved</Badge>;
      case "rejected":
        return <Badge variant="danger" className="font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-md">Rejected</Badge>;
      default:
        return <Badge variant="warning" className="font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-md">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-6xl animate-fadeUp space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiFolder size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Category Requests</h1>
            <p className="text-slate-405 text-xs font-semibold">
              {requests.length} total catalog requests processed
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Button 
            onClick={fetchRequests} 
            variant="outline" 
            size="sm"
            leftIcon={<FiRefreshCw size={12} />}
            className="font-bold border-slate-205 text-slate-655 bg-white hover:bg-slate-50"
          >
            Refresh
          </Button>
          
          {adminRole === "vendor" && (
            <Button
              onClick={() => setShowRequestModal(true)}
              variant="primary"
              size="sm"
              leftIcon={<FiPlusCircle size={13} />}
              className="font-bold shadow-emerald-lg"
            >
              Request Category
            </Button>
          )}
        </div>
      </div>

      {/* ── Content View ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center p-8">
          <FiLayers size={32} className="text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-705 text-sm">No requests cataloged</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
            {adminRole === "superadmin" 
              ? "When vendors request new menu categories, they will display here for your approval."
              : "Can't find the perfect category for your dish? Submit a request to the Platform Admin."
            }
          </p>
        </div>
      ) : (
        /* Requests Table / Grid */
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Category Name</th>
                  {adminRole === "superadmin" && (
                    <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Restaurant</th>
                  )}
                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Date Submitted</th>
                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-xs">{req.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs font-semibold mt-0.5">{req.description || "No description provided"}</div>
                    </td>
                    {adminRole === "superadmin" && (
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-700 text-xs">{req.restaurantName}</span>
                      </td>
                    )}
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-805 hover:bg-slate-100 rounded-lg transition-all uppercase tracking-wider"
                        >
                          Details
                        </button>
                        
                        {adminRole === "superadmin" && req.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(req._id)}
                              className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-805 hover:bg-emerald-50 rounded-lg transition-all uppercase tracking-wider"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }}
                              className="px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:text-rose-805 hover:bg-rose-50 rounded-lg transition-all uppercase tracking-wider"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Vendor Request Modal ── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <Card 
            radius="2xl" 
            padding="lg" 
            className="w-full max-w-md bg-white border border-slate-100 shadow-xl relative animate-scaleIn"
          >
            <button 
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <FiXCircle size={16} />
            </button>

            <h3 className="font-poppins font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
              <FiFolder size={18} className="text-emerald-500" />
              Request Category
            </h3>
            <p className="text-slate-400 text-xs font-semibold mb-5 leading-normal">
              Submit a request for a new menu folder category. It will become available after admin review.
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Category Name</label>
                <input 
                  type="text" 
                  value={reqName} 
                  onChange={e => setReqName(e.target.value)}
                  placeholder="e.g. Samosas, Vegan Specialties"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-450 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all placeholder-slate-405 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Description</label>
                <textarea 
                  value={reqDesc} 
                  onChange={e => setReqDesc(e.target.value)}
                  placeholder="Summarize what kind of dishes go into this category..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-450 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all placeholder-slate-405 font-semibold resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reason for Request (Optional)</label>
                <textarea 
                  value={reqReason} 
                  onChange={e => setReqReason(e.target.value)}
                  placeholder="Help admin understand why this category is necessary..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-450 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all placeholder-slate-405 font-semibold resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button 
                  onClick={() => setShowRequestModal(false)} 
                  variant="outline" 
                  size="sm"
                  className="font-bold"
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  disabled={submitting} 
                  variant="primary" 
                  size="sm"
                  className="font-bold shadow-emerald-lg"
                  type="submit"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Admin Reject Reason Modal ── */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <Card 
            radius="2xl" 
            padding="lg" 
            className="w-full max-w-md bg-white border border-slate-100 shadow-xl relative animate-scaleIn"
          >
            <button 
              onClick={() => { setShowRejectModal(false); setSelectedRequest(null); }}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <FiXCircle size={16} />
            </button>

            <h3 className="font-poppins font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
              <FiXCircle size={18} className="text-rose-500" />
              Reject Request
            </h3>
            <p className="text-slate-405 text-xs font-semibold mb-4">
              Enter the reason why the request for category <span className="font-extrabold text-slate-800">"{selectedRequest.name}"</span> is being rejected.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rejection Reason</label>
                <textarea 
                  value={rejectReasonText} 
                  onChange={e => setRejectReasonText(e.target.value)}
                  placeholder="e.g. Duplicate of existing category, Invalid naming standards..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-450 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all placeholder-slate-405 font-semibold resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button 
                  onClick={() => { setShowRejectModal(false); setSelectedRequest(null); }} 
                  variant="outline" 
                  size="sm"
                  className="font-bold"
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  disabled={rejecting} 
                  variant="danger" 
                  size="sm"
                  className="font-bold shadow-rose"
                  type="submit"
                >
                  {rejecting ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Details View Modal ── */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <Card 
            radius="2xl" 
            padding="lg" 
            className="w-full max-w-md bg-white border border-slate-100 shadow-xl relative animate-scaleIn space-y-4"
          >
            <button 
              onClick={() => { setShowDetailModal(false); setSelectedRequest(null); }}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <FiXCircle size={16} />
            </button>

            <div className="space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <h3 className="font-poppins font-extrabold text-slate-900 text-base">Request Details</h3>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Submitted on {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="divide-y divide-slate-100 space-y-3 pt-2">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Requested Category</span>
                <span className="text-xs font-extrabold text-slate-800">{selectedRequest.name}</span>
              </div>

              <div className="space-y-1 pt-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Description</span>
                <span className="text-xs text-slate-655 font-semibold block leading-relaxed">{selectedRequest.description || "No description provided"}</span>
              </div>

              <div className="space-y-1 pt-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Reason for Request</span>
                <span className="text-xs text-slate-655 font-semibold block leading-relaxed">{selectedRequest.reason || "No reason specified"}</span>
              </div>

              {adminRole === "superadmin" && (
                <div className="space-y-1.5 pt-3 grid grid-cols-2 gap-2 border-none">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Restaurant</span>
                    <span className="text-xs font-extrabold text-slate-700">{selectedRequest.restaurantName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Vendor ID</span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">{selectedRequest.vendorId}</span>
                  </div>
                </div>
              )}

              {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                <div className="bg-rose-50/50 border border-rose-100/50 rounded-xl p-3 pt-3 mt-3 space-y-1">
                  <span className="text-[9px] font-extrabold text-rose-700 uppercase tracking-widest block flex items-center gap-1">
                    <FiAlertCircle /> Rejection Reason
                  </span>
                  <span className="text-xs text-slate-700 font-semibold block leading-relaxed">{selectedRequest.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
              <Button 
                onClick={() => { setShowDetailModal(false); setSelectedRequest(null); }} 
                variant="outline" 
                size="sm"
                className="font-bold"
              >
                Close
              </Button>
              
              {adminRole === "superadmin" && selectedRequest.status === "pending" && (
                <>
                  <Button
                    onClick={() => { setShowDetailModal(false); handleApprove(selectedRequest._id); }}
                    variant="primary"
                    size="sm"
                    className="font-bold shadow-emerald-lg"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => { setShowDetailModal(false); setShowRejectModal(true); }}
                    variant="danger"
                    size="sm"
                    className="font-bold shadow-rose"
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CategoryRequests;
