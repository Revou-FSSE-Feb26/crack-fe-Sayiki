"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketplaceCreateListingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/modder/create-listing?type=marketplace");
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4 font-mono">
      <div className="p-8 bg-brand-sidebar border-2 border-slate-900 shadow-md text-center max-w-sm w-full">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-navy border-t-transparent mb-4"></div>
        <h2 className="text-base font-bold text-brand-textMain uppercase tracking-wide">
          Opening Marketplace Studio...
        </h2>
      </div>
    </div>
  );
}
