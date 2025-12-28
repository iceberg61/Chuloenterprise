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
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="p-6 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Welcome, {username}!
                </h2>
                <p className="text-gray-600 mt-1">Available Social Media Accounts</p>
                <p className="text-sm text-green-600 font-medium mt-1">
                  Balance: ₦{user?.balance?.toLocaleString() || 0}
                </p>
              </div>

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

            {uniquePlatforms.map((platform) => {
              const filteredLogs = logs.filter(
                (log) => log.platform.toLowerCase() === platform
              );

              const icon = platformIcons[platform] || (
                <Globe className="text-gray-600" />
              );

              return (
                <section key={platform} id={platform} className="scroll-mt-20">
                  <div className="flex items-center gap-2 mb-4">
                    {icon}
                    <h3 className="text-xl font-semibold text-gray-800 capitalize">
                      {platform}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-xl p-5 border animate-pulse flex flex-col h-full"
                          >
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-5/6 mb-6" />
                            <div className="mt-auto flex justify-between">
                              <div className="h-8 w-20 bg-gray-200 rounded" />
                              <div className="h-8 w-16 bg-gray-200 rounded" />
                            </div>
                          </div>
                        ))
                      : filteredLogs.map((log) => (
                          <Link
                            key={log._id}
                            href={`/details/${log._id}`}
                            className="bg-white rounded-xl p-5 shadow hover:shadow-lg
                              border border-gray-100 transition hover:-translate-y-1
                              flex flex-col h-full"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">
                                {log.title}
                              </h3>
                              <p className="text-sm text-gray-500 leading-relaxed">
                                {log.description || "No description provided."}
                              </p>
                            </div>

                            <div className="flex justify-end mt-2">
                              <BriefcaseBusiness size={18} className="text-gray-500" />
                            </div>

                            <div className="flex justify-between items-center pt-4">
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
                </section>
              );
            })}
          </main>
        </div>

        <a
          href="https://t.me/chuloenterprise"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-5 bottom-6 z-50"
        >
          <div className="relative w-14 h-14 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-sky-400 opacity-30 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping delay-150" />

            <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full
              bg-gradient-to-tr from-sky-400 to-blue-600
              shadow-[0_0_30px_rgba(56,189,248,0.9)]
              transition-transform duration-300 hover:scale-110"
            >
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 fill-white"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
          </div>
        </a>
      </div>
    </ProtectedRoute>
  );
}
