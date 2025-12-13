'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyFundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const status = searchParams.get("status");
    const txRef = searchParams.get("tx_ref");

    if (!txRef) {
      setMessage("Invalid transaction reference");
      return;
    }

    if (status !== "successful") {
      setMessage("Payment was not successful");
      return;
    }

    const verify = async () => {
      try {
        const token = localStorage.getItem("token");

        // const res = await fetch("/api/payments/verify-manual", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`,
        //   },
        //   body: JSON.stringify({ reference: txRef }),
        // });
        const res =  await fetch("/api/payments/verify-manual", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reference: txRef }),
        });


        const data = await res.json();

        if (res.ok) {
          setMessage("Payment verified successfully 🎉");
          setTimeout(() => router.push("/fund"), 1500);
        } else {
          setMessage(data.error || "Verification failed");
        }
      } catch {
        setMessage("Network error during verification");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-lg font-semibold">{message}</h2>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
}
