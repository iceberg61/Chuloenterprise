"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User, Mail, Shield } from "lucide-react";

export default function UsersPage() {
  return (
    <ProtectedRoute adminOnly>
      <UsersContent />
    </ProtectedRoute>
  );
}

function UsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-white">Loading...</div>;


  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Admin Users
        </h1>
        <p className="text-gray-400 mt-1">Manage all registered users</p>
      </div>

      {/* TABLE WRAPPER */}
      <div className="
        overflow-hidden
        rounded-2xl
        border border-white/10
        backdrop-blur-xl
        bg-white/5
        shadow-[0_8px_30px_rgb(0,0,0,0.3)]
      ">
        <table className="w-full text-left">
          
          {/* HEAD */}
          <thead>
            <tr className="bg-white/10 text-gray-300 text-sm uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-white/10">
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="p-6 text-center text-gray-400 italic"
                >
                  No users found
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-white/10 transition duration-200"
              >
                {/* Username */}
                <td className="p-4 flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-white/10">
                    <User size={18} />
                  </div>
                  {u.username}
                </td>

                {/* Email */}
                <td className="p-4 flex items-center gap-3 text-gray-300">
                  <Mail size={16} className="opacity-60" />
                  {u.email}
                </td>

                {/* Role */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 w-fit 
                    ${
                      u.role === "admin"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-purple-600/20 text-purple-300"
                    }
                  `}
                  >
                    <Shield size={15} />
                    {u.role}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
