"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function ProductDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/services");
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8">
      <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center max-w-md w-full font-mono">
        <div className="text-3xl mb-3">🛠️</div>
        <h1 className="text-xl font-bold text-brand-textMain mb-2">SwitchLab Services & Custom Builds</h1>
        <p className="text-xs text-brand-textMuted uppercase mb-6">
          Switches, materials, and modding options are configured directly through verified craftsmen in our service catalog. Redirecting...
        </p>
        <Link href="/services">
          <Button variant="primary" isLoading={false}>Browse Services →</Button>
        </Link>
      </div>
    </div>
  );
}