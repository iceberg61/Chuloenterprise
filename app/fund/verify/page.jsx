import { Suspense } from "react";
import VerifyClient from "./verify-client";

export default function VerifyPage() {
  return (
    <Suspense fallback={<p>Verifying payment...</p>}>
      <VerifyClient />
    </Suspense>
  );
}
