"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { api, syncAuthCookies } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

interface ModderJob {
  id: string;
  orderNumber: string;
  customerName: string;
  keyboardModel: string;
  serviceRequested: string;
  deliveryMethod: "COURIER" | "WALK_IN" | string;
  escrowPayout: number;
  totalPrice: number;
  status: "PAID_WAITING_MODDER" | "CUSTOMER_SENDING_KEYBOARD" | "KEYBOARD_IN_MODDER_HAND" | "SHIPPED_BACK" | "SUCCESS" | "UNDER_DISPUTE" | "UNPAID" | "PENDING_ADMIN_VERIFICATION" | string;
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

const getCategoryFallbackImage = (category?: string) => {
  switch (category) {
    case "SWITCH_MODS":
      return "/images/lubing-swtiches.webp";
    case "STABILIZER_MODS":
      return "/images/stabs.webp";
    case "CASE_AND_ACOUSTIC":
      return "/images/foam.jpg";
    case "CUSTOMIZATION_AESTHETICS":
    default:
      return "/images/repair-kb.png";
  }
};

export default function ModderDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<ModderJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ModderJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [modderName, setModderName] = useState("Modder");
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [dispatchTrackingInput, setDispatchTrackingInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "SERVICES">("ACTIVE");
  const [myServices, setMyServices] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setMounted(true);
    let currentUserId: string | null = null;
    let userObj: any = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        userObj = JSON.parse(storedUser);
        setCurrentUser(userObj);
        if (userObj.name) setModderName(userObj.name);
        if (userObj.id) {
          currentUserId = userObj.id;
          setLoggedInUserId(userObj.id);
        }
        syncAuthCookies();
      }
    } catch (e) {}

    // Strict Role check: If guest or customer, redirect immediately
    if (!userObj) {
      setLoading(false);
      router.replace("/login?redirect=/modder/dashboard");
      return;
    }
    const role = String(userObj.role || "").toUpperCase();
    if (role !== "MODDER" && role !== "ADMIN") {
      setLoading(false);
      router.replace("/orders?error=unauthorized_modder_access");
      return;
    }

    async function loadJobs() {
      try {
        setLoading(true);
        const data = await api.orders.getAll({ modderId: currentUserId || undefined }).catch(() => []);
        const dbOrders = Array.isArray(data) ? data : [];

        let localOrders: any[] = [];
        try {
          const stored = localStorage.getItem("switchlab_orders");
          if (stored) localOrders = JSON.parse(stored);
        } catch (e) {}

        // Filter out UNPAID and PENDING_ADMIN_VERIFICATION orders:
        // Modder must NOT work on jobs where escrow deposit is unverified!
        const filteredDb = dbOrders.filter((b: any) => {
          // Strictly verify assignment to this modder:
          if (userObj?.id) {
            const matchesId = b.modderId === userObj.id || b.modder?.id === userObj.id;
            const matchesEmail = userObj.email && b.modder?.email?.toLowerCase() === userObj.email.toLowerCase();
            const matchesName = userObj.name && b.modder?.name?.toLowerCase() === userObj.name.toLowerCase();
            if (!matchesId && !matchesEmail && !matchesName) {
              return false;
            }
          }
          // Do not show unpaid or unverified orders in the active workbench
          return b.status !== "UNPAID" && b.status !== "PENDING_ADMIN_VERIFICATION";
        });

        const mappedDbJobs: ModderJob[] = filteredDb.map((b: any) => ({
          id: b.id,
          orderNumber: b.id.slice(0, 8).toUpperCase(),
          customerName: `${b.customer?.name || "Customer"} (${b.customer?.locationCity || "Indonesia"})`,
          keyboardModel: b.keyboardModel || "Custom Keyboard",
          serviceRequested: b.items?.[0]?.service?.title || "Keyboard Modding Service",
          deliveryMethod: b.deliveryMethod || "COURIER",
          totalPrice: b.totalPrice,
          escrowPayout: Math.round(b.totalPrice * 0.95),
          status: b.status,
          inboundTracking: b.inboundTrackingNum || (b.deliveryMethod === "WALK_IN" ? "Studio Walk-In Dropoff" : "Pending Inbound"),
          outboundTracking: b.outboundTrackingNum || "",
          currentWorkbenchStage: b.status === "KEYBOARD_IN_MODDER_HAND" 
            ? "Stage 3: Brush Hand-Lubing & Filming" 
            : b.status === "SHIPPED_BACK" || b.status === "SUCCESS"
            ? "Stage 6: Reassembly & Final Acoustic Testing"
            : "Stage 1: Board Inspection & Disassembly",
          soundTestUploaded: b.status === "SHIPPED_BACK" || b.status === "SUCCESS",
        }));

        // Filter local storage test orders: strictly assigned to this modder
        const filteredLocal = (Array.isArray(localOrders) ? localOrders : []).filter((o: any) => {
          if (userObj?.id && o.modderId && o.modderId !== userObj.id) return false;
          if (userObj?.name && o.modder && !o.modder.toLowerCase().includes(userObj.name.toLowerCase())) return false;
          return o.status !== "UNPAID" && o.status !== "PENDING_ADMIN_VERIFICATION";
        });

        const mappedLocalJobs: ModderJob[] = filteredLocal.map((o: any) => ({
          id: o.id,
          orderNumber: o.id.length > 8 ? o.id.slice(0, 8).toUpperCase() : o.id,
          customerName: "Verified Customer (Jakarta)",
          keyboardModel: o.keyboardModel || "Custom Keyboard Build",
          serviceRequested: o.service || "Linear Switch Lubing & Tuning",
          deliveryMethod: o.deliveryMethod || "COURIER",
          totalPrice: o.totalPrice || 63000,
          escrowPayout: Math.round((o.totalPrice || 63000) * 0.95),
          status: o.status || "PAID_WAITING_MODDER",
          inboundTracking: o.deliveryMethod === "WALK_IN" ? "Studio Walk-In Handover" : "Pending Courier",
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

        // Load active services published by this modder
        try {
          const allListings = await api.listings.getAll().catch(() => []);
          if (Array.isArray(allListings)) {
            const myFiltered = allListings.filter((s: any) => {
              if (userObj?.id && (s.modderId === userObj.id || s.modder?.id === userObj.id)) return true;
              if (userObj?.name && s.modder?.name?.toLowerCase() === userObj.name.toLowerCase()) return true;
              if (userObj?.email && s.modder?.email?.toLowerCase() === userObj.email.toLowerCase()) return true;
              return false;
            });
            setMyServices(myFiltered);
          }
        } catch (e) {}
      } catch (err) {
        console.error("Error loading modder jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("tab") === "services") {
        setActiveTab("SERVICES");
      }
      if (searchParams.get("created") === "true") {
        showToast("🎉 Service listing published to Marketplace successfully!");
      }
    }

    loadJobs();
  }, []);

  const handleDeleteService = async (serviceId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the marketplace?`)) return;
    setActionLoading(`del_${serviceId}`);
    try {
      await api.listings.delete(serviceId);
      setMyServices((prev) => prev.filter((s) => s.id !== serviceId));
      showToast(`Listing "${title}" removed from marketplace.`);
    } catch (err: any) {
      alert(err.message || "Failed to remove listing.");
    } finally {
      setActionLoading(null);
    }
  };

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

  // Modder Accepts Job
  const handleAcceptJob = async (jobId: string) => {
    setActionLoading(jobId + "_accept");
    const nextStatus = "CUSTOMER_SENDING_KEYBOARD";

    // Optimistically update UI immediately
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    // Update local storage if present
    try {
      const stored = localStorage.getItem("switchlab_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((o: any) =>
            o.id === jobId ? { ...o, status: nextStatus, statusLabel: "CUSTOMER SENDING KEYBOARD" } : o
          );
          localStorage.setItem("switchlab_orders", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (e) {}

    // Notify Customer
    addNotification({
      targetRole: "CUSTOMER",
      type: "WORKBENCH",
      title: "🛠️ Modder Accepted Your Job!",
      message: `Modder accepted Order #${jobId}. Please prepare and dispatch or drop off your keyboard to the studio!`,
      orderId: jobId,
      link: `/orders/${jobId}`,
    });

    try {
      await api.orders.update(jobId, { status: nextStatus }).catch(() => null);
      showToast("✓ Booking Accepted! Customer notified to drop off or ship their keyboard.");
    } finally {
      setActionLoading(null);
    }
  };

  // Modder Cancels / Declines Job
  const handleCancelJob = async (jobId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to decline/cancel this order? Escrow will be marked as UNDER_DISPUTE so admin can refund the customer."
    );
    if (!confirmed) return;

    setActionLoading(jobId + "_cancel");

    // Optimistically update UI immediately
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "UNDER_DISPUTE" } : j))
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: "UNDER_DISPUTE" } : null));
    }

    // Update local storage if present
    try {
      const stored = localStorage.getItem("switchlab_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((o: any) =>
            o.id === jobId ? { ...o, status: "UNDER_DISPUTE", statusLabel: "UNDER DISPUTE" } : o
          );
          localStorage.setItem("switchlab_orders", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (e) {}

    // Notify Customer and Admin
    addNotification({
      targetRole: "CUSTOMER",
      type: "ORDER",
      title: "⚠️ Order Marked Under Dispute",
      message: `Order #${jobId} was declined by modder. Escrow funds are flagged for admin refund.`,
      orderId: jobId,
      link: `/orders/${jobId}`,
    });

    addNotification({
      targetRole: "ADMIN",
      type: "PAYOUT",
      title: "⚠️ Modder Cancelled Order",
      message: `Order #${jobId} was marked as UNDER_DISPUTE by modder. Escrow resolution required.`,
      orderId: jobId,
      link: "/admin",
    });

    try {
      await api.orders.update(jobId, { status: "UNDER_DISPUTE" }).catch(() => null);
      showToast("✕ Order cancelled by modder. Marked as UNDER_DISPUTE for escrow refund.");
    } finally {
      setActionLoading(null);
    }
  };

  // Modder Confirms Arrival
  const handleConfirmArrival = async (jobId: string) => {
    setActionLoading(jobId + "_arrival");

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

    // Update local storage if present
    try {
      const stored = localStorage.getItem("switchlab_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((o: any) =>
            o.id === jobId ? { ...o, status: "KEYBOARD_IN_MODDER_HAND", statusLabel: "KEYBOARD ON MODDER WORKBENCH" } : o
          );
          localStorage.setItem("switchlab_orders", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (e) {}

    // Notify Customer
    addNotification({
      targetRole: "CUSTOMER",
      type: "WORKBENCH",
      title: "📥 Keyboard Received on Workbench",
      message: `Your keyboard has arrived safely at the modder's studio for Order #${jobId}. Tuning is now underway!`,
      orderId: jobId,
      link: `/orders/${jobId}`,
    });

    try {
      await api.orders.update(jobId, { status: "KEYBOARD_IN_MODDER_HAND" }).catch(() => null);
      showToast("Keyboard arrival confirmed! Customer order tracker updated to KEYBOARD_IN_MODDER_HAND.");
    } finally {
      setActionLoading(null);
    }
  };

  // Modder Dispatches Outbound
  const handleDispatchShipment = async () => {
    if (!selectedJob) return;
    setActionLoading(selectedJob.id + "_dispatch");

    const trackingCode = selectedJob.deliveryMethod === "WALK_IN"
      ? "STUDIO-HANDOFF-COMPLETED"
      : dispatchTrackingInput.trim() || "SICEPAT-MOD-DISPATCH";

    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id
          ? { ...j, status: "SHIPPED_BACK", outboundTracking: trackingCode }
          : j
      )
    );
    setSelectedJob((prev) =>
      prev
        ? {
            ...prev,
            status: "SHIPPED_BACK",
            outboundTracking: trackingCode,
          }
        : null
    );

    // Update local storage if present
    try {
      const stored = localStorage.getItem("switchlab_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((o: any) =>
            o.id === selectedJob.id ? {
              ...o,
              status: "SHIPPED_BACK",
              outboundTrackingNum: trackingCode,
              statusLabel: "BUILD FINISHED • READY TO SEND / PICKUP",
              badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-600 font-black",
            } : o
          );
          localStorage.setItem("switchlab_orders", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (e) {}

    // Notify Customer
    addNotification({
      targetRole: "CUSTOMER",
      type: "WORKBENCH",
      title: "🚀 Build Finished & Ready!",
      message: `Modder finished tuning Order #${selectedJob.id} (${trackingCode}). Sound test your board and release escrow!`,
      orderId: selectedJob.id,
      link: `/orders/${selectedJob.id}`,
    });

    try {
      await api.orders.update(selectedJob.id, {
        status: "SHIPPED_BACK",
        outboundTrackingNum: trackingCode,
      }).catch(() => null);

      showToast(
        selectedJob.deliveryMethod === "WALK_IN"
          ? "Build completed! Customer notified for Studio Walk-In pickup."
          : `Order dispatched! Outbound tracking #${trackingCode} logged. Customer notified.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const activeJobs = jobs.filter((j) => j.status !== "SUCCESS" && j.status !== "UNDER_DISPUTE");
  const completedJobs = jobs.filter((j) => j.status === "SUCCESS" || j.status === "UNDER_DISPUTE");
  const displayedJobs = activeTab === "ACTIVE" ? activeJobs : completedJobs;

  // Full-screen guard: Customers and Guests CANNOT see or access the modder workbench
  const userRole = String(currentUser?.role || "").toUpperCase();
  if (mounted && (!currentUser || (userRole !== "MODDER" && userRole !== "ADMIN"))) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-slate-900 p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 border-2 border-red-600 text-red-600 flex items-center justify-center mx-auto mb-4 text-3xl font-mono">
            ⛔
          </div>
          <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-red-600 bg-red-50 text-red-700 mb-2">
            [ 403 FORBIDDEN • ACCESS DENIED ]
          </span>
          <h1 className="text-2xl font-black text-brand-textMain mb-2">
            Modder Workbench Restricted
          </h1>
          <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6">
            You are logged in as a <strong>{currentUser?.role || "GUEST"}</strong>. The Workbench is strictly reserved for verified modders and studio operators.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/orders">
              <Button variant="primary" isLoading={false} className="w-full text-xs uppercase font-mono font-bold">
                Go to My Customer Orders →
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" isLoading={false} className="w-full text-xs uppercase font-mono font-bold">
                Switch to Modder Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-amber-600 bg-amber-50 text-amber-800">
                  [ MODDER LIVE WORKBENCH PORTAL ]
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-slate-900 bg-white text-slate-800 shadow-xs">
                  📍 Studio: {currentUser?.locationCity || "Jakarta, Indonesia"}
                </span>
                <Link
                  href="/profile"
                  className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-slate-900 bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  ✏️ Edit Profile & Location
                </Link>
                <Link
                  href="/modder/create-listing"
                  className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-slate-900 bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  ➕ Create Service / Sell
                </Link>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                @{modderName} Studio Workbench
              </h1>
              <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Verified Escrow Orders • Milestone Stages • Outbound Dispatch
              </p>
            </div>

            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Active Escrow Jobs</div>
                <div className="text-xl font-mono font-bold text-brand-navy">
                  {loading ? "..." : `${activeJobs.length} Verified`}
                </div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Escrow Payouts</div>
                <div className="text-xl font-mono font-bold text-emerald-700">
                  {loading ? "..." : `Rp ${activeJobs.reduce((sum, j) => sum + j.escrowPayout, 0).toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-slate-900 pb-2 font-mono text-xs font-bold uppercase">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ACTIVE");
              if (activeJobs.length > 0) setSelectedJob(activeJobs[0]);
            }}
            className={`px-4 py-2 border-2 transition-all ${
              activeTab === "ACTIVE"
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
            }`}
          >
            Active Queue ({activeJobs.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("COMPLETED");
              if (completedJobs.length > 0) setSelectedJob(completedJobs[0]);
            }}
            className={`px-4 py-2 border-2 transition-all ${
              activeTab === "COMPLETED"
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
            }`}
          >
            Completed / Resolved ({completedJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SERVICES")}
            className={`px-4 py-2 border-2 transition-all inline-flex items-center gap-1.5 ${
              activeTab === "SERVICES"
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
            }`}
          >
            <span>🏷️ My Services & Listings ({myServices.length})</span>
          </button>
        </div>

        {activeTab === "SERVICES" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border-2 border-slate-900 shadow-xs">
              <div>
                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-brand-textMain">
                  🏷️ Your Studio Tuning Services & Marketplace Listings ({myServices.length})
                </h2>
                <p className="text-xs font-mono text-brand-textMuted mt-0.5">
                  Published services appear in the Services Catalog and Marketplace for customers to book with Escrow protection.
                </p>
              </div>
              <Link href="/modder/create-listing">
                <Button variant="primary" className="text-xs uppercase font-bold shrink-0">
                  ➕ Create New Service Listing →
                </Button>
              </Link>
            </div>

            {myServices.length === 0 ? (
              <div className="bg-white border-2 border-slate-900 p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">🎨</div>
                <h2 className="text-xl font-black text-brand-textMain mb-2">
                  No Services Listed in Marketplace Yet
                </h2>
                <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6 max-w-md mx-auto">
                  You haven&apos;t listed any custom keyboard tuning services or builds yet. Publish your first listing to start receiving customer orders through SwitchLab&apos;s Escrow platform!
                </p>
                <Link href="/modder/create-listing">
                  <Button variant="primary" className="text-xs uppercase font-bold">
                    ➕ Create Your First Service Listing →
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myServices.map((service) => (
                  <div key={service.id} className="bg-white border-2 border-slate-900 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-brand-navy bg-brand-lightBg text-brand-navy">
                          {service.category?.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold font-mono">
                          ✓ Live in Marketplace
                        </span>
                      </div>

                      <div className="h-36 bg-brand-lightBg overflow-hidden border border-slate-300 mb-3">
                        <img
                          src={service.imageUrl || getCategoryFallbackImage(service.category)}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h3 className="font-bold text-base text-brand-textMain mb-2 leading-tight">
                        {service.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed font-mono">
                        {service.description}
                      </p>

                      <div className="p-3 bg-brand-lightBg border border-slate-200 mb-4">
                        <div className="text-[10px] uppercase text-brand-textMuted font-mono">Base Price</div>
                        <div className="text-base font-bold text-brand-navy font-mono">
                          Rp {Number(service.basePrice || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                          Escrow Payout: Rp {Math.round(Number(service.basePrice || 0) * 0.95).toLocaleString()} (95%)
                        </div>
                      </div>

                      {service.options && service.options.length > 0 && (
                        <div className="mb-4">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1 font-mono">
                            Available Upgrades ({service.options.length}):
                          </span>
                          <div className="space-y-1">
                            {service.options.map((opt: any, i: number) => (
                              <div key={i} className="text-[10px] text-slate-700 flex justify-between font-mono">
                                <span className="truncate max-w-[170px]">• {opt.optionName}</span>
                                <span className="font-bold text-slate-900">+Rp {Number(opt.extraPrice || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <Link href={`/service/${service.id}`} className="text-xs text-brand-navy font-bold hover:underline font-mono">
                        View Live ↗
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service.id, service.title)}
                        disabled={actionLoading === `del_${service.id}`}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-500 bg-red-50 transition-colors uppercase cursor-pointer"
                      >
                        {actionLoading === `del_${service.id}` ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center font-mono text-xs text-brand-textMuted uppercase">
            <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
            <h2 className="text-base font-bold text-brand-textMain">Loading Workbench Queue...</h2>
            <p className="mt-1">Syncing verified escrow bookings from database</p>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="bg-white border-2 border-slate-900 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🛠️</div>
            <h2 className="text-xl font-black text-brand-textMain mb-2">
              {activeTab === "ACTIVE" ? "Workbench Queue is Clear" : "No Completed Orders"}
            </h2>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6 max-w-md mx-auto">
              {activeTab === "ACTIVE"
                ? "Only orders with verified escrow deposits appear here. Once admin verifies pending customer payments in the Escrow Vault, your new jobs will appear ready for acceptance."
                : "Completed jobs and release receipts will be logged here."}
            </p>
            <div className="flex justify-center gap-3">
              <a href="/admin">
                <Button variant="secondary" isLoading={false} className="text-xs">
                  ⚡ Open Admin Vault (Verify Pending Transfers)
                </Button>
              </a>
              <Link href="/services">
                <Button variant="primary" isLoading={false} className="text-xs">
                  View Modding Services →
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Job Queue List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                  {activeTab === "ACTIVE" ? "Verified Escrow Queue" : "Archived Orders"} ({displayedJobs.length})
                </h2>
                <span className="text-xs font-mono text-brand-textMuted uppercase">Select to Manage</span>
              </div>

              {displayedJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isAwaitingAccept = job.status === "PAID_WAITING_MODDER";
                const isDisputed = job.status === "UNDER_DISPUTE";

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
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                          isAwaitingAccept
                            ? "bg-amber-50 text-amber-800 border-amber-500"
                            : isDisputed
                            ? "bg-rose-50 text-rose-800 border-rose-500"
                            : job.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-500"
                            : "bg-blue-50 text-brand-navy border-brand-navy"
                        }`}
                      >
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
                      <span className="text-slate-600 truncate max-w-[160px]">{job.customerName}</span>
                      <span className="font-extrabold text-emerald-700">
                        Payout: Rp {job.escrowPayout.toLocaleString()}
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

                  {/* Accept or Decline Action Box if PAID_WAITING_MODDER */}
                  {selectedJob.status === "PAID_WAITING_MODDER" && (
                    <div className="bg-amber-50 border-2 border-amber-500 p-4 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold uppercase text-amber-900 block mb-1">
                            ⚡ New Escrow Booking Awaiting Modder Acceptance
                          </span>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Payment has been verified by the Admin in Escrow Vault. Accept the job to prompt customer handoff, or decline if your studio queue is full.
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={actionLoading !== null}
                            onClick={() => handleAcceptJob(selectedJob.id)}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
                          >
                            {actionLoading === selectedJob.id + "_accept" ? (
                              <>
                                <span className="animate-spin inline-block font-mono">⚙️</span>
                                <span>Accepting...</span>
                              </>
                            ) : (
                              "✓ Accept Job"
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading !== null}
                            onClick={() => handleCancelJob(selectedJob.id)}
                            className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-60 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
                          >
                            {actionLoading === selectedJob.id + "_cancel" ? (
                              <>
                                <span className="animate-spin inline-block font-mono">⚙️</span>
                                <span>Declining...</span>
                              </>
                            ) : (
                              "✕ Decline Job"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Job Overview Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6 bg-brand-lightBg p-4 border border-slate-300">
                    <div>
                      <span className="text-slate-500 uppercase block text-[10px]">Customer</span>
                      <span className="font-bold text-slate-900">{selectedJob.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block text-[10px]">Keyboard Target</span>
                      <span className="font-bold text-slate-900">{selectedJob.keyboardModel}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 uppercase block text-[10px]">Service Config</span>
                      <span className="font-bold text-brand-navy">{selectedJob.serviceRequested}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block text-[10px]">Delivery Channel</span>
                      <span className="font-bold text-slate-900">
                        {selectedJob.deliveryMethod === "WALK_IN" ? "🏢 Studio Walk-In" : "🚚 Courier Shipping"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block text-[10px]">Current Status</span>
                      <span className="font-bold text-brand-terracotta">{selectedJob.status}</span>
                    </div>
                  </div>

                  {/* Arrival Confirmation Action if CUSTOMER_SENDING_KEYBOARD */}
                  {selectedJob.status === "CUSTOMER_SENDING_KEYBOARD" && (
                    <div className="bg-blue-50 border-2 border-brand-navy p-4 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold uppercase text-brand-navy block mb-1">
                            📦 Package Inbound Awaiting Confirmation
                          </span>
                          <p className="text-[11px] text-slate-700">
                            {selectedJob.deliveryMethod === "WALK_IN"
                              ? "Customer dropped off the keyboard at your studio? Confirm receipt to begin tuning."
                              : "Did the courier deliver the customer's keyboard to your studio?"}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={actionLoading !== null}
                          onClick={() => handleConfirmArrival(selectedJob.id)}
                          className="px-4 py-2 bg-brand-navy hover:bg-[#132856] disabled:opacity-60 text-white font-bold text-xs uppercase shrink-0 flex items-center gap-1.5 transition-all"
                        >
                          {actionLoading === selectedJob.id + "_arrival" ? (
                            <>
                              <span className="animate-spin inline-block font-mono">⚙️</span>
                              <span>Confirming...</span>
                            </>
                          ) : (
                            "✓ Confirm Arrival (Move to Workbench)"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

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
                  <div className="border-t-2 border-slate-900 pt-4 mb-6">
                    <label className="font-bold uppercase text-brand-textMain block mb-2">
                      {selectedJob.deliveryMethod === "WALK_IN"
                        ? "Complete & Notify Customer for Pickup:"
                        : "Outbound Return Dispatch (Modder ➔ Customer):"}
                    </label>

                    {selectedJob.deliveryMethod === "WALK_IN" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionLoading !== null}
                          onClick={handleDispatchShipment}
                          className="w-full py-2.5 bg-brand-navy text-white font-bold hover:bg-[#132856] disabled:opacity-60 text-xs uppercase flex items-center justify-center gap-1.5 transition-all"
                        >
                          {actionLoading === selectedJob.id + "_dispatch" ? (
                            <>
                              <span className="animate-spin inline-block font-mono">⚙️</span>
                              <span>Completing...</span>
                            </>
                          ) : (
                            "✓ Mark Build Finished & Notify for Studio Pickup"
                          )}
                        </button>
                      </div>
                    ) : (
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
                          disabled={actionLoading !== null}
                          onClick={handleDispatchShipment}
                          className="px-4 py-2 bg-brand-navy text-white font-bold hover:bg-[#132856] disabled:opacity-60 text-xs uppercase flex items-center gap-1.5 transition-all"
                        >
                          {actionLoading === selectedJob.id + "_dispatch" ? (
                            <>
                              <span className="animate-spin inline-block font-mono">⚙️</span>
                              <span>Dispatching...</span>
                            </>
                          ) : (
                            "Dispatch & Notify"
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cancel / Dispute Job Option for Active Job */}
                  {selectedJob.status !== "UNDER_DISPUTE" && selectedJob.status !== "SUCCESS" && (
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Encountered an issue or damaged PCB?</span>
                      <button
                        type="button"
                        onClick={() => handleCancelJob(selectedJob.id)}
                        className="text-xs text-rose-700 hover:text-rose-900 font-bold uppercase underline"
                      >
                        ✕ Cancel / Dispute Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
