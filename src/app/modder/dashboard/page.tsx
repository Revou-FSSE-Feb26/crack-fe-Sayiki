"use client";
import { useState } from "react";
import { Button } from "@/components/Button";

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

const initialJobs: ModderJob[] = [
  {
    id: "1",
    orderNumber: "SWL-8942",
    customerName: "Adit Pratama (Jakarta)",
    keyboardModel: "Tofu65 Acrylic Edition",
    serviceRequested: "90x Gateron Linears + Deskeys Films + Krytox 205g0",
    escrowPayout: 831250, // after platform fee
    status: "KEYBOARD_IN_MODDER_HAND",
    inboundTracking: "JP89421098842 (Delivered)",
    outboundTracking: "",
    currentWorkbenchStage: "Stage 3: Stem & Housing Brush Hand-Lubing (205g0)",
    soundTestUploaded: true,
  },
  {
    id: "2",
    orderNumber: "SWL-8945",
    customerName: "Rizal F. (Surabaya)",
    keyboardModel: "Keychron Q1 V2",
    serviceRequested: "Custom Tape Mod, Force Break, & Holee Mod Wire Balancing",
    escrowPayout: 332500,
    status: "CUSTOMER_SENDING_KEYBOARD",
    inboundTracking: "JNE-9918230198 (In Transit)",
    outboundTracking: "",
    currentWorkbenchStage: "Awaiting courier delivery to studio",
    soundTestUploaded: false,
  },
  {
    id: "3",
    orderNumber: "SWL-8949",
    customerName: "Kevin S. (Bandung)",
    keyboardModel: "Zoom75 Wireless",
    serviceRequested: "Hotswap Socket Repair & Stabilizer Tuning",
    escrowPayout: 285000,
    status: "PAID_WAITING_MODDER",
    inboundTracking: "Pending customer dispatch",
    outboundTracking: "",
    currentWorkbenchStage: "Booking reserved, awaiting customer shipment",
    soundTestUploaded: false,
  },
];

const workbenchStages = [
  "Stage 1: Board Inspection & Desoldering",
  "Stage 2: Stem Ultrasonic Cleaning & Drying",
  "Stage 3: Stem & Housing Brush Hand-Lubing (205g0)",
  "Stage 4: Stabilizer Wire Balancing & Holee Mod",
  "Stage 5: Sound Test Audio Recording & QC Check",
  "Stage 6: Reassembly & Final Acoustic Testing",
];

export default function ModderDashboardPage() {
  const [jobs, setJobs] = useState<ModderJob[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<ModderJob>(initialJobs[0]);
  const [dispatchTrackingInput, setDispatchTrackingInput] = useState("SICEPAT-88129034");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStage = (stage: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id ? { ...j, currentWorkbenchStage: stage } : j
      )
    );
    setSelectedJob((prev) => ({ ...prev, currentWorkbenchStage: stage }));
    showToast(`Workbench stage updated: ${stage}`);
  };

  const handleConfirmArrival = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "KEYBOARD_IN_MODDER_HAND",
              currentWorkbenchStage: "Stage 1: Board Inspection & Desoldering",
            }
          : j
      )
    );
    if (selectedJob.id === jobId) {
      setSelectedJob((prev) => ({
        ...prev,
        status: "KEYBOARD_IN_MODDER_HAND",
        currentWorkbenchStage: "Stage 1: Board Inspection & Desoldering",
      }));
    }
    showToast("Package confirmed received! Customer order tracker updated to KEYBOARD_IN_MODDER_HAND.");
  };

  const handleDispatchShipment = () => {
    if (!dispatchTrackingInput.trim()) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id
          ? { ...j, status: "SHIPPED_BACK", outboundTracking: dispatchTrackingInput }
          : j
      )
    );
    setSelectedJob((prev) => ({
      ...prev,
      status: "SHIPPED_BACK",
      outboundTracking: dispatchTrackingInput,
    }));
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
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy">
                  [ CRAFTSMAN WORKBENCH PORTAL ]
                </span>
                <span className="px-2 py-0.5 bg-brand-navy text-white text-xs font-mono font-bold">
                  PRO ARTISAN
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                @DexterKeyboards Studio Workbench
              </h1>
              <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Depok, West Java • Active Bench Queue • Escrow Earnings Management
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6 font-mono text-xs">
              <div>
                <div className="text-[10px] text-brand-textMuted uppercase">Pending Escrow Earnings</div>
                <div className="text-xl font-black text-brand-navy">Rp 4,850,000</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-[10px] text-brand-textMuted uppercase">Active Jobs</div>
                <div className="text-xl font-black text-slate-800">{jobs.length} Boards</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Job Queue List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                Assigned Workbench Queue ({jobs.length})
              </h2>
              <span className="text-[11px] font-mono text-brand-textMuted">Select to manage</span>
            </div>

            <div className="space-y-3">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJob.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`border-2 p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-navy bg-brand-sidebar shadow-md"
                        : "border-slate-300 bg-white hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 font-mono text-xs">
                      <span className="font-bold text-brand-navy">#{job.orderNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          job.status === "KEYBOARD_IN_MODDER_HAND"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : job.status === "SHIPPED_BACK"
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-slate-100 text-slate-800 border border-slate-300"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-brand-textMain mb-1">{job.keyboardModel}</h3>
                    <p className="text-xs text-brand-textMuted font-mono mb-3">{job.customerName}</p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-mono">
                      <span className="text-slate-500 text-[11px]">Payout:</span>
                      <span className="font-black text-emerald-700">Rp {job.escrowPayout.toLocaleString()}</span>
                    </div>

                    {job.status === "CUSTOMER_SENDING_KEYBOARD" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmArrival(job.id);
                        }}
                        className="mt-3 w-full py-1.5 bg-brand-navy text-white font-mono text-xs font-bold uppercase hover:bg-[#132856]"
                      >
                        ✓ Confirm Package Received
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Workbench Action Hub (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Job Header */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <div className="flex justify-between items-start pb-3 mb-4 border-b-2 border-slate-900">
                <div>
                  <span className="text-xs font-mono text-brand-textMuted uppercase">Active Workbench Terminal</span>
                  <h2 className="text-2xl font-black text-brand-textMain">
                    {selectedJob.keyboardModel} • #{selectedJob.orderNumber}
                  </h2>
                  <p className="text-xs font-mono text-brand-navy font-bold mt-0.5">
                    Customer: {selectedJob.customerName}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-brand-textMuted uppercase block">Escrow Fee Held</span>
                  <span className="text-xl font-black text-emerald-700">
                    Rp {selectedJob.escrowPayout.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Service Specifications */}
              <div className="bg-brand-lightBg border-2 border-slate-800 p-3.5 mb-6 font-mono text-xs space-y-1.5">
                <div className="text-brand-textMuted uppercase text-[10px] font-bold">Service Instructions:</div>
                <div className="font-bold text-slate-900">{selectedJob.serviceRequested}</div>
                <div className="text-slate-500 text-[11px]">Inbound Tracking: {selectedJob.inboundTracking}</div>
              </div>

              {/* STAGE SELECTOR */}
              <div className="mb-6">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-3">
                  Live Workbench Stage (Updates Customer Escrow Tracker in Real-Time):
                </h3>
                <div className="space-y-2">
                  {workbenchStages.map((stage, idx) => {
                    const isSelectedStage = selectedJob.currentWorkbenchStage === stage;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUpdateStage(stage)}
                        className={`w-full text-left p-2.5 font-mono text-xs border-2 flex items-center justify-between transition-all ${
                          isSelectedStage
                            ? "border-brand-navy bg-brand-lightBg font-bold text-brand-navy"
                            : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span>{stage}</span>
                        {isSelectedStage && <span className="text-brand-navy font-bold">● ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SOUND TEST UPLOAD SIMULATION */}
              <div className="border-2 border-slate-800 p-4 bg-white mb-6 font-mono text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold uppercase text-brand-textMain">
                    🎵 Studio Sound Test Audio Clip
                  </span>
                  <span className="text-emerald-700 font-bold">[ ATTACHED & VERIFIED ]</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Customer must hear this audio clip before confirming satisfaction and releasing your escrow payout.
                </p>
                <div className="flex items-center gap-3 bg-brand-lightBg p-3 border border-slate-300">
                  <button
                    type="button"
                    onClick={() => showToast("Playing studio sound test recording (0:45 WAV)...")}
                    className="w-8 h-8 bg-brand-navy text-white flex items-center justify-center font-bold shrink-0 hover:bg-[#132856]"
                  >
                    ▶
                  </button>
                  <div className="flex-1 text-[11px]">
                    <div className="font-bold">tofu65_lubed_linears_test.wav</div>
                    <div className="text-slate-400">Recorded on Shure SM7B • PC Plate Acoustic Profile</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("Audio clip replaced with new recording.")}
                    className="px-2.5 py-1 bg-white border border-slate-400 text-[10px] font-bold hover:bg-slate-100"
                  >
                    Replace Clip
                  </button>
                </div>
              </div>

              {/* OUTBOUND COURIER DISPATCH */}
              <div className="border-2 border-slate-900 p-4 bg-brand-lightBg font-mono text-xs">
                <h3 className="font-bold uppercase tracking-wider text-brand-textMain mb-2">
                  Outbound Shipping Dispatch (Modder ➔ Customer)
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Once your modding and sound testing are complete, enter the courier tracking code to update the order to SHIPPED_BACK.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    value={dispatchTrackingInput}
                    onChange={(e) => setDispatchTrackingInput(e.target.value)}
                    placeholder="Enter Tracking Number (e.g. SICEPAT-88129034)"
                    className="flex-1 px-3.5 py-2.5 border-2 border-slate-800 bg-white font-mono text-xs focus:outline-none focus:border-brand-navy"
                  />
                  <Button
                    variant="primary"
                    isLoading={false}
                    onClick={handleDispatchShipment}
                    className="w-auto px-5 py-2.5 whitespace-nowrap text-xs uppercase"
                  >
                    Ship Back & Update Status →
                  </Button>
                </div>

                {selectedJob.outboundTracking && (
                  <div className="bg-emerald-50 border border-emerald-300 p-2 text-emerald-800 text-[11px]">
                    ✓ Dispatched with tracking: <span className="font-bold">{selectedJob.outboundTracking}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
