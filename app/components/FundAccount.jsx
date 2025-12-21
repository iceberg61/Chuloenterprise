'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function FundAccount() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) {
        setLoadingPayments(false);
        return;
      }
      try {
        const res = await fetch("/api/payments", { credentials: "include" });
        const data = await res.json();
        setPayments(res.ok ? data.payments || [] : []);
      } catch {
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
  }, [user]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amt);

  const handleFund = async (e) => {
    e.preventDefault();

    const fundAmount = parseFloat(amount);
    if (isNaN(fundAmount) || fundAmount < 100) {
      setError("Minimum amount is ₦100");
      return;
    }

    if (!user?.email) {
      setError("Email not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: fundAmount }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Payment initiation failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Fund Your Account
          </h1>
          <p className="text-lg text-gray-600">
            Add funds securely using our payment partner
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 ">
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Current Balance
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {user ? formatCurrency(user.balance || 0) : "₦0.00"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 ">
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Total Funded
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        </div>

        {/* Quick Fund */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 ">
          <h3 className="text-xl font-semibold mb-4">Quick Fund</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                disabled={!user}
                className={`p-3 rounded-lg font-medium transition-all ${
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

        {/* Custom Amount */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 ">
          <h3 className="text-xl font-semibold mb-4">Custom Amount</h3>

          <form onSubmit={handleFund} className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in Naira"
              min="100"
              step="100"
              disabled={!user || loading}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading || !user || !amount}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                loading || !user || !amount
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }`}
            >
              {loading ? "Redirecting to secure payment..." : "Add Funds"}
            </button>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-md ">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Payment History</h3>
              <p className="text-sm text-gray-500">
                All wallet funding transactions
              </p>
            </div>

            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="text-indigo-600 text-sm font-semibold cursor-pointer hover:underline transition"
            >
              {isHistoryExpanded ? "Collapse" : "Expand"} ({payments.length})
            </button>
          </div>

          {isHistoryExpanded && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y">
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {p.method === "flutterwave" ? "Flutterwave" : p.method}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            p.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.status === "success" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
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
