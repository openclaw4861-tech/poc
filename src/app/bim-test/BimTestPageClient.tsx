"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const BimTestApp = dynamic(() => import("@/bim-test/BimTestApp"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
      Loading BIM viewer (client only)…
    </div>
  ),
});

export default function BimTestPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading BIM viewer (client only)…
      </div>
    );
  }

  return <BimTestApp />;
}
