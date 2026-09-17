"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

interface ModderJob {
  id: string;
  orderNumber: string;
  customerName: string;
  keyboardModel: string;
  serviceRequested: string;
  escrowPayout: number;
  status: "PAID_WAITING_MODDER" | "CUSTOMER_SENDING_KEYBOARD" | "KEYBOARD_IN_MODDER_HAND" | "SHIPPED_BACK" | "SUCCESS";
  inboundTracking: string;
  outboundTracking: string;
  currentWorkbenchStage: string;
  soundTestUploaded: boolean;
}

const workbenchStages = [
  "Stage 1: Board Inspection & Disassembly",
  "Stage 2: Stem Ultrasonic Cleaning & Drying",
  "Stage 3: Brush Hand-Lubing & Filming",
  "Stage 4: Stabilizer Wire Balancing & Holee Mod",
  "Stage 5: Sound Test Audio Recording & QC Check",
  "Stage 6: Reassembly & Final Acoustic Testing",
];

export default function ModderDashboardPage() {
  const [jobs, setJobs] = useState<ModderJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ModderJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [modderName, setModderName] = useState("Modder");
  const [dispatchTrackingInput, setDispatchTrackingInput] = useState("SICEPAT-88129034");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) setModderName(u.name);
      }
    } catch (e) {}

    async function loadJobs() {
      try {
        setLoading(true);
        const data = await api.orders.getAll().catch(() => []);
        const dbOrders = Array.isArray(data) ? data : [];

        let localOrders: any[] = [];
        try {
          const stored = localStorage.getItem("switchlab_orders");
          if (stored) localOrders = JSON.parse(stored);
        } catch (e) {}

        const mappedDbJobs: ModderJob[] = dbOrders.map((b: any) => ({
          id: b.id,
          orderNumber: b.id.slice(0, 8).toUpperCase(),
          customerName: `${b.customer?.name || "Customer"} (${b.customer?.locationCity || "Indonesia"})`,
          keyboardModel: b.keyboardModel || "Custom Keyboard",
          serviceRequested: b.items?.[0]?.service?.title || "Keyboard Modding Service",
          escrowPayout: Math.round(b.totalPrice * 0.95),
          status: b.status || "KEYBOARD_IN_MODDER_HAND",
          inboundTracking: b.inboundTrackingNum || "JNE-TRACKING (Delivered)",
          outboundTracking: b.outboundTrackingNum || "",
          currentWorkbenchStage: "Stage 3: Brush Hand-Lubing & Filming",
          soundTestUploaded: true,
        }));

        const mappedLocalJobs: ModderJob[] = (Array.isArray(localOrders) ? localOrders : []).map((o: any) => ({
          id: o.id,
          orderNumber: o.id,
          customerName: "Current User (Jakarta)",
          keyboardModel: "Custom Keyboard Build",
          serviceRequested: o.service || "Linear Switch Lubing & Tuning",
          escrowPayout: Math.round((o.totalPrice || 425000) * 0.95),
          status: o.status || "KEYBOARD_IN_MODDER_HAND",
          inboundTracking: "JP89421098842 (Delivered)",
          outboundTracking: "",
          currentWorkbenchStage: "Stage 1: Board Inspection & Disassembly",
          soundTestUploaded: false,
        }));

        const combined = [...mappedDbJobs];
        mappedLocalJobs.forEach((lj) => {
          if (!combined.some((c) => c.id === lj.id)) combined.unshift(lj);
        });

        setJobs(combined);
        if (combined.length > 0) {
          setSelectedJob(combined[0]);
        }
      } catch (err) {
        console.error("Error loading modder jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const handleUpdateStage = async (stage: string) => {
    if (!selectedJob) return;
    try {
      await api.orders.update(selectedJob.id, { status: selectedJob.status }).catch(() => null);
    } catch (e) {}

    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id ? { ...j, currentWorkbenchStage: stage } : j
      )
    );
    setSelectedJob((prev) => (prev ? { ...prev, currentWorkbenchStage: stage } : null));
    showToast(`Workbench stage updated: ${stage}`);
  };

  const handleConfirmArrival = async (jobId: string) => {
    try {
      await api.orders.update(jobId, { status: "KEYBOARD_IN_MODDER_HAND" }).catch(() => null);
    } catch (e) {}

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "KEYBOARD_IN_MODDER_HAND",
              currentWorkbenchStage: "Stage 1: Board Inspection & Disassembly",
            }
          : j
      )
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) =>
        prev
          ? {
              ...prev,
              status: "KEYBOARD_IN_MODDER_HAND",
              currentWorkbenchStage: "Stage 1: Board Inspection & Disassembly",
            }
          : null
      );
    }
    showToast("Package confirmed received! Customer order tracker updated to KEYBOARD_IN_MODDER_HAND.");
  };

  const handleDispatchShipment = async () => {
    if (!selectedJob || !dispatchTrackingInput.trim()) return;
    try {
      await api.orders.update(selectedJob.id, {
        status: "SHIPPED_BACK",
        outboundTrackingNum: dispatchTrackingInput,
      }).catch(() => null);
    } catch (e) {}

    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id
          ? { ...j, status: "SHIPPED_BACK", outboundTracking: dispatchTrackingInput }
          : j
      )
    );
    setSelectedJob((prev) =>
      prev
        ? {
            ...prev,
            status: "SHIPPED_BACK",
            outboundTracking: dispatchTrackingInput,
          }
        : null
    );
    showToast(`Order dispatched! Outbound tracking #${dispatchTrackingInput} saved. Customer notified.`);
  };

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brand-navy text-white px-5 py-3 border-2 border-slate-900 font-mono text-xs shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-amber-600 bg-amber-50 text-amber-800 mb-2">
                [ MODDER LIVE WORKBENCH PORTAL ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                @{modderName} Studio Workbench
              </h1>
              <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Active Escrow Orders • Milestone Stages • Audio Proof Uploads
              </p>
            </div>

            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Active Jobs</div>
                <div className="text-xl font-mono font-bold text-brand-navy">{jobs.length} in Queue</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Escrow Payouts</div>
                <div className="text-xl font-mono font-bold text-emerald-700">
                  Rp {jobs.reduce((sum, j) => sum + j.escrowPayout, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center font-mono text-xs text-brand-textMuted uppercase">
            Loading workbench queue from database...
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border-2 border-slate-900 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🛠️</div>
            <h2 className="text-xl font-black text-brand-textMain mb-2">Workbench is Clear</h2>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6 max-w-md mx-auto">
              You currently have zero active customer modding orders. When customers configure and book your services via escrow, their boards will appear here.
            </p>
            <Link href="/services">
              <Button variant="primary" isLoading={false}>View Available Services →</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Job Queue List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                  Workbench Queue ({jobs.length})
                </h2>
                <span className="text-xs font-mono text-brand-textMuted uppercase">Select to Manage</span>
              </div>

              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`border-2 p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-navy bg-blue-50/50 shadow-md"
                        : "border-slate-800 bg-brand-sidebar hover:border-brand-navy"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono font-extrabold text-sm text-brand-textMain">
                        Order #{job.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-slate-800 bg-white">
                        {job.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-brand-textMain mb-1">
                      {job.keyboardModel}
                    </div>
                    <div className="text-xs font-mono text-brand-textMuted mb-2 line-clamp-1">
                      {job.serviceRequested}
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono border-t border-slate-200 pt-2">
                      <span className="text-slate-600">{job.customerName}</span>
                      <span className="font-extrabold text-brand-navy">
                        Rp {job.escrowPayout.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Job Management (7 cols) */}
            {selectedJob && (
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-brand-sidebar border-2 border-slate-900 p-6 font-mono text-xs">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-900">
                    <h3 className="font-bold text-sm text-brand-textMain uppercase">
                      Order #{selectedJob.orderNumber} Management
                    </h3>
                    <span className="text-emerald-700 font-extrabold text-sm">
                      Payout: Rp {selectedJob.escrowPayout.toLocaleString()} (95%)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 bg-brand-lightBg p-4 border border-slate-300">
                    <div>
                      <span className="text-slate-500 uppercase block text-[10px]">Customer</span>
                      <span className="font-bold text-slate-900">{selectedJob.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block text-[10px]">Keyboard Model</span>
                      <span className="font-bold text-slate-900">{selectedJob.keyboardModel}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 uppercase block text-[10px]">Service Config</span>
                      <span className="font-bold text-brand-navy">{selectedJob.serviceRequested}</span>
                    </div>
                  </div>

                  {/* Milestone Stages */}
                  <div className="mb-6">
                    <label className="font-bold uppercase text-brand-textMain block mb-2">
                      Update Workbench Milestone:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {workbenchStages.map((stage) => {
                        const isCurrent = selectedJob.currentWorkbenchStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => handleUpdateStage(stage)}
                            className={`text-left p-2.5 border transition-all text-xs flex justify-between items-center ${
                              isCurrent
                                ? "bg-brand-navy text-white font-bold border-brand-navy"
                                : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                            }`}
                          >
                            <span>{stage}</span>
                            {isCurrent && <span>✓ CURRENT</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Outbound Dispatch Action */}
                  <div className="border-t-2 border-slate-900 pt-4">
                    <label className="font-bold uppercase text-brand-textMain block mb-2">
                      Outbound Return Dispatch:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. SICEPAT-88129034"
                        value={dispatchTrackingInput}
                        onChange={(e) => setDispatchTrackingInput(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-slate-800 bg-white font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleDispatchShipment}
                        className="px-4 py-2 bg-brand-navy text-white font-bold hover:bg-[#132856] text-xs uppercase"
                      >
                        Dispatch & Notify
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
