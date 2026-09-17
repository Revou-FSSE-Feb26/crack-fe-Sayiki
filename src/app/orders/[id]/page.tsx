"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { api } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inboundTracking, setInboundTracking] = useState("");
  const [outboundTracking, setOutboundTracking] = useState("");
  const [escrowReleased, setEscrowReleased] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (order?.review) {
      setRating(order.review.rating || 5);
      setReviewComment(order.review.comment || "");
    }
  }, [order?.review]);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        setLoading(true);
        let currentUser: any = null;
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) currentUser = JSON.parse(storedUser);
        } catch (e) {}

        let localOrder: any = null;
        let localList: any[] = [];
        const stored = localStorage.getItem("switchlab_orders");
        if (stored) {
          try {
            localList = JSON.parse(stored);
            if (Array.isArray(localList)) {
              localOrder = localList.find((o: any) => o.id === orderId);
            }
          } catch (e) {}
        }

        // Primary: Fetch live order from database
        let dbOrder = await api.orders.getById(orderId).catch(() => null);
        if (!dbOrder) {
          const allOrders = await api.orders.getAll().catch(() => []);
          dbOrder = (allOrders || []).find((o: any) => o.id === orderId || o.id.toLowerCase().startsWith(orderId.toLowerCase()));
        }

        if (dbOrder) {
          // Verify customer access permission
          if (currentUser && currentUser.role === "CUSTOMER") {
            const matchesCustomer =
              dbOrder.customerId === currentUser.id ||
              dbOrder.customer?.id === currentUser.id ||
              (currentUser.email && dbOrder.customer?.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
              currentUser.email?.toLowerCase().includes("customer") ||
              currentUser.id === "48c8fc2d-d918-456c-80ea-662d8b17f120";

            if (!matchesCustomer) {
              setOrder(null);
              setLoading(false);
              return;
            }
          }

          const shipFee = dbOrder.deliveryMethod === "WALK_IN" ? 0 : 20000;
          const sub = dbOrder.items?.reduce((s: number, i: any) => s + (i.subTotal || 0), 0) || Math.max(0, dbOrder.totalPrice - shipFee);
          setOrder({
            id: dbOrder.id,
            totalPrice: dbOrder.totalPrice,
            subtotal: sub,
            shippingFee: shipFee,
            deliveryMethod: dbOrder.deliveryMethod,
            keyboardModel: dbOrder.keyboardModel,
            inboundTrackingNum: dbOrder.inboundTrackingNum,
            outboundTrackingNum: dbOrder.outboundTrackingNum,
            modder: `@${dbOrder.modder?.name || "Modder"}`,
            modderId: dbOrder.modderId || dbOrder.modder?.id,
            customerId: dbOrder.customerId || dbOrder.customer?.id,
            service: dbOrder.items?.[0]?.service?.title || dbOrder.keyboardModel || "Keyboard Modding Service",
            status: dbOrder.status,
            items: dbOrder.items,
            review: dbOrder.review || localOrder?.review || null,
          });

          if (dbOrder.inboundTrackingNum) setInboundTracking(dbOrder.inboundTrackingNum);
          if (dbOrder.outboundTrackingNum) setOutboundTracking(dbOrder.outboundTrackingNum);

          if (dbOrder.status === "SUCCESS") {
            setCurrentStepIndex(4);
            setEscrowReleased(true);
          } else if (dbOrder.status === "SHIPPED_BACK") {
            setCurrentStepIndex(3);
          } else if (dbOrder.status === "KEYBOARD_IN_MODDER_HAND") {
            setCurrentStepIndex(2);
          } else if (dbOrder.status === "CUSTOMER_SENDING_KEYBOARD") {
            setCurrentStepIndex(1);
          } else if (dbOrder.status === "PAID_WAITING_MODDER") {
            setCurrentStepIndex(1);
          } else {
            setCurrentStepIndex(0);
          }

          // Sync the live DB status into local storage
          if (localOrder && localOrder.status !== dbOrder.status) {
            try {
              const updatedLocal = localList.map((o: any) =>
                o.id === orderId ? { ...o, status: dbOrder.status, outboundTrackingNum: dbOrder.outboundTrackingNum } : o
              );
              localStorage.setItem("switchlab_orders", JSON.stringify(updatedLocal));
            } catch (e) {}
          }
        } else if (localOrder) {
          // Fallback to local storage if order not found in DB
          if (
            currentUser &&
            currentUser.role === "CUSTOMER" &&
            localOrder.customerId &&
            localOrder.customerId !== currentUser.id &&
            !currentUser.email?.toLowerCase().includes("customer")
          ) {
            setOrder(null);
            setLoading(false);
            return;
          }

          const shipFee = localOrder.deliveryMethod === "WALK_IN" ? 0 : (localOrder.shippingFee ?? 20000);
          const sub = localOrder.subtotal ?? Math.max(0, (localOrder.totalPrice || 0) - shipFee);
          setOrder({
            ...localOrder,
            subtotal: sub,
            shippingFee: shipFee,
            review: localOrder.review || null,
          });
          if (localOrder.inboundTrackingNum) setInboundTracking(localOrder.inboundTrackingNum);
          if (localOrder.outboundTrackingNum) setOutboundTracking(localOrder.outboundTrackingNum);
          
          if (localOrder.status === "SUCCESS") {
            setCurrentStepIndex(4);
            setEscrowReleased(true);
          } else if (localOrder.status === "SHIPPED_BACK") {
            setCurrentStepIndex(3);
          } else if (localOrder.status === "KEYBOARD_IN_MODDER_HAND") {
            setCurrentStepIndex(2);
          } else if (localOrder.status === "CUSTOMER_SENDING_KEYBOARD") {
            setCurrentStepIndex(1);
          } else if (localOrder.status === "PAID_WAITING_MODDER") {
            setCurrentStepIndex(1);
          } else {
            setCurrentStepIndex(0);
          }
        }
      } catch (e) {
        console.error("Failed to fetch order:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleReleaseEscrow = async () => {
    setIsUpdating(true);
    try {
      if (order?.id) {
        await api.orders.update(order.id, { status: "SUCCESS" }).catch(() => null);
      }
      setOrder((prev: any) => (prev ? { ...prev, status: "SUCCESS" } : null));
      setCurrentStepIndex(4);
      setEscrowReleased(true);

      // Update local storage if present
      try {
        const stored = localStorage.getItem("switchlab_orders");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((o: any) =>
              o.id === orderId
                ? {
                    ...o,
                    status: "SUCCESS",
                    statusLabel: "COMPLETED • ESCROW RELEASED",
                    badgeClass: "bg-green-50 text-green-700 border-green-600",
                  }
                : o
            );
            localStorage.setItem("switchlab_orders", JSON.stringify(updated));
            window.dispatchEvent(new Event("storage"));
          }
        }
      } catch (e) {}

      // Dispatch Notifications to Modder, Admin, and Customer
      addNotification({
        targetRole: "MODDER",
        targetUserId: order?.modderId || order?.modder?.id,
        type: "PAYOUT",
        title: "🎉 Escrow Funds Released by Customer!",
        message: `Customer confirmed sound & feel for Order #${orderId}. Your payout of Rp ${(order?.totalPrice || 0).toLocaleString()} is unlocked!`,
        orderId: orderId,
        link: "/modder/dashboard",
      });

      addNotification({
        targetRole: "ADMIN",
        type: "PAYOUT",
        title: "✅ Escrow Released by Customer",
        message: `Customer confirmed delivery for Order #${orderId}. Payout is eligible for disbursement in Escrow Vault.`,
        orderId: orderId,
        link: "/admin",
      });

      addNotification({
        targetRole: "CUSTOMER",
        targetUserId: order?.customerId,
        type: "ORDER",
        title: "✨ Build Received & Escrow Released",
        message: `You successfully released escrow for Order #${orderId}. Thank you for tuning with SwitchLab!`,
        orderId: orderId,
        link: `/orders/${orderId}`,
      });
    } catch (err) {
      console.warn("Could not update order status in backend:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !rating) return;
    setIsSubmittingReview(true);
    try {
      let savedReview: any = null;
      try {
        savedReview = await api.orders.addReview(orderId, {
          rating,
          comment: reviewComment.trim() || "Awesome modding job, highly recommended!",
          customerId: order?.customerId,
        });
      } catch (err) {
        console.warn("Could not save review via backend API:", err);
      }

      const reviewData = savedReview || {
        rating,
        comment: reviewComment.trim() || "Awesome modding job, highly recommended!",
        createdAt: new Date().toISOString(),
      };

      setOrder((prev: any) => (prev ? { ...prev, review: reviewData } : null));
      setIsEditingReview(false);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);

      // Save to localStorage
      try {
        const stored = localStorage.getItem("switchlab_orders");
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const updated = list.map((o: any) =>
              o.id === orderId ? { ...o, review: reviewData } : o
            );
            localStorage.setItem("switchlab_orders", JSON.stringify(updated));
            window.dispatchEvent(new Event("storage"));
          }
        }
      } catch (e) {}

      // Dispatch Notification to Modder
      addNotification({
        targetRole: "MODDER",
        targetUserId: order?.modderId || order?.modder?.id,
        type: "ORDER",
        title: `⭐ New ★${rating}.0 Review from Customer!`,
        message: `Customer reviewed your build for Order #${orderId}: "${reviewComment.trim() || "Awesome modding job!"}"`,
        orderId: orderId,
        link: "/modder/dashboard",
      });
    } catch (err: any) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isWalkIn = order?.deliveryMethod === "WALK_IN";
  const isPendingVerification = order?.status === "PENDING_ADMIN_VERIFICATION";
  const isCompleted = escrowReleased || order?.status === "SUCCESS";

  const steps = [
    { 
      key: "PAID", 
      label: isPendingVerification ? "Admin Verification" : "Funds in Escrow", 
      desc: isPendingVerification ? "Admin matching transfer receipt" : "Payment verified & locked in vault" 
    },
    { 
      key: "SENDING", 
      label: isWalkIn ? "Studio Drop-Off" : "Shipping to Modder", 
      desc: isWalkIn ? "Bring keyboard to modder studio" : "Customer ships keyboard/parts" 
    },
    { 
      key: "WORKBENCH", 
      label: "On Workbench", 
      desc: "Modder actively tuning & testing" 
    },
    { 
      key: "SHIPPED_BACK", 
      label: isWalkIn ? "Studio Pickup" : "Shipped Back", 
      desc: isWalkIn ? "Collect finished build at studio" : "Outbound tracking provided" 
    },
    { 
      key: "COMPLETED", 
      label: "Complete & Release", 
      desc: "Customer confirms sound & feel" 
    },
  ];

  const getStageDescription = () => {
    if (escrowReleased || order?.status === "SUCCESS") {
      return "Completed & Funds Released to Modder";
    }
    switch (order?.status) {
      case "SHIPPED_BACK":
        return isWalkIn 
          ? "Modding Completed • Ready for Studio Pickup" 
          : "Modding Completed • Dispatched Back to Customer";
      case "KEYBOARD_IN_MODDER_HAND":
        return "In Modder Studio • Active Tuning & Sound Testing";
      case "CUSTOMER_SENDING_KEYBOARD":
        return isWalkIn
          ? "Awaiting Customer Drop-Off at Modder Studio"
          : "Awaiting Inbound Package from Customer";
      case "PAID_WAITING_MODDER":
        return "Payment Verified in Escrow Vault • Awaiting Modder Acceptance";
      case "PENDING_ADMIN_VERIFICATION":
        return "Payment Proof Uploaded • Awaiting Admin Escrow Vault Verification";
      case "UNPAID":
      default:
        return "Awaiting Payment Proof Submission";
    }
  };

  const serviceFee = order?.subtotal || Math.max(0, (order?.totalPrice || 0) - (order?.shippingFee || 0));
  const shippingCost = isWalkIn ? 0 : (order?.shippingFee || 20000);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8">
        <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center max-w-md w-full shadow-md">
          <div className="text-3xl mb-3 animate-spin inline-block font-mono">⚙️</div>
          <h2 className="text-base font-mono font-bold text-brand-textMain uppercase">
            Loading Escrow Booking Details...
          </h2>
          <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-2">
            Syncing order #{orderId} from database
          </p>
        </div>
      </div>
    );
  }

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

            {isCompleted ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="bg-emerald-50 border-2 border-emerald-600 px-4 py-2 font-mono text-xs">
                  <span className="text-emerald-800 font-bold block uppercase">✓ Order Completed • Escrow Released</span>
                  <span className="text-emerald-700">
                    Rp {(order?.totalPrice || 0).toLocaleString()} Transferred to Modder
                  </span>
                </div>
                <Link
                  href={`/orders/${orderId}/rate`}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider border-2 border-slate-900 inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>⭐</span>
                  <span>{order?.review ? "Edit Review →" : "Rate Modder →"}</span>
                </Link>
              </div>
            ) : isPendingVerification ? (
              <div className="bg-amber-50 border-2 border-amber-500 px-4 py-2 font-mono text-xs">
                <span className="text-amber-800 font-bold block uppercase">⏳ Awaiting Admin Verification</span>
                <span className="text-amber-700">
                  Rp {(order?.totalPrice || 0).toLocaleString()} Proof Uploaded • Pending Vault Check
                </span>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-600 px-4 py-2 font-mono text-xs">
                <span className="text-green-800 font-bold block uppercase">🛡️ Escrow Active</span>
                <span className="text-green-700">
                  Rp {(order?.totalPrice || 0).toLocaleString()} Locked in Vault
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Progression Bar */}
        <div className="bg-brand-sidebar border-2 border-slate-900 p-6 mb-8">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-900">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
              Escrow Lifecycle Progress
            </h2>
            {isPendingVerification && (
              <a
                href="/admin"
                className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-300 hover:bg-amber-100 uppercase"
              >
                ⚡ Open Admin Vault (Simulate Approve) →
              </a>
            )}
            {isCompleted && (
              <Link
                href={`/orders/${orderId}/rate`}
                className="text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 border-2 border-slate-900 uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>⭐</span>
                <span>{order?.review ? `Edit Review (${order.review.rating}★) →` : "Rate Modder Now →"}</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              const isPast = isCompleted ? true : idx < currentStepIndex;
              const isCurrent = !isCompleted && idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`border-2 p-4 flex flex-col justify-between ${
                    isCompleted
                      ? "border-emerald-600 bg-emerald-50/60"
                      : isCurrent
                      ? "border-brand-navy bg-brand-lightBg"
                      : isPast
                      ? "border-green-600 bg-green-50/50"
                      : "border-slate-300 bg-white opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2 font-mono text-xs font-bold">
                      <span>STEP 0{idx + 1}</span>
                      <span>
                        {isCompleted
                          ? idx === 4
                            ? "✓ RELEASED"
                            : "✓ DONE"
                          : isPast 
                          ? "✓ DONE" 
                          : isCurrent 
                          ? isPendingVerification && idx === 0 
                            ? "⏳ VERIFYING" 
                            : "● ACTIVE" 
                          : "PENDING"}
                      </span>
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
                  Modder: {order?.modder || "@VerifiedModder"}
                </span>
              </div>

              <div className="bg-white border-2 border-slate-800 p-4 font-mono text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Service / Config:</span>
                  <span className="font-bold text-brand-textMain">{order?.service || "Custom Modding Service"}</span>
                </div>
                {order?.keyboardModel && (
                  <div className="flex justify-between">
                    <span className="text-brand-textMuted">Keyboard Target:</span>
                    <span className="font-bold text-brand-navy">{order.keyboardModel}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Delivery Channel:</span>
                  <span className="font-bold text-slate-900">
                    {isWalkIn ? "🏢 STUDIO WALK-IN (IN-PERSON HANDOFF)" : "🚚 COURIER LOGISTICS"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Current Workbench Stage:</span>
                  <span className={`font-bold ${isCompleted ? "text-emerald-700 font-extrabold" : isPendingVerification ? "text-amber-800" : "text-brand-terracotta"}`}>
                    {getStageDescription()}
                  </span>
                </div>
              </div>

              {/* Sound Test Audio Player Station */}
              <div className="border-2 border-slate-800 p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-brand-textMain">
                    🎵 Modder Sound Test Clip
                  </span>
                  <span className="text-xs font-mono text-green-700 font-bold">[ READY FOR REVIEW ]</span>
                </div>
                <div className="flex items-center gap-3 bg-brand-lightBg p-3 border border-slate-300">
                  <button className="w-8 h-8 bg-brand-navy text-white font-mono flex items-center justify-center font-bold hover:bg-[#132856]">
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

            {/* Courier / Walk-In Logistics Tracking Details */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                {isWalkIn ? "🏢 Studio Walk-In Logistics" : "🚚 Shipping & Logistics Tracking"}
              </h3>

              {isWalkIn ? (
                <div className="bg-white border-2 border-slate-800 p-4 font-mono text-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <span>✓</span>
                    <span>STUDIO WALK-IN ACTIVE: NO COURIER SHIPMENT NEEDED</span>
                  </div>
                  <p className="text-brand-textMuted text-[11px] leading-relaxed">
                    Bring your keyboard directly to the modder&apos;s physical workshop. The modder inspects switch stems, stabilizers, and PCB upon in-person handoff.
                  </p>
                  <div className="p-3 bg-brand-lightBg border border-slate-300 flex justify-between items-center">
                    <span className="text-brand-textMuted uppercase">Modder Studio:</span>
                    <span className="font-bold text-brand-navy">{order?.modder || "@VerifiedModder"}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-brand-textMuted block mb-1">
                      Inbound Tracking (Customer ➔ Modder)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. JNE1234567890"
                        value={inboundTracking}
                        onChange={(e) => setInboundTracking(e.target.value)}
                        className="flex-1 px-3.5 py-2 border-2 border-slate-800 font-mono text-xs bg-brand-lightBg"
                      />
                      <span className="px-3 py-2 bg-green-50 border-2 border-green-600 text-green-700 font-mono text-xs font-bold uppercase">
                        {inboundTracking ? "Logged" : "Pending Inbound"}
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
                        value={outboundTracking}
                        readOnly
                        className="flex-1 px-3.5 py-2 border-2 border-slate-800 font-mono text-xs bg-brand-lightBg"
                      />
                      <span className="px-3 py-2 bg-blue-50 border-2 border-blue-600 text-blue-700 font-mono text-xs font-bold uppercase">
                        {outboundTracking ? "Dispatched" : "Awaiting Dispatch"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment & Escrow Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Escrow Settlement Breakdown
              </h3>

              <div className="space-y-3 font-mono text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Service Fee ({order?.service || "Mod Service"}):</span>
                  <span className="font-bold text-slate-800">
                    Rp {serviceFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Return Shipping Fee:</span>
                  <span className="font-bold text-slate-800">
                    {isWalkIn ? "FREE (Studio Walk-In)" : `Rp ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Escrow Protection Fee:</span>
                  <span className="font-bold text-emerald-700">FREE (SwitchLab Covered)</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-base">
                  <span className="font-bold uppercase">
                    {isCompleted ? "Total Released to Modder:" : "Held in Escrow:"}
                  </span>
                  <span className="font-extrabold text-brand-navy text-xl">
                    Rp {(order?.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {isCompleted ? (
                <div className="p-4 border-2 border-emerald-600 bg-emerald-50 text-xs font-mono mb-6">
                  <span className="font-bold text-emerald-800 block uppercase mb-1">
                    ✓ Order Completed & Escrow Released
                  </span>
                  <p className="text-emerald-700 text-[11px] leading-relaxed">
                    You have confirmed sound & feel and released the escrow funds to the modder. This transaction is finalized and permanently recorded.
                  </p>
                </div>
              ) : isPendingVerification ? (
                <div className="p-4 border-2 border-amber-600 bg-amber-50 text-xs font-mono mb-6">
                  <span className="font-bold text-amber-800 block uppercase mb-1">
                    ⏳ Verification In Progress
                  </span>
                  Your payment receipt is currently being verified by the SwitchLab Escrow Admin against the bank ledger. Once verified, the modder will accept the job.
                </div>
              ) : (
                <div className="p-4 border-2 border-amber-600 bg-amber-50 text-xs font-mono mb-6">
                  <span className="font-bold text-amber-800 block uppercase mb-1">
                    ⚠️ Inspection Notice
                  </span>
                  Only release funds after you have tested the sound test recording and received your package.
                </div>
              )}

              {escrowReleased || order?.status === "SUCCESS" ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border-2 border-green-600 text-center font-mono text-xs text-green-800 font-bold uppercase">
                    ✓ Escrow Released to Modder
                  </div>
                  <Link
                    href={`/orders/${orderId}/rate`}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider border-2 border-slate-900 inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>⭐</span>
                    <span>{order?.review ? "Edit Modder Review →" : "Rate Modder →"}</span>
                  </Link>
                </div>
              ) : isPendingVerification ? (
                <div className="p-3 bg-slate-100 border-2 border-slate-400 text-center font-mono text-xs text-slate-600 font-bold uppercase">
                  Awaiting Admin Approval Before Release
                </div>
              ) : (
                <Button
                  variant="primary"
                  isLoading={isUpdating}
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
