import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import toast from "react-hot-toast";
import { 
  FiCreditCard, FiTrendingUp, FiArrowDownRight, FiArrowUpRight, FiRefreshCw, 
  FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiActivity, FiTag
} from "react-icons/fi";

const Wallet = ({ url }) => {
  const { adminToken, formatPrice } = useAdmin();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const [walletRes, transRes] = await Promise.all([
        axios.get(`${url}/api/finance/wallet`, { headers: { token: adminToken } }),
        axios.get(`${url}/api/finance/wallet/transactions?page=${page}&limit=10`, { headers: { token: adminToken } })
      ]);

      if (walletRes.data.success) {
        setWallet(walletRes.data.data);
      }
      if (transRes.data.success) {
        setTransactions(transRes.data.data);
        setTotalPages(transRes.data.pagination.pages || 1);
      }
      if (showToast) {
        toast.success("Wallet records synchronized");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch wallet info");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchWalletData();
    }
  }, [adminToken, page]);

  const handleRefresh = () => {
    fetchWalletData(true);
  };

  const getTxTypeStyle = (type) => {
    switch (type) {
      case "ORDER_CREDIT":
        return { bg: "bg-emerald-50 text-emerald-700", icon: <FiArrowUpRight size={13} />, label: "Order Payment" };
      case "COMMISSION":
        return { bg: "bg-rose-50 text-rose-700", icon: <FiArrowDownRight size={13} />, label: "Commission Fee" };
      case "PAYMENT_GATEWAY_FEE":
        return { bg: "bg-amber-50 text-amber-700", icon: <FiArrowDownRight size={13} />, label: "Payment Gateway Fee" };
      case "ORDER_CREDIT_AVAILABLE":
        return { bg: "bg-blue-50 text-blue-700", icon: <FiActivity size={13} />, label: "Funds Released" };
      case "REFUND":
        return { bg: "bg-zinc-100 text-zinc-700", icon: <FiArrowDownRight size={13} />, label: "Refund Processing" };
      default:
        return { bg: "bg-zinc-50 text-zinc-500", icon: <FiTag size={13} />, label: type };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <FiRefreshCw className="animate-spin text-zinc-400" size={32} />
        <p className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">Loading wallet balances...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Merchant Wallet</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">Track your earnings and pending balance</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold transition-all bg-white shadow-3xs"
        >
          <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          <span>Refresh Balance</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pending Balance */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Pending Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <FiClock size={15} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-zinc-800 tracking-tight">
              {formatPrice(wallet?.pendingBalance || 0)}
            </h2>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">Locked until order delivery is complete</p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <FiCreditCard size={15} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-zinc-800 tracking-tight">
              {formatPrice(wallet?.availableBalance || 0)}
            </h2>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">
              {wallet?.availableBalance === 0 && wallet?.totalSettled > 0
                ? "All available funds have been settled."
                : "Released earnings available for payout"}
            </p>
          </div>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Lifetime Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
              <FiTrendingUp size={15} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-zinc-800 tracking-tight">
              {formatPrice(wallet?.totalEarnings || 0)}
            </h2>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">Aggregate net store revenue earned</p>
          </div>
        </div>

        {/* Total Settled */}
        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-3xs space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Payouts</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-600">
              <FiCalendar size={15} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-zinc-800 tracking-tight">
              {formatPrice(wallet?.totalSettled || 0)}
            </h2>
            <p className="text-[9px] text-zinc-400 font-semibold mt-1">
              Last Settled: {wallet?.lastSettlementAt ? new Date(wallet.lastSettlementAt).toLocaleDateString() : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white border border-zinc-200/60 rounded-xl shadow-premium overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Transaction Ledger</h3>
          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Chronological record of all wallet entries</p>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <FiActivity size={24} className="mb-2" />
            <p className="text-xs font-semibold">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/75 border-b border-zinc-100 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  <th className="py-3 px-5">Event Detail</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Running Balance</th>
                  <th className="py-3 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {transactions.map((tx) => {
                  const uiType = getTxTypeStyle(tx.transactionType);
                  const isPositive = tx.amount >= 0;

                  return (
                    <tr key={tx._id} className="hover:bg-zinc-50/40 transition-colors">
                      {/* Event Detail */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-850 truncate max-w-[200px] sm:max-w-sm">
                            {tx.description}
                          </span>
                          {tx.orderId && (
                            <span className="text-[9px] text-zinc-400 font-mono mt-0.5 uppercase tracking-wider">
                              Order ID: ...{tx.orderId.slice(-6)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${uiType.bg}`}>
                          {uiType.icon}
                          <span>{uiType.label}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className={`py-3.5 px-5 font-mono font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isPositive ? "+" : ""}
                        {formatPrice(tx.amount)}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3.5 px-5 font-mono font-bold text-zinc-700">
                        {formatPrice(tx.balanceAfter)}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-5 text-zinc-450 font-semibold font-mono text-[10px]">
                        {new Date(tx.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50/30">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-600 transition-all text-2xs font-bold"
              >
                <FiChevronLeft size={10} className="inline mr-1" /> Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-600 transition-all text-2xs font-bold"
              >
                Next <FiChevronRight size={10} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
