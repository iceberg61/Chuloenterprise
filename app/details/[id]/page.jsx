"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; 
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Youtube,
  Music,
  Globe
} from "lucide-react";

export default function DetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  
  const { user, refreshUser } = useAuth(); 

  const [log, setLog] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLog() {
      try {
        const res = await fetch(`/api/logs/${id}`);
        if (!res.ok) throw new Error("Failed to load product");

        setLog(await res.json());
      } catch (e) {
        setError(e.message);
      }
    }
    fetchLog();
  }, [id]);

  async function handleBuy() {

    if (!user) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: log._id,
          userId: user._id,
          qty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Purchase failed");
        setLoading(false);
        return;
      }

      toast.success("Purchase successful!");

      // ⬇️ refresh balance instantly
      await refreshUser();

      setConfettiOn(true);
      setShowModal(false);

      setTimeout(() => {
        router.refresh();
      }, 1200);

    } catch (err) {
      toast.error("Something went wrong");
    }

    setLoading(false);
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading…
      </div>
    );
  }

  const platformIcons = {
    facebook: <Facebook size={34} />,
    instagram: <Instagram size={34} />,
    twitter: <Twitter size={34} />,
    linkedin: <Linkedin size={34} />,
    youtube: <Youtube size={34} />,
    tiktok: <Music size={34} />,
    telegram: <MessageCircle size={34} />,
  };

  const icon = log.logo ? (
    <img
      src={log.logo}
      alt={log.title}
      className="w-16 h-16 object-contain rounded-full"
    />
  ) : (
    platformIcons[log.platform?.toLowerCase()] || <Globe size={34} />
  );

  const totalPrice = qty * log.price;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4">
      {confettiOn && <Confetti />}

      <div className="flex justify-center mb-6">
        <div className=" text-white rounded-full w-20 h-20 sm:w-24 sm:h-24 flex justify-center items-center shadow-lg">
          {icon}
        </div>
      </div>

      <h1 className="text-2xl sm:text-4xl font-bold text-center text-gray-900 tracking-wide px-2 leading-tight">
        {log.title}
      </h1>

      <section className="w-full max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mt-6 sm:mt-8">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <span className="text-3xl sm:text-4xl font-bold text-gray-900 ">
            ₦{totalPrice.toLocaleString()}
          </span>
          <span className="bg-gray-900 text-white px-4 py-3 text-xs sm:text-sm rounded-md whitespace-nowrap">
            Qty Available: {log.quantity || 1}
          </span>
        </div>

        <p className="text-gray-600 text-sm font-bold sm:text-base mb-6 leading-relaxed">
          {log.description || "No description available"}
        </p>

        <div className="mb-6">

          <label className="text-gray-700 font-medium text-sm sm:text-base">
            Quantity
          </label>

          <div className="flex flex-wrap items-center gap-3 mt-2">

            <button
              onClick={() => qty > 1 && setQty(qty - 1)}
              className="px-3 py-2 bg-gray-200 rounded-md text-lg font-bold"
            >
              -
            </button>

            <input
              type="number"
              value={qty}
              min={1}
              max={log.quantity || 1}
              onChange={(e) => {
                const value = Math.min(
                  log.quantity,
                  Math.max(1, Number(e.target.value))
                );
                setQty(value);
              }}
              className="border border-gray-400 w-20 sm:w-24 text-center px-2 py-2 rounded-lg text-base"
            />

            <button
              onClick={() => qty < log.quantity && setQty(qty + 1)}
              className="px-3 py-2 bg-gray-200 rounded-md text-lg font-bold"
            >
              +
            </button>

          </div>
        </div>

        <button
          className="w-full py-3 sm:py-4 text-lg sm:text-xl text-white rounded-xl font-bold tracking-wide shadow-md hover:shadow-lg transition"
          style={{
            background: "linear-gradient(to right, #0ea5e9, #3b82f6, #6366f1)",
          }}
          onClick={() => setShowModal(true)}
        >
          BUY NOW
        </button>

      </section>

      <div className="flex justify-center gap-4 sm:gap-6 mt-8 text-xl sm:text-2xl flex-wrap">
        <Facebook className="text-blue-600" />
        <Twitter className="text-sky-500" />
        <Instagram className="text-pink-600" />
        <MessageCircle className="text-green-600" />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-3">

          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm text-center shadow-xl">

            <h2 className="text-xl sm:text-2xl font-bold mb-4">Confirm Purchase</h2>

            <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
              Are you sure you want to buy
              <br />
              <span className="font-bold text-black">
                {qty} × {log.title}
              </span>
              <br />
              <span className="text-green-600 font-bold text-lg sm:text-xl">
                ₦{totalPrice.toLocaleString()}
              </span>
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md text-sm sm:text-base"
              >
                Cancel
              </button>

              <button
                onClick={handleBuy}
                disabled={loading}
                className="px-5 py-2 bg-blue-600 text-white rounded-md font-bold text-sm sm:text-base"
              >
                {loading ? "Processing..." : "Yes, Buy"}
              </button>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
