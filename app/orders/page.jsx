"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Package, Receipt } from "lucide-react";
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
    <div className="min-h-screen bg-white text-gray-900 p-6 space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wide">My Orders</h1>
        <p className="text-gray-500 mt-2 text-sm">
          View your purchase history and credentials
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow border flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Package className="text-blue-600" size={22} />
          </div>
          <div>
            <h2 className="text-gray-500 text-sm">Total Orders</h2>
            <p className="text-2xl font-semibold">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <Receipt className="text-green-600" size={22} />
          </div>
          <div>
            <h2 className="text-gray-500 text-sm">Total Spent (₦)</h2>
            <p className="text-2xl font-semibold text-green-600">
              {totalSpent.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h3 className="text-xl font-semibold mb-6">Order History</h3>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders found yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-50 rounded-xl border hover:border-gray-300 transition-all"
              >
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {order.product}
                    </h4>
                    <p className="text-gray-500 text-xs mt-1">
                      ₦{order.amount.toLocaleString()} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
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

                {/* Expanded Details */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    expanded === order._id ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="p-4 border-t text-sm text-gray-600 space-y-2">
                    <p>
                      <span className="font-medium">Reference:</span>{" "}
                      {order.reference}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.email}
                    </p>
                    {order.username && (
                      <p>
                        <span className="font-medium">Username:</span>{" "}
                        <span className="text-gray-900">{order.username}</span>
                      </p>
                    )}
                    {order.password && (
                      <p>
                        <span className="font-medium">Password:</span>{" "}
                        <span className="text-gray-900">{order.password}</span>
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Purchased:</span>{" "}
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
  );
}
