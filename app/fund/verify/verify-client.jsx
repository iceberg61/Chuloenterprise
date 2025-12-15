'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyFundPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/fund");
  }, [router]);

  return null;
}
