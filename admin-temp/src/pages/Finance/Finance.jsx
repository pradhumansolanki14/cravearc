import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import toast from "react-hot-toast";
import {
  FiDollarSign, FiTrendingUp, FiActivity, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiSliders, FiCalendar, FiTag, FiUsers, FiCreditCard, FiAlertCircle
} from "react-icons/fi";

const Finance = ({ url }) => {
  const { adminToken, formatPrice } = useAdmin();
  const [overview, setOverview] = useState(null);
  const [vendorWallets, setVendorWallets] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ledger Filter States
  const [transactionType, setTransactionType] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFinanceData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      // 1. Fetch Overview & Vendor Wallets
      const [overviewRes, vendorsRes] = await Promise.all([
        axios.get(`${url}/api/finance/overview`, { headers: { token: adminToken } }),
        axios.get(`${url}/api/finance/vendors`, { headers: { token: adminToken } })
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }
      if (vendorsRes.data.success) {
        setVendorWallets(vendorsRes.data.data);
      }

      // 2. Fetch Ledger (paginated and filtered)
      let ledgerUrl = `${url}/api/finance/ledger?page=${page}&limit=10`;
      if (transactionType) ledgerUrl += `&transactionType=${transactionType}`;
      if (selectedVendor) ledgerUrl += `&vendorId=${selectedVendor}`;
      if (startDate) ledgerUrl += `&startDate=${startDate}`;
      if (endDate) ledgerUrl += `&endDate=${endDate}`;

      const ledgerRes = await axios.get(ledgerUrl, { headers: { token: adminToken } });
      if (ledgerRes.data.success) {
        setLedger(ledgerRes.data.data);
        setTotalPages(ledgerRes.data.pagination.pages || 1);
      }

      if (showToast) toast.success("Finance synchronized");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch finance records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchFinanceData();
    }
  }, [adminToken, page, transactionType, selectedVendor, startDate, endDate]);

  const handleRefresh = () => {
    fetchFinanceData(true);
  };

  const handleResetFilters = () => {
    setTransactionType("");
    setSelectedVendor("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    toast.success("Filters cleared");
  };

  const getTxTypeStyle = (type) => {
    switch (type) {
      case "ORDER_CREDIT":
        return "bg-emerald-50 text-emerald-700";
      case "COMMISSION":
        return "bg-rose-50 text-rose-700";
      case "PAYMENT_GATEWAY_FEE":
        return "bg-amber-50 text-amber-700";
      case "ORDER_CREDIT_AVAILABLE":
        return "bg-blue-50 text-blue-700";
      case "REFUND":
        return "bg-zinc-150 text-zinc-700";
      default:
        return "bg-zinc-50 text-zinc-500";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <FiRefreshCw className="animate-spin text-zinc-400" size={32} />
        <p className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">Loading platform ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fadeUp">
      {/* Top Header Section */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Financial Platform Ledger</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">Global money flow, commissions, and merchant wallets</p>
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

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Platform Revenue */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Platform Revenue</span>
          <div className="mt-4">
            <h2 className="text-lg font-mono font-bold text-zinc-800 tracking-tight">
              {formatPrice(overview?.platformRevenue || 0)}
            </h2>
            <p className="text-[8px] text-zinc-400 font-semibold mt-1">Deducted commissions (10% standard)</p>
          </div>
        </div>

        {/* Vendor Earnings */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Vendor Net Earnings</span>
          <div className="mt-4">
            <h2 className="text-lg font-mono font-bold text-zinc-800 tracking-tight">
              {formatPrice(overview?.totalVendorEarnings || 0)}
            </h2>
            <p className="text-[8px] text-zinc-400 font-semibold mt-1">Lifetime payout credits</p>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Pending Vendor Balance</span>
          <div className="mt-4">
            <h2 className="text-lg font-mono font-bold text-zinc-800 tracking-tight text-amber-600">
              {formatPrice(overview?.pendingVendorBalance || 0)}
            </h2>
            <p className="text-[8px] text-zinc-400 font-semibold mt-1">Locked in pending state</p>
          </div>
        </div>

        {/* Available Settlements */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Available for Settlement</span>
          <div className="mt-4">
            <h2 className="text-lg font-mono font-bold text-emerald-600 tracking-tight">
              {formatPrice(overview?.availableVendorBalance || 0)}
            </h2>
            <p className="text-[8px] text-zinc-400 font-semibold mt-1">Released funds ready for weekly settlement</p>
          </div>
        </div>

        {/* Gateway Fees */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-3xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Gateway Fees Paid</span>
          <div className="mt-4">
            <h2 className="text-lg font-mono font-bold text-zinc-800 tracking-tight text-rose-600">
              {formatPrice(overview?.totalGatewayFees || 0)}
            </h2>
            <p className="text-[8px] text-zinc-400 font-semibold mt-1">Paid to Razorpay checkout (2%)</p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Left - Ledger Audit, Right - Merchant Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Ledger Audit Log */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/60 rounded-xl shadow-premium overflow-hidden space-y-6 p-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Platform Ledger Logs</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Traceable append-only audit trials</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="text-[9px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-650 px-2.5 py-1 rounded transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-50/70 p-3 rounded-xl border border-zinc-100 text-2xs">
            {/* Transaction Type */}
            <div className="space-y-1">
              <label className="block text-[8px] font-bold uppercase text-zinc-400 tracking-wider">Tx Type</label>
              <select
                value={transactionType}
                onChange={(e) => { setTransactionType(e.target.value); setPage(1); }}
                className="w-full p-2 bg-white rounded-lg border border-zinc-200 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="ORDER_CREDIT">Order Credit</option>
                <option value="COMMISSION">Platform Commission</option>
                <option value="PAYMENT_GATEWAY_FEE">Gateway Fee</option>
                <option value="ORDER_CREDIT_AVAILABLE">Available Release</option>
              </select>
            </div>

            {/* Vendor Filter */}
            <div className="space-y-1">
              <label className="block text-[8px] font-bold uppercase text-zinc-400 tracking-wider">Merchant</label>
              <select
                value={selectedVendor}
                onChange={(e) => { setSelectedVendor(e.target.value); setPage(1); }}
                className="w-full p-2 bg-white rounded-lg border border-zinc-200 focus:outline-none"
              >
                <option value="">All Restaurants</option>
                {vendorWallets.map((w) => (
                  <option key={w._id} value={w.vendorId?._id}>
                    {w.vendorId?.restaurantId?.name || w.vendorId?.name || "Unnamed Vendor"}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="block text-[8px] font-bold uppercase text-zinc-400 tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full p-2 bg-white rounded-lg border border-zinc-200 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="block text-[8px] font-bold uppercase text-zinc-400 tracking-wider">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full p-2 bg-white rounded-lg border border-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Ledger Table */}
          {ledger.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
              <FiAlertCircle size={24} className="mb-2 text-zinc-350 animate-pulse" />
              <p className="text-xs font-semibold">No ledger entries match current criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="py-2.5 px-4">Merchant</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Balance</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-2xs">
                  {ledger.map((tx) => {
                    const isPositive = tx.amount >= 0;
                    return (
                      <tr key={tx._id} className="hover:bg-zinc-50/30 transition-colors">
                        {/* Merchant Details */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-zinc-800">
                            {tx.vendorId?.restaurantId?.name || tx.vendorId?.name || "System"}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
                            ID: ...{tx.orderId?.slice(-6) || "N/A"}
                          </p>
                        </td>

                        {/* Badge Type */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${getTxTypeStyle(tx.transactionType)}`}>
                            {tx.transactionType}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className={`py-3 px-4 font-mono font-bold text-right ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? "+" : ""}
                          {formatPrice(tx.amount)}
                        </td>

                        {/* Running Wallet Balance */}
                        <td className="py-3 px-4 font-mono font-bold text-zinc-700 text-right">
                          {formatPrice(tx.balanceAfter)}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 font-mono font-semibold text-zinc-400">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
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

        {/* Right Side: Merchant Wallet Directory */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/60 rounded-xl p-5 shadow-premium space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Vendor Wallets ({overview?.walletCount || 0})</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Active merchant balances</p>
            </div>
            <FiUsers size={16} className="text-zinc-400" />
          </div>

          {vendorWallets.length === 0 ? (
            <p className="text-2xs text-zinc-400 font-semibold text-center py-6">No merchant wallets registered</p>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-[480px] overflow-y-auto pr-1 space-y-3">
              {vendorWallets.map((wallet) => (
                <div key={wallet._id} className="pt-3 first:pt-0 flex items-start justify-between text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-800 truncate">
                      {wallet.vendorId?.restaurantId?.name || "Unnamed Restaurant"}
                    </p>
                    <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                      {wallet.vendorId?.name || "Unnamed Vendor"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <p className="font-mono font-bold text-zinc-900">{formatPrice(wallet.availableBalance)}</p>
                    <p className="text-[8px] text-amber-500 font-mono font-semibold mt-0.5">
                      Pending: {formatPrice(wallet.pendingBalance)}
                    </p>
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

export default Finance;
