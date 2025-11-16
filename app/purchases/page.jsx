"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function PurchasesPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    const res = await fetch("/api/orders/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id }),
    });

    const data = await res.json();

    // Filter out empty or incomplete logs
    const valid = data.filter(
      (item) =>
        item &&
        item.logTitle &&
        item.logPlatform &&
        item.logUsername &&
        item.logPassword
    );

    setPurchases(valid);
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(label + " copied!");
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8">
          <h2 className="text-2xl font-semibold">Your Purchased Logs</h2>

          {purchases.length === 0 ? (
            <p className="text-gray-500">You have not purchased any logs yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-xl shadow border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.logTitle}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Platform: {item.logPlatform}
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Username:</span>
                      <button
                        onClick={() => copyText(item.logUsername, "Username")}
                        className="flex items-center gap-1 text-blue-600"
                      >
                        {copied === "Username" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-gray-800 bg-gray-100 p-2 rounded">
                      {item.logUsername}
                    </p>

                    <div className="flex justify-between">
                      <span className="text-gray-700">Password:</span>
                      <button
                        onClick={() => copyText(item.logPassword, "Password")}
                        className="flex items-center gap-1 text-blue-600"
                      >
                        {copied === "Password" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-gray-800 bg-gray-100 p-2 rounded">
                      {item.logPassword}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Purchased: {new Date(item.purchasedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
