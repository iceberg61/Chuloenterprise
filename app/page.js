"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  Music,
  MessageCircle,
  Globe,
  BriefcaseBusiness,
} from "lucide-react";

import Link from "next/link";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [username, setUsername] = useState("User");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  

  const platformIcons = {
    instagram: <Instagram className="text-pink-500" />,
    twitter: <Twitter className="text-sky-500" />,
    facebook: <Facebook className="text-blue-600" />,
    tiktok: <Music className="text-gray-900" />,
    youtube: <Youtube className="text-red-600" />,
    linkedin: <Linkedin className="text-blue-700" />,
    telegram: <MessageCircle className="text-sky-400" />,
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs?availableOnly=true");
      if (!res.ok) throw new Error("Failed to fetch logs");

      const rawLogs = await res.json();

      const grouped = rawLogs.reduce((acc, log) => {
        const existing = acc.find((item) => item.title === log.title);

        if (existing) {
          existing.quantity += log.quantity;
        } else {
          acc.push({ ...log });
        }

        return acc;
      }, []);

      setLogs(grouped);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  const uniquePlatforms = [...new Set(logs.map((log) => log.platform.toLowerCase()))];

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="p-6 space-y-10">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Welcome, {username}!
                </h2>
                <p className="text-gray-600 mt-1">
                  Available Social Media Accounts
                </p>

                <p className="text-sm text-green-600 font-medium mt-1">
                  Balance: ₦{user?.balance?.toLocaleString() || 0}
                </p>
              </div>

              <div>
                <select
                  onChange={(e) => handleScroll(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-700 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {uniquePlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {uniquePlatforms.length > 0 ? (
              uniquePlatforms.map((platform) => {
                const filteredLogs = logs.filter(
                  (log) => log.platform.toLowerCase() === platform
                );

                const icon =
                  platformIcons[platform] || <Globe className="text-gray-600" />;

                return (
                  <section key={platform} id={platform} className="scroll-mt-20">

                    <div className="flex items-center gap-2 mb-4">
                      {icon}
                      <h3 className="text-xl font-semibold text-gray-800 capitalize">
                        {platform}
                      </h3>
                    </div>

                    {loading ? (
                      <p className="text-gray-500">Loading logs...</p>
                    ) : filteredLogs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                        {filteredLogs.map((log) => (
                          <Link
                            key={log._id}
                            href={`/details/${log._id}`}
                            className="relative bg-white rounded-xl p-5 shadow hover:shadow-lg border border-gray-100 transition hover:-translate-y-1 block cursor-pointer"
                          >

                            <h3 className="font-semibold text-gray-800 mb-2">
                              {log.title}
                            </h3>

                            <p className="text-sm text-gray-500 mb-6">
                              {log.description || "No description provided."}
                            </p>

                            {/* BACKPACK ICON ABOVE QTY BUTTON */}
                            <div className="absolute right-6 top-20 flex flex-col items-end">
                              {/* <Backpack  /> */}
                              <BriefcaseBusiness size={18}  className="text-gray-700 mb-1"/>
                            </div>

                            {/* PRICE + QTY ROW */}
                            <div className="flex justify-between items-center mt-10">
                              <p className="text-[13px] text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg px-4 py-2">
                                ₦{log.price.toLocaleString()}
                              </p>

                              <p className="text-[13px] text-white font-bold bg-black/80 rounded-lg px-4 py-2">
                                Qty: {log.quantity || 0}
                              </p>
                            </div>

                          </Link>
                        ))}

                      </div>
                    ) : (
                      <p className="text-gray-500">No logs available for that category.</p>
                    )}
                  </section>
                );
              })
            ) : (
              <p className="text-gray-500">No logs available yet.</p>
            )}

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
