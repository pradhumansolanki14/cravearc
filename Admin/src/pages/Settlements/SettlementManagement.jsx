import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import toast from "react-hot-toast";
import {
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiClock, FiCheckCircle, FiAlertCircle,
  FiXCircle, FiSlash, FiSettings, FiBriefcase, FiArrowRight, FiFileText, FiList, FiUsers, FiDollarSign
} from "react-icons/fi";

const SettlementManagement = ({ url }) => {
  const { adminToken, formatPrice } = useAdmin();
  const [settlements, setSettlements] = useState([]);
  const [vendorWallets, setVendorWallets] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Filters
  const [vendorId, setVendorId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Admin Input States for Actions
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [actionSettlementId, setActionSettlementId] = useState(null);

  const fetchManagementData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      // Fetch vendor wallets to populate filters
      const walletsRes = await axios.get(`${url}/api/finance/vendors`, { headers: { token: adminToken } });
      if (walletsRes.data.success) {
        setVendorWallets(walletsRes.data.data);
      }

      // Fetch filtered settlements
      let queryUrl = `${url}/api/settlements?page=${page}&limit=10`;
      if (vendorId) queryUrl += `&vendorId=${vendorId}`;
      if (status) queryUrl += `&status=${status}`;

      const settlementsRes = await axios.get(queryUrl, { headers: { token: adminToken } });
      if (settlementsRes.data.success) {
        setSettlements(settlementsRes.data.data);
        setTotalPages(settlementsRes.data.pagination.pages || 1);
      }

      if (showToast) toast.success("Settlements database synchronized");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settlements telemetry");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSettlementDetail = async (id) => {
    try {
      const res = await axios.get(`${url}/api/settlements/${id}`, { headers: { token: adminToken } });
      if (res.data.success) {
        setSelectedSettlement(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settlement detail record");
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchManagementData();
    }
  }, [adminToken, page, vendorId, status]);

  const handleRefresh = () => {
    fetchManagementData(true);
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await axios.post(`${url}/api/settlements/generate`, {}, { headers: { token: adminToken } });
      if (res.data.success) {
        toast.success(res.data.message || "Weekly settlements processed successfully!");
        fetchManagementData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to trigger settlements generation");
    } finally {
      setGenerating(false);
    }
  };

  const handleCompletePayout = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${url}/api/settlements/${actionSettlementId}/complete`,
        { reference, notes },
        { headers: { token: adminToken } }
      );
      if (res.data.success) {
        toast.success("Settlement payout marked COMPLETED");
        setShowCompleteModal(false);
        setReference("");
        setNotes("");
        fetchManagementData();
        if (selectedSettlement && selectedSettlement._id === actionSettlementId) {
          fetchSettlementDetail(actionSettlementId);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to complete payout");
    }
  };

  const handleFailPayout = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${url}/api/settlements/${actionSettlementId}/fail`,
        { failureReason },
        { headers: { token: adminToken } }
      );
      if (res.data.success) {
        toast.success("Settlement payout marked FAILED");
        setShowFailModal(false);
        setFailureReason("");
        fetchManagementData();
        if (selectedSettlement && selectedSettlement._id === actionSettlementId) {
          fetchSettlementDetail(actionSettlementId);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fail payout");
    }
  };

  const handleCancelPayout = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this settlement? Included orders will be freed up.")) return;
    try {
      const res = await axios.post(`${url}/api/settlements/${id}/cancel`, {}, { headers: { token: adminToken } });
      if (res.data.success) {
        toast.success("Settlement payout CANCELLED");
        fetchManagementData();
        if (selectedSettlement && selectedSettlement._id === id) {
          fetchSettlementDetail(id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to cancel payout");
    }
  };

  const handleRetryPayout = async (id) => {
    try {
      const res = await axios.post(`${url}/api/settlements/${id}/retry`, {}, { headers: { token: adminToken } });
      if (res.data.success) {
        toast.success("Settlement status reset to PENDING for retry");
        fetchManagementData();
        if (selectedSettlement && selectedSettlement._id === id) {
          fetchSettlementDetail(id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to retry payout");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-250";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-250";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-250";
      case "CANCELLED":
        return "bg-zinc-100 text-zinc-650 border-zinc-200";
      default:
        return "bg-zinc-50 text-zinc-550";
    }
  };

  // Helper summaries
  const getSummaryCounts = () => {
    const counts = { pending: 0, completed: 0, failed: 0, cancelled: 0, pendingAmt: 0, completedAmt: 0 };
    settlements.forEach(s => {
      if (s.status === "PENDING" || s.status === "PROCESSING") {
        counts.pending += 1;
        counts.pendingAmt += s.amount;
      } else if (s.status === "COMPLETED") {
        counts.completed += 1;
        counts.completedAmt += s.amount;
      } else if (s.status === "FAILED") {
        counts.failed += 1;
      } else if (s.status === "CANCELLED") {
        counts.cancelled += 1;
      }
    });
    return counts;
  };

  const summary = getSummaryCounts();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <FiRefreshCw className="animate-spin text-zinc-400" size={32} />
        <p className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">Loading administrative settlements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fadeUp">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Platform Settlements Portal</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">Manage payouts, complete bank transfers, and audit vendor ledger credits</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <FiSettings size={12} className={generating ? "animate-spin" : ""} />
            <span>Generate Settlements</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-bold transition-all bg-white shadow-3xs"
          >
            <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Cards summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Pending payouts</p>
          <h2 className="text-lg font-mono font-bold text-amber-500 mt-3">{summary.pending} records</h2>
          <p className="text-[8px] text-zinc-400 mt-1 font-mono font-bold">{formatPrice(summary.pendingAmt)}</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Completed payouts</p>
          <h2 className="text-lg font-mono font-bold text-emerald-600 mt-3">{summary.completed} records</h2>
          <p className="text-[8px] text-zinc-400 mt-1 font-mono font-bold">{formatPrice(summary.completedAmt)}</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Failed payouts</p>
          <h2 className="text-lg font-mono font-bold text-rose-500 mt-3">{summary.failed} records</h2>
          <p className="text-[8px] text-rose-450 mt-1 font-semibold">Awaiting retry triggers</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Cancelled cycles</p>
          <h2 className="text-lg font-mono font-bold text-zinc-550 mt-3">{summary.cancelled} records</h2>
          <p className="text-[8px] text-zinc-400 mt-1 font-semibold">Orders released from queue</p>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Active wallets</p>
          <h2 className="text-lg font-mono font-bold text-zinc-800 mt-3">{vendorWallets.length} merchants</h2>
          <p className="text-[8px] text-zinc-400 mt-1 font-semibold">Registered storefront balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Payouts list table */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/60 rounded-xl shadow-premium overflow-hidden space-y-4">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Settlement Batches</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Manage payouts for approval and completion</p>
            </div>

            {/* Simple filters */}
            <div className="flex gap-2 text-2xs">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={vendorId}
                onChange={(e) => { setVendorId(e.target.value); setPage(1); }}
                className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none max-w-[130px]"
              >
                <option value="">All Stores</option>
                {vendorWallets.map(w => (
                  <option key={w._id} value={w.vendorId?._id}>
                    {w.vendorId?.restaurantId?.name || w.vendorId?.name || "Vendor"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {settlements.length === 0 ? (
            <div className="text-center py-12 text-zinc-450">
              <FiBriefcase size={24} className="mx-auto mb-2 text-zinc-350" />
              <p className="text-xs font-semibold">No settlements match current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="py-2.5 px-4">Merchant Store</th>
                    <th className="py-2.5 px-4">Payout Amount</th>
                    <th className="py-2.5 px-4">Week Interval</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Action Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-2xs">
                  {settlements.map((s) => (
                    <tr key={s._id} className="hover:bg-zinc-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-zinc-800">
                          {s.vendorId?.restaurantId?.name || "Platform Store"}
                        </p>
                        <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
                          {s.settlementNumber}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-700">{formatPrice(s.amount)}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-450">
                        {new Date(s.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                        {new Date(s.weekEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => fetchSettlementDetail(s._id)}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
                          >
                            Details
                          </button>
                          
                          {(s.status === "PENDING" || s.status === "PROCESSING") && (
                            <>
                              <button
                                onClick={() => { setActionSettlementId(s._id); setShowCompleteModal(true); }}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => { setActionSettlementId(s._id); setShowFailModal(true); }}
                                className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors"
                              >
                                Fail
                              </button>
                              <button
                                onClick={() => handleCancelPayout(s._id)}
                                className="text-[10px] font-bold text-zinc-450 hover:text-zinc-650 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {(s.status === "FAILED" || s.status === "CANCELLED") && (
                            <button
                              onClick={() => handleRetryPayout(s._id)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Retry Payout
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
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

        {/* Right Side details and timelines */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/60 rounded-xl p-5 shadow-premium space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Payout Details</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Verification metadata overview</p>
            </div>
            <FiFileText size={16} className="text-zinc-400" />
          </div>

          {!selectedSettlement ? (
            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
              <FiList size={20} className="mx-auto mb-2 text-zinc-350" />
              <p className="text-2xs font-semibold">Select a payout cycle to audit transaction details</p>
            </div>
          ) : (
            <div className="space-y-5 text-2xs">
              {/* Meta */}
              <div className="space-y-2 bg-zinc-50/50 p-3 rounded-xl border border-zinc-150/40">
                <div className="flex justify-between">
                  <span className="text-zinc-450 font-bold uppercase tracking-wider">Ref ID</span>
                  <span className="font-bold text-zinc-800">{selectedSettlement.settlementNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-450 font-bold uppercase tracking-wider">Merchant Store</span>
                  <span className="font-bold text-zinc-850 truncate max-w-[120px]">{selectedSettlement.vendorId?.restaurantId?.name || "System"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-450 font-bold uppercase tracking-wider">Status</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getStatusBadge(selectedSettlement.status)}`}>
                    {selectedSettlement.status}
                  </span>
                </div>
                {selectedSettlement.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-zinc-450 font-bold uppercase tracking-wider">Settled On</span>
                    <span className="font-mono font-bold text-zinc-700">
                      {new Date(selectedSettlement.completedAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                )}
                {selectedSettlement.reference && (
                  <div className="flex justify-between">
                    <span className="text-zinc-450 font-bold uppercase tracking-wider">Bank Reference</span>
                    <span className="font-mono font-bold text-zinc-850 truncate max-w-[120px]">{selectedSettlement.reference}</span>
                  </div>
                )}
              </div>

              {/* Financial calculations breakdown */}
              <div className="space-y-2 border-b border-zinc-100 pb-3">
                <h4 className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Financial Breakdown</h4>
                <div className="space-y-1.5 font-semibold text-zinc-500">
                  <div className="flex justify-between">
                    <span>Included Orders Count</span>
                    <span className="text-zinc-800">{(selectedSettlement.orders || []).length} orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Customer Payments</span>
                    <span className="text-zinc-800">{formatPrice(selectedSettlement.summary?.grossAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Platform Commission Deduction</span>
                    <span>-{formatPrice(selectedSettlement.summary?.commissionSummary || 0)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Payment Gateway Fees (2%)</span>
                    <span>-{formatPrice(selectedSettlement.summary?.gatewayFeeSummary || 0)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold border-t border-zinc-100 pt-2 text-xs">
                    <span className="uppercase tracking-wider">Net Payout Amount</span>
                    <span className="font-mono">{formatPrice(selectedSettlement.summary?.netAmount || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Invoices list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <h4 className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Included Invoices</h4>
                <div className="divide-y divide-zinc-50">
                  {selectedSettlement.orders?.map((ord, idx) => (
                    <div key={ord._id || idx} className="py-2 flex items-center justify-between font-semibold">
                      <div className="min-w-0">
                        <p className="text-zinc-850 truncate">...{ord._id?.slice(-6) || "N/A"}</p>
                        <p className="text-[8px] text-zinc-400 mt-0.5">
                          {new Date(ord.createdAt || ord.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-mono text-zinc-700">{formatPrice(ord.vendorNetAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error messages */}
              {selectedSettlement.status === "FAILED" && selectedSettlement.failureReason && (
                <div className="bg-rose-50/75 border border-rose-200/80 rounded-xl p-3 flex items-start gap-2.5 text-rose-800">
                  <FiAlertCircle className="flex-shrink-0 mt-0.5" size={12} />
                  <div>
                    <p className="font-bold">Payout Transfer Error</p>
                    <p className="text-[9px] mt-0.5 leading-relaxed">{selectedSettlement.failureReason}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Modals */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <form onSubmit={handleCompletePayout} className="bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-zinc-850 uppercase tracking-wider border-b border-zinc-100 pb-2">Complete Settlement Transfer</h3>
            
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Bank Payout Reference *</label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TXN100234509"
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Notes / Remarks</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional transfer notes"
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350 h-16"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-2xs">
              <button
                type="button"
                onClick={() => { setShowCompleteModal(false); setReference(""); setNotes(""); }}
                className="px-3 py-2 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-zinc-950 hover:bg-zinc-850 text-white font-bold rounded-lg transition-all"
              >
                Mark Completed
              </button>
            </div>
          </form>
        </div>
      )}

      {showFailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <form onSubmit={handleFailPayout} className="bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-zinc-850 uppercase tracking-wider border-b border-zinc-100 pb-2">Record Settlement Failure</h3>
            
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Reason for Failure *</label>
              <textarea
                required
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="e.g. Merchant bank credentials invalid or rejected by gateway"
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

export default SettlementManagement;
