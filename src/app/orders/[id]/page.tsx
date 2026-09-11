"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

const steps = [
  { key: "PAID", label: "Funds in Escrow", desc: "Payment held safely by SwitchLab" },
  { key: "SENDING", label: "Shipping to Modder", desc: "Customer ships keyboard/parts" },
  { key: "WORKBENCH", label: "On Workbench", desc: "Modder actively working & testing" },
  { key: "SHIPPED_BACK", label: "Shipped Back", desc: "Outbound tracking provided" },
  { key: "COMPLETED", label: "Complete & Release", desc: "Customer confirms sound & feel" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id || "SWL-8942";

  const [currentStepIndex, setCurrentStepIndex] = useState(2); // On Workbench
  const [inboundTracking, setInboundTracking] = useState("JP89421098842");
  const [outboundTracking, setOutboundTracking] = useState("");
  const [escrowReleased, setEscrowReleased] = useState(false);

  const handleReleaseEscrow = () => {
    setCurrentStepIndex(4);
    setEscrowReleased(true);
  };

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <a href="/orders" className="text-xs font-mono text-brand-navy hover:underline font-bold">
                  ← Back to Orders
                </a>
                <span className="text-slate-400">/</span>
                <span className="text-xs font-mono text-brand-textMuted uppercase">Order #{orderId}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Escrow Order Status Tracker
              </h1>
            </div>

            <div className="bg-green-50 border-2 border-green-600 px-4 py-2 font-mono text-xs">
              <span className="text-green-800 font-bold block uppercase">🛡️ Escrow Active</span>
              <span className="text-green-700">Rp 425,000 Locked in Vault</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Progression Bar */}
        <div className="bg-brand-sidebar border-2 border-slate-900 p-6 mb-8">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-6 pb-2 border-b-2 border-slate-900">
            Escrow Lifecycle Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`border-2 p-4 flex flex-col justify-between ${
                    isCurrent
                      ? "border-brand-navy bg-brand-lightBg"
                      : isPast
                      ? "border-green-600 bg-green-50/50"
                      : "border-slate-300 bg-white opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2 font-mono text-xs font-bold">
                      <span>STEP 0{idx + 1}</span>
                      <span>{isPast ? "✓ DONE" : isCurrent ? "● ACTIVE" : "PENDING"}</span>
                    </div>
                    <div className="font-bold text-sm text-brand-textMain mb-1">{step.label}</div>
                    <p className="text-xs font-mono text-brand-textMuted">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Details Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Workbench & Tracking Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Workbench Status */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-900">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                  Modder Workbench Notes
                </h3>
                <span className="text-xs font-mono text-brand-navy font-bold">
                  Modder: @DexterKeyboards
                </span>
              </div>

              <div className="bg-brand-lightBg border-2 border-slate-800 p-4 mb-4 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Keyboard Model:</span>
                  <span className="font-bold text-brand-textMain">Tofu65 Acrylic Edition</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Config:</span>
                  <span className="font-bold text-brand-textMain">90x Gateron Linear Switches + Deskeys Films</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Current Workbench Stage:</span>
                  <span className="font-bold text-brand-terracotta">
                    {escrowReleased ? "Completed & Funds Released" : "Cleaning stems & applying Krytox 205g0"}
                  </span>
                </div>
              </div>

              {/* Sound Test Audio Player Simulation */}
              <div className="border-2 border-slate-800 p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-brand-textMain">
                    🎵 Modder Sound Test Clip
                  </span>
                  <span className="text-xs font-mono text-green-700 font-bold">[ READY FOR REVIEW ]</span>
                </div>
                <div className="flex items-center gap-3 bg-brand-lightBg p-3 border border-slate-300">
                  <button className="w-8 h-8 bg-brand-navy text-white font-mono flex items-center justify-center font-bold">
                    ▶
                  </button>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-200 border border-slate-400">
                      <div className="h-full bg-brand-navy w-2/5"></div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-brand-textMuted">0:14 / 0:35</span>
                </div>
              </div>
            </div>

            {/* Courier Tracking Details */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Shipping & Logistics Tracking
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold uppercase text-brand-textMuted block mb-1">
                    Inbound Tracking (Customer ➔ Modder)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inboundTracking}
                      onChange={(e) => setInboundTracking(e.target.value)}
                      className="flex-1 px-3.5 py-2 border-2 border-slate-800 font-mono text-xs bg-brand-lightBg"
                    />
                    <span className="px-3 py-2 bg-green-50 border-2 border-green-600 text-green-700 font-mono text-xs font-bold uppercase">
                      Delivered
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold uppercase text-brand-textMuted block mb-1">
                    Outbound Tracking (Modder ➔ Customer)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Pending modder shipment dispatch..."
                      value={outboundTracking || "SICEPAT-88129034"}
                      readOnly
                      className="flex-1 px-3.5 py-2 border-2 border-slate-800 font-mono text-xs bg-brand-lightBg"
                    />
                    <span className="px-3 py-2 bg-blue-50 border-2 border-blue-600 text-blue-700 font-mono text-xs font-bold uppercase">
                      In Transit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment & Escrow Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Escrow Settlement
              </h3>

              <div className="space-y-3 font-mono text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Service Fee:</span>
                  <span className="font-bold">Rp 315,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Switch Film Materials:</span>
                  <span className="font-bold">Rp 90,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Return Shipping:</span>
                  <span className="font-bold">Rp 20,000</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-base">
                  <span className="font-bold uppercase">Held in Escrow:</span>
                  <span className="font-extrabold text-brand-navy">Rp 425,000</span>
                </div>
              </div>

              <div className="p-4 border-2 border-amber-600 bg-amber-50 text-xs font-mono mb-6">
                <span className="font-bold text-amber-800 block uppercase mb-1">
                  ⚠️ Inspection Notice
                </span>
                Only release funds after you have tested the sound test recording and received your package.
              </div>

              {escrowReleased ? (
                <div className="p-4 bg-green-50 border-2 border-green-600 text-center font-mono text-xs text-green-800 font-bold uppercase">
                  ✓ Escrow Released to Modder. Thank you!
                </div>
              ) : (
                <Button
                  variant="primary"
                  isLoading={false}
                  onClick={handleReleaseEscrow}
                  className="w-full text-xs py-3"
                >
                  Release Escrow Funds to Modder →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
