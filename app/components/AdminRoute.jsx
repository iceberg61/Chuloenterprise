"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/"); // redirect normal users to dashboard
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return user?.role === "admin" ? children : null;
}
