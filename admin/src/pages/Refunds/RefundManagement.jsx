import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { useAdmin } from "../../context/AdminContext";
import toast from "react-hot-toast";
import {
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiClock, FiCheckCircle, FiAlertCircle,
  FiXCircle, FiSlash, FiSettings, FiArrowRight, FiFileText, FiList, FiTrendingUp, FiActivity, FiTag
} from "react-icons/fi";

const RefundManagement = ({ url }) => {
  const { adminToken, formatPrice } = useAdmin();
  const [refunds, setRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Action states for Admin Modals
  const [approvedAmount, setApprovedAmount] = useState("");
  const [adminRemark, setAdminRemark] = useState("");
  const [gatewayReference, setGatewayReference] = useState("");
  const [failureReason, setFailureReason] = useState("");

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [actionRefundId, setActionRefundId] = useState(null);
  const [actionRequestedAmount, setActionRequestedAmount] = useState(0);

  const fetchRefundsData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      let queryUrl = `/api/refunds?page=${page}&limit=10`;
      if (statusFilter) queryUrl += `&status=${statusFilter}`;

      const res = await api.get(queryUrl);
      if (res.data.success) {
        setRefunds(res.data.data);
        setTotalPages(res.data.pagination.pages || 1);
      }
      if (showToast) toast.success("Refund database synchronized");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load refunds database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRefundDetail = async (id) => {
    try {
      const res = await api.get(`/api/refunds/${id}`);
      if (res.data.success) {
        setSelectedRefund(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load refund details");
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchRefundsData();
    }
  }, [adminToken, page, statusFilter]);

  const handleRefresh = () => {
    fetchRefundsData(true);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/api/refunds/${actionRefundId}/approve`,
        { approvedAmount: approvedAmount ? parseFloat(approvedAmount) : undefined, adminRemark }
      );
      if (res.data.success) {
        toast.success("Refund request approved");
        setShowApproveModal(false);
        setApprovedAmount("");
        setAdminRemark("");
        fetchRefundsData();
        if (selectedRefund && selectedRefund._id === actionRefundId) {
          fetchRefundDetail(actionRefundId);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to approve refund");
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/api/refunds/${actionRefundId}/reject`,
        { adminRemark }
      );
      if (res.data.success) {
        toast.success("Refund request rejected");
        setShowRejectModal(false);
        setAdminRemark("");
        fetchRefundsData();
        if (selectedRefund && selectedRefund._id === actionRefundId) {
          fetchRefundDetail(actionRefundId);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reject refund");
    }
  };

  const handleProcess = async (id) => {
    try {
      const res = await api.post(`/api/refunds/${id}/process`, {});
      if (res.data.success) {
        toast.success("Refund status set to PROCESSING");
        fetchRefundsData();
        if (selectedRefund && selectedRefund._id === id) {
          fetchRefundDetail(id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/api/refunds/${actionRefundId}/complete`,
        { gatewayReference }
      );
      if (res.data.success) {
        toast.success("Refund COMPLETED successfully");
        setShowCompleteModal(false);
        setGatewayReference("");
        fetchRefundsData();
        if (selectedRefund && selectedRefund._id === actionRefundId) {
          fetchRefundDetail(actionRefundId);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to complete refund");
    }
  };

  const handleFail = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/api/refunds/${actionRefundId}/fail`,
        { failureReason }
      );
      if (res.data.success) {
        toast.success("Refund status set to FAILED");
        setShowFailModal(false);
        setFailureReason("");
        fetchRefundsData();
        if (selectedRefund && selectedRefund._id === actionRefundId) {
          fetchRefundDetail(actionRefundId);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fail refund");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border-amber-250";
      case "UNDER_REVIEW":
        return "bg-purple-50 text-purple-700 border-purple-250";
      case "APPROVED":
        return "bg-blue-50 text-blue-700 border-blue-250";
      case "PROCESSING":
        return "bg-sky-50 text-sky-750 border-sky-250 animate-pulse";
      case "REJECTED":
        return "bg-zinc-100 text-zinc-650 border-zinc-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-250";
      default:
        return "bg-zinc-50 text-zinc-550";
    }
  };

  // Stats summaries
  const getStatsSummaries = () => {
    const s = { requestedCount: 0, completedCount: 0, completedAmt: 0, rejectedCount: 0, failedCount: 0 };
    refunds.forEach(r => {
      if (r.status === "REQUESTED" || r.status === "UNDER_REVIEW") {
        s.requestedCount += 1;
      } else if (r.status === "COMPLETED") {
        s.completedCount += 1;
        s.completedAmt += r.approvedAmount || r.requestedAmount;
      } else if (r.status === "REJECTED") {
        s.rejectedCount += 1;
      } else if (r.status === "FAILED") {
        s.failedCount += 1;
      }
    });
    return s;
  };

  const stats = getStatsSummaries();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <FiRefreshCw className="animate-spin text-zinc-400" size={32} />
        <p className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">Loading refund database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fadeUp">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Refund Requests Portal</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">Audit customer returns, authorize partial refunds, and reconcile vendor wallets</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-bold transition-all bg-white shadow-3xs"
        >
          <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          <span>Sync telemetry</span>
        </button>
      </div>

      {/* Card metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Requested/Review</p>
          <h2 className="text-lg font-mono font-bold text-amber-500 mt-3">{stats.requestedCount} claims</h2>
          <p className="text-[8px] text-zinc-400 mt-1 font-semibold">Awaiting platform validation</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Completed Refunds</p>
          <h2 className="text-lg font-mono font-bold text-emerald-600 mt-3">{stats.completedCount} transfers</h2>
          <p className="text-[8px] text-zinc-400 mt-1 font-mono font-bold">{formatPrice(stats.completedAmt)}</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Rejected Claims</p>
          <h2 className="text-lg font-mono font-bold text-zinc-650 mt-3">{stats.rejectedCount} items</h2>
          <p className="text-[8px] text-zinc-400 mt-1 font-semibold">Deemed invalid by admin</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Failed Gateways</p>
          <h2 className="text-lg font-mono font-bold text-rose-500 mt-3">{stats.failedCount} records</h2>
          <p className="text-[8px] text-rose-400 mt-1 font-semibold">Requires retry processing</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Deducted Value</p>
          <h2 className="text-lg font-mono font-bold text-zinc-900 mt-3">{formatPrice(stats.completedAmt)}</h2>
          <p className="text-[8px] text-zinc-450 mt-1 font-semibold">Vendor wallet clawbacks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table list */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/60 rounded-xl shadow-premium overflow-hidden space-y-4">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Refund Cases</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">List of claims submitted for approval workflow</p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-2xs focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {refunds.length === 0 ? (
            <div className="text-center py-12 text-zinc-450">
              <FiList size={24} className="mx-auto mb-2 text-zinc-350" />
              <p className="text-xs font-semibold">No refund claims match selection</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="py-2.5 px-4">Refund ID</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Amount / Type</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Actions Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-2xs">
                  {refunds.map((r) => (
                    <tr key={r._id} className="hover:bg-zinc-50/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-800">
                        <p>{r.refundNumber}</p>
                        <p className="text-[8px] text-zinc-400 font-mono mt-0.5">Order: ...{r.orderId?.toString().slice(-6)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-800">{r.customerId?.name || "Customer"}</p>
                        <p className="text-[8px] text-zinc-400 font-mono mt-0.5">{r.customerId?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-zinc-700">{formatPrice(r.requestedAmount)}</p>
                        <p className="text-[8px] text-zinc-450 font-bold uppercase mt-0.5">{r.refundType}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase ${getStatusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => fetchRefundDetail(r._id)}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
                          >
                            Details
                          </button>

                          {(r.status === "REQUESTED" || r.status === "UNDER_REVIEW") && (
                            <>
                              <button
                                onClick={() => { 
                                  setActionRefundId(r._id); 
                                  setApprovedAmount(String(r.requestedAmount)); 
                                  setActionRequestedAmount(r.requestedAmount);
                                  setShowApproveModal(true); 
                                }}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => { setActionRefundId(r._id); setShowRejectModal(true); }}
                                className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {r.status === "APPROVED" && (
                            <button
                              onClick={() => handleProcess(r._id)}
                              className="text-[10px] font-bold text-sky-600 hover:text-sky-800 transition-colors"
                            >
                              Send to Gateway
                            </button>
                          )}

                          {r.status === "PROCESSING" && (
                            <>
                              <button
                                onClick={() => { setActionRefundId(r._id); setShowCompleteModal(true); }}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                              >
                                Mark Settled
                              </button>
                              <button
                                onClick={() => { setActionRefundId(r._id); setShowFailModal(true); }}
                                className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors"
                              >
                                Fail
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/30">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-650 transition-all text-2xs font-bold"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-650 transition-all text-2xs font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side detail log */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/60 rounded-xl p-5 shadow-premium space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Refund Details</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Audit history tracking panel</p>
            </div>
            <FiFileText size={16} className="text-zinc-400" />
          </div>

          {!selectedRefund ? (
            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
              <FiList size={20} className="mx-auto mb-2 text-zinc-350" />
              <p className="text-2xs font-semibold">Select a refund claim to view its full transaction breakdown</p>
            </div>
          ) : (
            <div className="space-y-5 text-2xs">
              {/* Meta */}
              <div className="space-y-2 bg-zinc-50/50 p-3 rounded-xl border border-zinc-150/40">
                <div className="flex justify-between">
                  <span className="text-zinc-450 font-bold uppercase tracking-wider">Ref ID</span>
                  <span className="font-bold text-zinc-800">{selectedRefund.refundNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-450 font-bold uppercase tracking-wider">Status</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getStatusBadge(selectedRefund.status)}`}>
                    {selectedRefund.status}
                  </span>
                </div>
                {selectedRefund.gatewayReference && (
                  <div className="flex justify-between">
                    <span className="text-zinc-450 font-bold uppercase tracking-wider">Gateway Key</span>
                    <span className="font-mono font-bold text-zinc-800 truncate max-w-[120px]">{selectedRefund.gatewayReference}</span>
                  </div>
                )}
              </div>

              {/* Parties */}
              <div className="space-y-2 border-b border-zinc-100 pb-3">
                <h4 className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Involved Parties</h4>
                <div className="space-y-1.5 font-semibold text-zinc-500">
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span className="text-zinc-800">{selectedRefund.customerId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Merchant Store</span>
                    <span className="text-zinc-800">{selectedRefund.vendorId?.restaurantId?.name || "Vendor"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Total</span>
                    <span className="text-zinc-800 font-mono">{formatPrice(selectedRefund.orderId?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Claim Amount ({selectedRefund.refundType})</span>
                    <span className="font-bold font-mono">{formatPrice(selectedRefund.requestedAmount)}</span>
                  </div>
                  {selectedRefund.status === "COMPLETED" && (
                    <div className="flex justify-between text-emerald-600 font-bold border-t border-zinc-100 pt-2 text-xs">
                      <span>Approved Amount</span>
                      <span className="font-mono">{formatPrice(selectedRefund.approvedAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Case Details */}
              <div className="space-y-1.5 text-zinc-500 font-semibold border-b border-zinc-100 pb-3">
                <h4 className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest mb-1.5">Case Details</h4>
                <p><span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider block">Reason Category</span> {selectedRefund.reason}</p>
                {selectedRefund.customerMessage && (
                  <p className="mt-2"><span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider block">Customer Message</span> "{selectedRefund.customerMessage}"</p>
                )}
                {selectedRefund.adminRemark && (
                  <p className="mt-2 text-zinc-700 bg-zinc-50 p-2.5 rounded-lg border border-zinc-150/40"><span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider block mb-0.5">Admin Remark</span> {selectedRefund.adminRemark}</p>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Audit Timeline</h4>
                <div className="relative border-l border-zinc-150 ml-1.5 space-y-4 text-2xs pl-4 font-semibold text-zinc-500">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <p className="text-zinc-850">Claim Requested</p>
                    <p className="text-[8px] text-zinc-400 mt-0.5 font-mono">
                      {new Date(selectedRefund.requestedAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {selectedRefund.reviewedAt && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <p className="text-zinc-850">Under Review</p>
                      <p className="text-[8px] text-zinc-400 mt-0.5 font-mono">
                        {new Date(selectedRefund.reviewedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}

                  {selectedRefund.approvedAt && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <p className="text-zinc-850">Claim Approved</p>
                      <p className="text-[8px] text-zinc-400 mt-0.5 font-mono">
                        {new Date(selectedRefund.approvedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}

                  {selectedRefund.processingAt && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                      <p className="text-zinc-850">Sending to Payout API</p>
                      <p className="text-[8px] text-zinc-400 mt-0.5 font-mono">
                        {new Date(selectedRefund.processingAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}

                  {selectedRefund.completedAt && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <p className="text-zinc-850">Refund Transfer Completed</p>
                      <p className="text-[8px] text-zinc-400 mt-0.5 font-mono">
                        {new Date(selectedRefund.completedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}

                  {selectedRefund.status === "FAILED" && selectedRefund.failureReason && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <p className="text-rose-700">Refund Processing Failed</p>
                      <p className="text-[8px] text-rose-450 mt-0.5 font-semibold">"{selectedRefund.failureReason}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ledger entries link */}
              {selectedRefund.ledgerEntries && selectedRefund.ledgerEntries.length > 0 && (
                <div className="space-y-2 border-t border-zinc-100 pt-3">
                  <h4 className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Linked Ledger Entries</h4>
                  <div className="bg-zinc-50 border border-zinc-150/40 rounded-xl p-2.5 font-mono flex items-center justify-between">
                    <span className="text-[8px] text-zinc-400 uppercase tracking-wider">Reference Ledger ID</span>
                    <span className="font-bold text-zinc-850">...{selectedRefund.ledgerEntries[0]._id?.slice(-8) || selectedRefund.ledgerEntries[0].toString().slice(-8)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Modals */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <form onSubmit={handleApprove} className="bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-zinc-850 uppercase tracking-wider border-b border-zinc-100 pb-2">Approve Refund Request</h3>
            
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Approved Payout Amount (₹) *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                max={actionRequestedAmount}
                required
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="Approved Amount"
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350"
              />
              {approvedAmount && (Number(approvedAmount) <= 0 || isNaN(Number(approvedAmount)) || Number(approvedAmount) > actionRequestedAmount) && (
                <p className="text-[10px] text-rose-500 font-bold mt-1">
                  Must be between ₹0.01 and ₹{actionRequestedAmount}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Review Remark</label>
              <textarea
                required
                value={adminRemark}
                onChange={(e) => setAdminRemark(e.target.value)}
                placeholder="Provide approval reasoning for audit history"
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350 h-16"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-2xs">
              <button
                type="button"
                onClick={() => { setShowApproveModal(false); setApprovedAmount(""); setAdminRemark(""); setActionRequestedAmount(0); }}
                className="px-3 py-2 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!approvedAmount || isNaN(Number(approvedAmount)) || Number(approvedAmount) <= 0 || Number(approvedAmount) > actionRequestedAmount}
                className="px-3 py-2 bg-zinc-950 hover:bg-zinc-850 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Authorize Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <form onSubmit={handleReject} className="bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-zinc-850 uppercase tracking-wider border-b border-zinc-100 pb-2">Reject Refund Claim</h3>
            
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Reason for Rejection *</label>
              <textarea
                required
                value={adminRemark}
                onChange={(e) => setAdminRemark(e.target.value)}
                placeholder="Audit description explaining rejection reason"
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350 h-20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-2xs">
              <button
                type="button"
                onClick={() => { setShowRejectModal(false); setAdminRemark(""); }}
                className="px-3 py-2 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all"
              >
                Submit Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <form onSubmit={handleComplete} className="bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-zinc-850 uppercase tracking-wider border-b border-zinc-100 pb-2">Complete Refund Transfer</h3>
            
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Gateway Reference Key *</label>
              <input
                type="text"
                required
                value={gatewayReference}
                onChange={(e) => setGatewayReference(e.target.value)}
                placeholder="e.g. pay_ref_1002390"
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-2xs">
              <button
                type="button"
                onClick={() => { setShowCompleteModal(false); setGatewayReference(""); }}
                className="px-3 py-2 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-zinc-950 hover:bg-zinc-850 text-white font-bold rounded-lg transition-all"
              >
                Mark Complete
              </button>
            </div>
          </form>
        </div>
      )}

      {showFailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <form onSubmit={handleFail} className="bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-zinc-850 uppercase tracking-wider border-b border-zinc-100 pb-2">Record Refund Failure</h3>
            
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Gateway Failure Reason *</label>
              <textarea
                required
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="Provide details on transfer failure (e.g. checkout expired)"
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350 h-20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-2xs">
              <button
                type="button"
                onClick={() => { setShowFailModal(false); setFailureReason(""); }}
                className="px-3 py-2 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all"
              >
                Mark Failed
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RefundManagement;
