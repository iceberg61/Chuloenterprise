// app/components/FundAccount.jsx
'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function FundAccount() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const { user, refreshUser } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) {
        setLoadingPayments(false);
        return;
      }
      try {
        const res = await fetch("/api/payments", {
          credentials: "include", 
        });
        const data = await res.json();
        setPayments(res.ok ? data.payments || [] : []);
      } catch (error) {
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
  }, [user]);

  const paymentHistory = payments.length > 0 ? payments : [];

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amt);

  const handleFund = async (e) => {
    e?.preventDefault();
    const fundAmount = parseFloat(amount);
    if (isNaN(fundAmount) || fundAmount < 100) {
      setError("Minimum amount is ₦100");
      return;
    }
    if (!user?.email) {
      setError("Email required. Log out and log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: fundAmount }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Payment failed");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFund = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Fund Your Account</h1>
          <p className="text-lg text-gray-600">Add funds via Paystack</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 uppercase">Current Balance</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {user ? formatCurrency(user.balance || 0) : "₦0.00"}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 uppercase">Total Funded</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {formatCurrency(paymentHistory.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Quick Fund</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickFund(amt)}
                disabled={!user}
                className={`p-3 rounded-lg font-medium text-sm transition-all ${
                  !user
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Custom Amount</h3>
          <form onSubmit={handleFund} className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in Naira"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="100"
              step="100"
              disabled={!user || loading}
            />
            <p className="text-xs text-gray-500">Minimum: ₦100</p>

            <button
              type="submit"
              disabled={loading || !user || !amount || parseFloat(amount) < 100}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                loading || !user || !amount || parseFloat(amount) < 100
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }`}
            >
              {loading ? "Redirecting to Paystack..." : "Add Funds"}
            </button>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex justify-between items-center">
                {error}
                <button onClick={() => setError("")} className="ml-2 text-red-500 hover:text-red-700">
                  ×
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Payment History</h3>
              <p className="text-sm text-gray-500 mt-1">All your funding transactions</p>
            </div>
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
            >
              {isHistoryExpanded ? "Collapse" : "Expand"} ({paymentHistory.length})
            </button>
          </div>

          {loadingPayments ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">Wallet</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h4>
              <p className="text-gray-500 mb-6">Fund your account to see history</p>
              <button
                onClick={() => handleQuickFund(1000)}
                className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              >
                Add ₦1,000
              </button>
            </div>
          ) : isHistoryExpanded && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((p) => (
                    <React.Fragment key={p._id}>
                      <tr
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedPayment(expandedPayment === p._id ? null : p._id)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(p.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{p.method}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                              ["completed", "success", "successful", "paid"].includes(p.status?.toLowerCase())
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {["completed", "success", "successful", "paid"].includes(p.status?.toLowerCase())
                              ? "Completed"
                              : "Pending"}
                          </span>
                        </td>
                      </tr>
                      {expandedPayment === p._id && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 bg-gray-50">
                            <div className="p-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <strong>Transaction ID:</strong> {p.transactionId}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Full Date:</strong> {new Date(p.createdAt).toISOString()}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}