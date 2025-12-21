"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

export default function PurchasesPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [copied, setCopied] = useState({});
  const [expanded, setExpanded] = useState({});

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
    setPurchases(data);
  };

  const copyText = (uniqueKey, field, value) => {
    navigator.clipboard.writeText(value);

    setCopied((prev) => ({
      ...prev,
      [uniqueKey]: field,
    }));

    toast.success(`${field} copied!`);

    setTimeout(() => {
      setCopied((prev) => ({
        ...prev,
        [uniqueKey]: "",
      }));
    }, 1500);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.title} ({item.accounts?.length})
                    </h3>

                    <button onClick={() => toggleExpand(item._id)}>
                      {expanded[item._id] ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-500">
                    Platform: {item.platform}
                  </p>

                  {/* LOOP THROUGH ACCOUNTS */}
                  {item.accounts?.map((acc, index) => {
                    const uid = `${item._id}-${index}`;

                    return (
                      <div
                        key={uid}
                        className="mt-4 border-t pt-3 border-gray-200"
                      >
                        <p className="font-semibold text-gray-700">
                          Account #{index + 1}
                        </p>

                        <Field
                          label="Username"
                          value={acc.username}
                          uniqueKey={uid}
                          isCopied={copied[uid] === "Username"}
                          onCopy={() =>
                            copyText(uid, "Username", acc.username)
                          }
                        />

                        <Field
                          label="Password"
                          value={acc.password}
                          uniqueKey={uid}
                          isCopied={copied[uid] === "Password"}
                          onCopy={() =>
                            copyText(uid, "Password", acc.password)
                          }
                        />

                        {expanded[item._id] && (
                          <div className="mt-3 space-y-3">
                            <Field
                              label="Email"
                              value={acc.email}
                              uniqueKey={uid}
                              isCopied={copied[uid] === "Email"}
                              onCopy={() =>
                                copyText(uid, "Email", acc.email)
                              }
                            />

                            <Field
                              label="Email Password"
                              value={acc.emailPassword}
                              uniqueKey={uid}
                              isCopied={copied[uid] === "Email Password"}
                              onCopy={() =>
                                copyText(uid, "Email Password", acc.emailPassword)
                              }
                            />

                            {acc.twoFA && (
                              <Field
                                label="2FA / Recovery"
                                value={acc.twoFA}
                                uniqueKey={uid}
                                isCopied={copied[uid] === "2FA / Recovery"}
                                onCopy={() =>
                                  copyText(uid, "2FA / Recovery", acc.twoFA)
                                }
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

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

function Field({ label, value, uniqueKey, isCopied, onCopy }) {
  return (
    <div className="mt-2">
      <div className="flex justify-between">
        <span>{label}:</span>
        <button onClick={onCopy} className="text-blue-600">
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <p className="font-mono bg-gray-100 p-2 rounded break-all">{value}</p>
    </div>
  );
}
