"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Adjust path

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);

  // ✅ Refresh only once when Navbar mounts
  useEffect(() => {
    refreshUser?.(); // safely call if exists
  }, []);

  // ✅ Update balance when user data changes
  useEffect(() => {
    if (user) {
      setBalance(user.balance || 0);
    }
  }, [user]);

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md w-full fixed top-0 left-0 z-50">
      <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => router.push("/")}>
        Chuloenterprise
      </h1>

      <div className="flex items-center gap-4">
        {/* 💰 Balance */}
        <div className="hidden sm:flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-lg shadow-sm sm:px-4 sm:py-2">
          <span className="ml-1 text-blue-600 font-bold">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
            }).format(balance)}
          </span>
        </div>

        {/* 🚀 Fund Button */}
        <button
          onClick={() => router.push("/fund")}
          className="hidden sm:block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-lg hover:opacity-90 transition sm:px-4 sm:py-2"
          disabled={!user}
        >
          Fund Account
        </button>

        {/* 🛠️ Admin Only: Manage Logs */}
        {user?.role === "admin" && (
          <button
            onClick={() => router.push("/admin/logs")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg font-medium transition sm:px-4 sm:py-2"
          >
            Manage Logs
          </button>
        )}

        {/* 🍔 Hamburger Menu or X (mobile) */}
        <button
          className="sm:hidden p-2 rounded-md border border-gray-300 hover:bg-gray-100"
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-gray-800" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800" />
          )}
        </button>
      </div>
    </nav>
  );
}
