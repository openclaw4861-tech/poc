"use client";

import dynamic from "next/dynamic";

const BimTestApp = dynamic(() => import("@/bim-test/BimTestApp"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
      Loading BIM viewer (client only)…
    </div>
  ),
});

export default function BimTestPageClient() {
  return <BimTestApp />;
}
