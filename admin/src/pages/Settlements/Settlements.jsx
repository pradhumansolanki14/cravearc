import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { useAdmin } from "../../context/AdminContext";
import toast from "react-hot-toast";
import {
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiClock, FiCheckCircle, FiAlertCircle,
  FiTrendingUp, FiCreditCard, FiXCircle, FiCalendar, FiArrowRight, FiFileText, FiList
} from "react-icons/fi";

const Settlements = ({ url }) => {
  const { adminToken, formatPrice } = useAdmin();
  const [wallet, setWallet] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSettlementData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const [walletRes, settlementsRes] = await Promise.all([
        api.get(`/api/finance/wallet`),
        api.get(`/api/settlements?page=${page}&limit=10`)
      ]);

      if (walletRes.data.success) {
        setWallet(walletRes.data.data);
      }
      if (settlementsRes.data.success) {
        setSettlements(settlementsRes.data.data);
        setTotalPages(settlementsRes.data.pagination.pages || 1);
      }
      if (showToast) toast.success("Settlements updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch payouts info");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSettlementDetail = async (id) => {
    try {
      const res = await api.get(`/api/settlements/${id}`);
      if (res.data.success) {
        setSelectedSettlement(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payout details");
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchSettlementData();
    }
  }, [adminToken, page]);

  const handleRefresh = () => {
    fetchSettlementData(true);
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

  const getPendingSettlementsAmount = () => {
    return settlements
      .filter(s => s.status === "PENDING" || s.status === "PROCESSING")
      .reduce((sum, s) => sum + s.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <FiRefreshCw className="animate-spin text-zinc-400" size={32} />
        <p className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">Loading settlements history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Payout Settlements</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">Track your weekly bank payout transfers</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold transition-all bg-white shadow-3xs"
        >
          <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          <span>Sync telemetry</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Available for Settlement</span>
          <div className="mt-4">
            <h2 className="text-xl font-mono font-bold text-emerald-600 tracking-tight">
              {formatPrice(wallet?.availableBalance || 0)}
            </h2>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">Cleared revenue waiting for weekly payout</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Pending Payouts</span>
          <div className="mt-4">
            <h2 className="text-xl font-mono font-bold text-amber-500 tracking-tight">
              {formatPrice(getPendingSettlementsAmount())}
            </h2>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">Settlement cycles created and awaiting validation</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Paid Payouts</span>
          <div className="mt-4">
            <h2 className="text-xl font-mono font-bold text-zinc-800 tracking-tight">
              {formatPrice(wallet?.totalSettled || 0)}
            </h2>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">
              Last transfer completed: {wallet?.lastSettlementAt ? new Date(wallet.lastSettlementAt).toLocaleDateString("en-IN") : "Never"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table list */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/60 rounded-xl shadow-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Settlement History</h3>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">List of all settlement entries for your store</p>
          </div>

          {settlements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-450">
              <FiCalendar size={24} className="mb-2 text-zinc-350" />
              <p className="text-xs font-semibold">No settlement cycles recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="py-2.5 px-4">Settlement Number</th>
                    <th className="py-2.5 px-4">Week Range</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {settlements.map((s) => (
                    <tr key={s._id} className="hover:bg-zinc-50/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-800">{s.settlementNumber}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-500 font-mono text-[10px]">
                        {new Date(s.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                        {new Date(s.weekEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-700 text-right">{formatPrice(s.amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => fetchSettlementDetail(s._id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          <span>Details</span>
                          <FiArrowRight size={10} />
                        </button>
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

        {/* Right Side Details Panel */}
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
              <p className="text-2xs font-semibold">Select a settlement from the list to view its detail log</p>
            </div>
          ) : (
            <div className="space-y-5 text-2xs">
              {/* Core Metadata */}
              <div className="space-y-2 bg-zinc-50/50 p-3 rounded-xl border border-zinc-150/40">
                <div className="flex justify-between">
                  <span className="text-zinc-450 font-bold uppercase tracking-wider">Ref ID</span>
                  <span className="font-bold text-zinc-800">{selectedSettlement.settlementNumber}</span>
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

              {/* Included order numbers */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <h4 className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Included Invoices</h4>
                <div className="divide-y divide-zinc-50">
                  {selectedSettlement.orders?.map((ord, idx) => (
                    <div key={ord._id || idx} className="py-2 flex items-center justify-between font-semibold">
                      <div className="min-w-0">
                        <p className="text-zinc-800 truncate">...{ord._id?.slice(-6) || "N/A"}</p>
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
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-start gap-2.5 text-rose-800">
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
    </div>
  );
};

export default Settlements;
