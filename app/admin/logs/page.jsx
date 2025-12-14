"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    platform: "",
    title: "",
    description: "",
    price: "",
    quantity: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch("/api/logs");
    if (!res.ok) return toast.error("Access denied");
    setLogs(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = Number(form.price);
    const quantity = Number(form.quantity || 1);

    if (Number.isNaN(price) || price <= 0) {
      return toast.error("Please enter a valid price");
    }

    const payload = {
      ...form,
      price,
      quantity,
    };

    const url = editingId
      ? `/api/logs/${editingId}`
      : "/api/logs/upload";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return toast.error(err.error || "Action failed");
    }

    toast.success(editingId ? "Log updated" : "Log created");

    setEditingId(null);
    setForm({
      platform: "",
      title: "",
      description: "",
      price: "",
      quantity: "",
      username: "",
      password: "",
    });

    fetchLogs();
  };


  const handleEdit = (log) => {
  setEditingId(log._id);

    setForm({
      platform: log.platform || "",
      title: log.title || "",
      description: log.description || "",
      price: log.price?.toString() || "",
      quantity: log.quantity?.toString() || "",
      username: log.username || "",
      password: log.password || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleDelete = async (id) => {
    if (!confirm("Delete this log?")) return;

    const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Delete failed");

    toast.success("Log deleted");
    fetchLogs();
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 p-8 space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h2>
            <span className="text-sm text-gray-500">
              Manage and monitor uploaded social media logs
            </span>
          </div>

          {/* Upload / Edit Form */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil size={20} className="text-yellow-500" />
                    Edit Log
                  </>
                ) : (
                  <>
                    <PlusCircle size={20} className="text-blue-500" />
                    Add New Log
                  </>
                )}
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {Object.keys(form).map((key) => (
                <div key={key} className="flex flex-col">
                  <label
                    htmlFor={key}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    id={key}
                    type={key === "price" || key === "quantity" ? "number" : "text"}
                    min={key === "price" ? 1 : undefined}
                    placeholder={`Enter ${key}`}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              ))}

              <div className="col-span-full flex gap-4 mt-2">
                <button
                  type="submit"
                  className={`flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-white transition ${
                    editingId
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {editingId ? "Update Log" : "Upload Log"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        platform: "",
                        title: "",
                        description: "",
                        price: "",
                        quantity: "",
                        username: "",
                        password: "",
                      });
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Logs Table */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              All Uploaded Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr className="text-left text-gray-700">
                    <th className="py-3 px-4 font-semibold">Platform</th>
                    <th className="py-3 px-4 font-semibold">Title</th>
                    <th className="py-3 px-4 font-semibold">Price</th>
                    <th className="py-3 px-4 font-semibold">Quantity</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-gray-500 italic"
                      >
                        No logs available
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log._id}
                        className="border-b last:border-0 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4">{log.platform}</td>
                        <td className="py-3 px-4">{log.title}</td>
                        <td className="py-3 px-4">₦{log.price}</td>
                        <td className="py-3 px-4">{log.quantity}</td>
                        <td className="py-3 px-4 text-right space-x-3">
                          <button
                            onClick={() => handleEdit(log)}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(log._id)}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
