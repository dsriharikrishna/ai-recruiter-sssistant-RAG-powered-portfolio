"use client";

import { use, Suspense } from "react";
import { PublicPortfolioView } from "@/features/portfolio";

interface PageProps {
  params: Promise<{ username: string }>;
}

function PortfolioInner({ params }: PageProps) {
  const resolvedParams = use(params);
  return <PublicPortfolioView slug={resolvedParams.username || "alex-johnson"} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090E] p-8 text-slate-400">Loading portfolio...</div>}>
      <PortfolioInner params={params} />
    </Suspense>
  );
}
