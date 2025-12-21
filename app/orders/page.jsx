"use client";
import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Receipt,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-400">
        Loading your orders...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 space-y-10">

      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold tracking-wide text-gray-900">
          My Orders
        </h1>
        <p className="text-gray-500 text-sm">
          View your purchase history and credentials
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Package className="text-blue-600" size={22} />
          </div>

          <div>
            <h2 className="text-gray-500 text-xs uppercase tracking-wide">
              Total Orders
            </h2>
            <p className="text-2xl font-bold text-gray-900">
              {totalOrders}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <Receipt className="text-green-600" size={22} />
          </div>

          <div>
            <h2 className="text-gray-500 text-xs uppercase tracking-wide">
              Total Spent (₦)
            </h2>
            <p className="text-2xl font-bold text-green-600">
              {totalSpent.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Order History Wrapper */}
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">

        {/* TOP header row */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setHistoryOpen(!historyOpen)}
        >
          <h3 className="text-xl font-bold text-gray-900">
            Order History ({orders.length})
          </h3>

          {historyOpen ? (
            <ChevronUp size={26} className="text-gray-600" />
          ) : (
            <ChevronDown size={26} className="text-gray-600" />
          )}
        </div>

        {/* COLLAPSING content */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            historyOpen ? "max-h-[2000px] mt-6" : "max-h-0"
          }`}
        >

          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders found yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition"
                >

                  {/* top card */}
                  <div
                    className="flex justify-between items-center p-5 cursor-pointer"
                    onClick={() => toggleExpand(order._id)}
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {order.product}
                      </h4>

                      <p className="text-gray-500 text-xs mt-1">
                        ₦{order.amount.toLocaleString()} •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>

                      {expanded === order._id ? (
                        <ChevronUp className="text-gray-500" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-500" size={20} />
                      )}
                    </div>
                  </div>

                  {/* expanding inner */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      expanded === order._id ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-5 pb-5 text-sm text-gray-700 space-y-2 pt-2 border-t">

                      <p>
                        <span className="font-medium text-gray-900">Reference:</span>{" "}
                        {order.reference}
                      </p>

                      <p>
                        <span className="font-medium text-gray-900">Email:</span>{" "}
                        {order.email}
                      </p>

                      {order.username && (
                        <p>
                          <span className="font-medium text-gray-900">Username:</span>{" "}
                          {order.username}
                        </p>
                      )}

                      {order.password && (
                        <p>
                          <span className="font-medium text-gray-900">Password:</span>{" "}
                          {order.password}
                        </p>
                      )}

                      <p>
                        <span className="font-medium text-gray-900">Purchased:</span>{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
