"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { api } from "@/lib/api";

const steps = [
  { key: "PAID", label: "Funds in Escrow", desc: "Payment held safely by SwitchLab" },
  { key: "SENDING", label: "Shipping to Modder", desc: "Customer ships keyboard/parts" },
  { key: "WORKBENCH", label: "On Workbench", desc: "Modder actively working & testing" },
  { key: "SHIPPED_BACK", label: "Shipped Back", desc: "Outbound tracking provided" },
  { key: "COMPLETED", label: "Complete & Release", desc: "Customer confirms sound & feel" },
];

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

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        setLoading(true);
        const stored = localStorage.getItem("switchlab_orders");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const found = parsed.find((o: any) => o.id === orderId);
            if (found) {
              const shipFee = found.deliveryMethod === "WALK_IN" ? 0 : (found.shippingFee ?? 20000);
              const sub = found.subtotal ?? Math.max(0, (found.totalPrice || 0) - shipFee);
              setOrder({
                ...found,
                subtotal: sub,
                shippingFee: shipFee,
              });
              if (found.inboundTrackingNum) setInboundTracking(found.inboundTrackingNum);
              if (found.outboundTrackingNum) setOutboundTracking(found.outboundTrackingNum);
              
              if (found.status === "SUCCESS") setCurrentStepIndex(4);
              else if (found.status === "SHIPPED_BACK") setCurrentStepIndex(3);
              else if (found.status === "KEYBOARD_IN_MODDER_HAND") setCurrentStepIndex(2);
              else if (found.status === "CUSTOMER_SENDING_KEYBOARD") setCurrentStepIndex(1);
              else setCurrentStepIndex(0);
              setLoading(false);
              return;
            }
          }
        }

        let dbOrder = await api.orders.getById(orderId).catch(() => null);
        if (!dbOrder) {
          const allOrders = await api.orders.getAll().catch(() => []);
          dbOrder = (allOrders || []).find((o: any) => o.id === orderId || o.id.toLowerCase().startsWith(orderId.toLowerCase()));
        }

        if (dbOrder) {
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
            service: dbOrder.items?.[0]?.service?.title || dbOrder.keyboardModel || "Keyboard Modding Service",
            status: dbOrder.status,
            items: dbOrder.items,
          });

          if (dbOrder.inboundTrackingNum) setInboundTracking(dbOrder.inboundTrackingNum);
          if (dbOrder.outboundTrackingNum) setOutboundTracking(dbOrder.outboundTrackingNum);

          if (dbOrder.status === "SUCCESS") setCurrentStepIndex(4);
          else if (dbOrder.status === "SHIPPED_BACK") setCurrentStepIndex(3);
          else if (dbOrder.status === "KEYBOARD_IN_MODDER_HAND") setCurrentStepIndex(2);
          else if (dbOrder.status === "CUSTOMER_SENDING_KEYBOARD") setCurrentStepIndex(1);
          else setCurrentStepIndex(0);
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
      setCurrentStepIndex(4);
      setEscrowReleased(true);
    } catch (err) {
      console.warn("Could not update order status in backend:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStageDescription = () => {
    if (escrowReleased || order?.status === "SUCCESS") {
      return "Completed & Funds Released to Modder";
    }
    switch (order?.status) {
      case "SHIPPED_BACK":
        return "Modding Complete • Dispatched Back to Customer";
      case "KEYBOARD_IN_MODDER_HAND":
        return "In Modder Studio • Active Tuning & Sound Testing";
      case "CUSTOMER_SENDING_KEYBOARD":
        return "Awaiting Inbound Package from Customer";
      case "PAID_WAITING_MODDER":
      default:
        return "Payment Verified in Escrow Vault • Awaiting Modder Confirmation";
    }
  };

  const serviceFee = order?.subtotal || Math.max(0, (order?.totalPrice || 0) - (order?.shippingFee || 0));
  const shippingCost = order?.deliveryMethod === "WALK_IN" ? 0 : (order?.shippingFee || 20000);

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

            <div className="bg-green-50 border-2 border-green-600 px-4 py-2 font-mono text-xs">
              <span className="text-green-800 font-bold block uppercase">🛡️ Escrow Active</span>
              <span className="text-green-700">
                Rp {(order?.totalPrice || 0).toLocaleString()} Locked in Vault
              </span>
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
                  <span className="text-brand-textMuted">Current Workbench Stage:</span>
                  <span className="font-bold text-brand-terracotta">
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
                    {order?.deliveryMethod === "WALK_IN"
                      ? "FREE (Studio Walk-In)"
                      : `Rp ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textMuted">Escrow Protection Fee:</span>
                  <span className="font-bold text-emerald-700">FREE (SwitchLab Covered)</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-base">
                  <span className="font-bold uppercase">Held in Escrow:</span>
                  <span className="font-extrabold text-brand-navy text-xl">
                    Rp {(order?.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 border-2 border-amber-600 bg-amber-50 text-xs font-mono mb-6">
                <span className="font-bold text-amber-800 block uppercase mb-1">
                  ⚠️ Inspection Notice
                </span>
                Only release funds after you have tested the sound test recording and received your package.
              </div>

              {escrowReleased || order?.status === "SUCCESS" ? (
                <div className="p-4 bg-green-50 border-2 border-green-600 text-center font-mono text-xs text-green-800 font-bold uppercase">
                  ✓ Escrow Released to Modder. Thank you!
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
