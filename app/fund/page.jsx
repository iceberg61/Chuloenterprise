"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import FundAccount from "../components/FundAccount";

export default function FundPage() {

  return (
    <ProtectedRoute>
      <FundAccount />
    </ProtectedRoute>
  );
}