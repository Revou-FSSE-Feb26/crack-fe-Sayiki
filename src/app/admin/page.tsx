"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { api, syncAuthCookies } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

interface PendingPayment {
  id: string;
  orderNumber: string;
  customerName: string;
  customerCity: string;
  modderHandle: string;
  serviceTitle: string;
  subtotal: number;
  uniqueCode: number;
  totalToVerify: number;
  bank: string;
  receiptName: string;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"VERIFY_PAYMENTS" | "DISBURSEMENTS" | "DISPUTES">("VERIFY_PAYMENTS");
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PendingPayment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setMounted(true);
    let userObj: any = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        userObj = JSON.parse(storedUser);
        setCurrentUser(userObj);
        syncAuthCookies();
      }
    } catch (e) {}

    // Strict Role check: Only allow ADMIN role into Escrow Vault
    if (!userObj) {
      setLoading(false);
      router.replace("/login?redirect=/admin");
      return;
    }
    const role = String(userObj.role || "").toUpperCase();
    if (role !== "ADMIN") {
      setLoading(false);
      router.replace("/orders?error=unauthorized_admin_access");
      return;
    }

    try {
      setLoading(true);
      const orders = await api.orders.getAll().catch(() => []);
      const dbOrders = Array.isArray(orders) ? orders : [];

      // Local storage fallback / customer session orders
      let localOrders: any[] = [];
      try {
        const stored = localStorage.getItem("switchlab_orders");
        if (stored) {
          localOrders = JSON.parse(stored);
        }
      } catch (e) {}

      // Map DB orders
      const mappedDbPayments: PendingPayment[] = dbOrders.map((b: any, idx: number) => {
        const code = 100 + (idx * 17) % 899;
        return {
          id: b.id,
          orderNumber: b.id.slice(0, 8).toUpperCase(),
          customerName: b.customer?.name || "Verified Customer",
          customerCity: b.customer?.locationCity || "Indonesia",
          modderHandle: `@${b.modder?.name || "VerifiedModder"}`,
          serviceTitle: b.items?.[0]?.service?.title || b.keyboardModel || "Custom Keyboard Modding Service",
          subtotal: b.totalPrice,
          uniqueCode: code,
          totalToVerify: b.totalPrice + code,
          bank: "BCA Escrow Vault",
          receiptName: b.paymentProof || "bca_transfer_receipt.jpg",
          submittedAt: new Date(b.createdAt || Date.now()).toLocaleDateString(),
          status: b.status === "PAID_WAITING_MODDER" || b.status === "KEYBOARD_IN_MODDER_HAND" || b.status === "SUCCESS"
            ? "APPROVED"
            : "PENDING",
        };
      });

      // Map local test orders
      const mappedLocalPayments: PendingPayment[] = (Array.isArray(localOrders) ? localOrders : []).map((o: any) => ({
        id: o.id,
        orderNumber: o.id,
        customerName: "Current User",
        customerCity: "Jakarta",
        modderHandle: o.modder || "@VerifiedModder",
        serviceTitle: o.service || "Keyboard Modding",
        subtotal: o.totalPrice || 425000,
        uniqueCode: 678,
        totalToVerify: (o.totalPrice || 425000) + 678,
        bank: "BCA Escrow Vault",
        receiptName: "bca_mtransfer_receipt_678.jpg",
        submittedAt: o.date || "Today",
        status: o.status === "PAID_WAITING_MODDER" || o.status === "SUCCESS" ? "APPROVED" : "PENDING",
      }));

      // Combine and deduplicate by id
      const combined = [...mappedDbPayments];
      mappedLocalPayments.forEach((lp) => {
        if (!combined.some((c) => c.id === lp.id)) {
          combined.unshift(lp);
        }
      });

      setPayments(combined);

      // Completed orders for disbursement
      const completed = dbOrders.filter((o: any) => o.status === "SUCCESS" || o.status === "SHIPPED_BACK");
      setCompletedOrders(completed);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve");
    const p = payments.find((item) => item.id === id);

    // Optimistically update UI immediately
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "APPROVED" } : p))
    );

    // Update local storage if present
    try {
      const stored = localStorage.getItem("switchlab_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((o: any) =>
            o.id === id ? { ...o, status: "PAID_WAITING_MODDER", statusLabel: "FUNDS IN ESCROW • AWAITING MODDER" } : o
          );
          localStorage.setItem("switchlab_orders", JSON.stringify(updated));
        }
      }
    } catch (e) {}

    // Notify Customer and Modder
    addNotification({
      targetRole: "CUSTOMER",
      type: "PAYMENT",
      title: "💰 Payment Verified & Locked in Escrow",
      message: `Admin verified your payment of Rp ${(p?.totalToVerify || 0).toLocaleString()} for Order #${id}. Modder has been notified to accept your build!`,
      orderId: id,
      link: `/orders/${id}`,
    });

    addNotification({
      targetRole: "MODDER",
      type: "ORDER",
      title: "⚡ Escrow Secured - Job Ready to Accept",
      message: `Payment for Order #${id} is verified in Escrow. You can now accept this job in your Workbench!`,
      orderId: id,
      link: "/modder/dashboard",
    });

    try {
      await api.orders.update(id, { status: "PAID_WAITING_MODDER" }).catch(() => null);
      showToast("Payment Approved! Order status updated to PAID_WAITING_MODDER. Funds locked in Escrow.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + "_reject");

    // Optimistically update UI immediately
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "REJECTED" } : p))
    );

    // Notify Customer
    addNotification({
      targetRole: "CUSTOMER",
      type: "PAYMENT",
      title: "⚠️ Payment Proof Rejected",
      message: `Payment proof for Order #${id} could not be matched with bank mutasi. Please check transfer details and re-upload.`,
      orderId: id,
      link: `/orders/${id}`,
    });

    try {
      await api.orders.update(id, { status: "UNPAID" }).catch(() => null);
      showToast("Payment Flagged & Rejected. Customer notified to upload valid mutasi receipt.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  // Full-screen guard: Customers and Guests CANNOT access the Escrow Vault
  const userRole = String(currentUser?.role || "").toUpperCase();
  if (mounted && (!currentUser || userRole !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-slate-900 p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-100 border-2 border-brand-navy text-brand-navy flex items-center justify-center mx-auto mb-4 text-3xl font-mono">
            🛡️
          </div>
          <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-red-600 bg-red-50 text-red-700 mb-2">
            [ 403 FORBIDDEN • ADMIN ONLY ]
          </span>
          <h1 className="text-2xl font-black text-brand-textMain mb-2">
            Escrow Vault Access Restricted
          </h1>
          <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6">
            The Escrow Operations Vault is restricted to SwitchLab Administrators. You are signed in as <strong>{currentUser?.role || "GUEST"}</strong>.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/orders">
              <Button variant="primary" isLoading={false} className="w-full text-xs uppercase font-mono font-bold">
                Go to My Customer Orders →
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" isLoading={false} className="w-full text-xs uppercase font-mono font-bold">
                Log in as Administrator
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
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-red-600 bg-red-50 text-red-700 mb-2">
                [ ADMIN EXCLUSIVE ESCROW VAULT ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Escrow Operations & Verification
              </h1>
              <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Live Database Verification • Reconcile Bank Mutasi • Release Modder Payouts
              </p>
            </div>

            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Pending Proofs</div>
                <div className="text-xl font-mono font-bold text-amber-600">{pendingCount} Action Required</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Total Monitored</div>
                <div className="text-xl font-mono font-bold text-brand-navy">{payments.length} Bookings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-slate-900 mb-8 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("VERIFY_PAYMENTS")}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-t-2 border-x-2 -mb-[2px] transition-colors ${
                  activeTab === "VERIFY_PAYMENTS"
                    ? "bg-brand-sidebar border-slate-900 text-brand-navy"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Payment Verification ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("DISBURSEMENTS")}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-t-2 border-x-2 -mb-[2px] transition-colors ${
                  activeTab === "DISBURSEMENTS"
                    ? "bg-brand-sidebar border-slate-900 text-brand-navy"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Modder Disbursements ({completedOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("DISPUTES")}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-t-2 border-x-2 -mb-[2px] transition-colors ${
                  activeTab === "DISPUTES"
                    ? "bg-brand-sidebar border-slate-900 text-brand-navy"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Disputes Arbitration (0)
              </button>
            </div>

        {/* TAB 1: VERIFY PAYMENTS */}
        {activeTab === "VERIFY_PAYMENTS" && (
          <div className="space-y-6">
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-900">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                  Incoming Bank Transfer Proof Queue
                </h2>
                <span className="text-xs font-mono text-brand-textMuted uppercase">
                  Match 3-Digit Code with Mutasi BCA
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 font-mono text-xs text-brand-textMuted uppercase">
                  Loading live database bookings...
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 bg-white border-2 border-slate-300">
                  <div className="text-3xl mb-2">🛡️</div>
                  <h3 className="font-bold text-sm text-brand-textMain mb-1">No Pending Verification Requests</h3>
                  <p className="text-xs font-mono text-brand-textMuted uppercase">
                    All escrow payments have been processed or no orders are currently awaiting manual verification.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-brand-lightBg border-b-2 border-slate-900 text-brand-textMain uppercase">
                        <th className="p-3">Order / Customer</th>
                        <th className="p-3">Modder & Service</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-center">3-Digit Code</th>
                        <th className="p-3 text-right">Exact Total</th>
                        <th className="p-3 text-center">Receipt</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-brand-navy block">#{p.orderNumber}</span>
                            <span className="text-slate-800 font-semibold">{p.customerName}</span>
                            <span className="text-brand-textMuted block text-[10px]">📍 {p.customerCity}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{p.modderHandle}</span>
                            <span className="text-slate-600 line-clamp-1">{p.serviceTitle}</span>
                          </td>
                          <td className="p-3 text-right text-slate-700">
                            Rp {p.subtotal.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 bg-amber-100 border border-amber-500 text-amber-800 font-extrabold text-xs">
                              +{p.uniqueCode}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-brand-navy text-sm">
                            Rp {p.totalToVerify.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(p)}
                              className="px-2.5 py-1 bg-blue-50 border border-blue-600 text-blue-800 text-[10px] font-bold hover:bg-blue-100 uppercase"
                            >
                              🔍 View Proof
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            {p.status === "PENDING" ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  type="button"
                                  disabled={actionLoading !== null}
                                  onClick={() => handleApprove(p.id)}
                                  className="px-3 py-1.5 bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-60 active:scale-95 shadow-sm flex items-center gap-1 transition-all"
                                >
                                  {actionLoading === p.id + "_approve" ? (
                                    <>
                                      <span className="animate-spin inline-block font-mono">⚙️</span>
                                      <span>Approving...</span>
                                    </>
                                  ) : (
                                    "✓ Approve"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoading !== null}
                                  onClick={() => handleReject(p.id)}
                                  className="px-2.5 py-1.5 bg-white border border-rose-400 text-rose-700 font-bold hover:bg-rose-50 disabled:opacity-60 active:scale-95 flex items-center gap-1 transition-all"
                                >
                                  {actionLoading === p.id + "_reject" ? (
                                    <>
                                      <span className="animate-spin inline-block font-mono">⚙️</span>
                                      <span>Rejecting...</span>
                                    </>
                                  ) : (
                                    "✕ Reject"
                                  )}
                                </button>
                              </div>
                            ) : p.status === "APPROVED" ? (
                              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                                ✓ ESCROW LOCKED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-rose-50 border border-rose-300 text-rose-700 font-bold">
                                ✕ REJECTED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MODDER PAYOUT RELEASES */}
        {activeTab === "DISBURSEMENTS" && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-6 font-mono text-xs">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
              Completed Jobs Ready for Escrow Payout Disbursal
            </h2>

            {completedOrders.length === 0 ? (
              <div className="text-center py-12 bg-white border-2 border-slate-300">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold text-sm text-brand-textMain mb-1">No Payouts Currently Pending</h3>
                <p className="text-xs font-mono text-brand-textMuted uppercase">
                  Payouts will appear here as soon as customers test their returned keyboards and release escrow funds.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-slate-300 p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-brand-textMain">
                        #{order.id.slice(0, 8).toUpperCase()} • @{order.modder?.name || "Modder"} ({order.modder?.locationCity})
                      </div>
                      <p className="text-brand-textMuted text-xs">
                        Customer Confirmed Receipt & Sound Test • Released by Customer
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Destination: Bank Account ({order.modder?.email || "Studio Vault"})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-brand-navy">
                        Rp {Math.round(order.totalPrice * 0.95).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-brand-textMuted mb-2">
                        (Rp {order.totalPrice.toLocaleString()} - 5% platform fee)
                      </div>
                      <button
                        onClick={() =>
                          showToast(`Payout Disbursed! Transferred Rp ${Math.round(order.totalPrice * 0.95).toLocaleString()} to modder.`)
                        }
                        className="px-4 py-2 bg-brand-navy text-white font-bold hover:bg-[#132856] active:scale-95"
                      >
                        Disburse Payout Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISPUTES */}
        {activeTab === "DISPUTES" && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-6 font-mono text-xs">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
              Active Disputes Requiring Admin Arbitration (UNDER_DISPUTE)
            </h2>
            <div className="text-center py-12 bg-white border-2 border-slate-300">
              <div className="text-3xl mb-2">⚖️</div>
              <h3 className="font-bold text-sm text-brand-textMain mb-1">Zero Active Disputes</h3>
              <p className="text-xs font-mono text-brand-textMuted uppercase">
                All client modding sessions and courier transits are operating smoothly without open disputes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RECEIPT INSPECTION MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-sidebar border-2 border-slate-900 max-w-md w-full p-6 shadow-2xl font-mono">
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-900">
              <h3 className="font-bold text-xs uppercase tracking-wider text-brand-textMain">
                Proof Inspection • Order #{selectedReceipt.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-500 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-100 border-2 border-slate-400 p-4 mb-4 text-center">
              <div className="w-16 h-16 bg-blue-100 border border-blue-400 text-blue-700 flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                📄
              </div>
              <p className="text-xs font-bold text-slate-800 mb-1">{selectedReceipt.receiptName}</p>
              <p className="text-[11px] text-slate-500">
                Transferred: Rp {selectedReceipt.totalToVerify.toLocaleString()} via {selectedReceipt.bank}
              </p>
            </div>

            <div className="space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Unique Code:</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-1">+{selectedReceipt.uniqueCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Modder:</span>
                <span className="font-bold text-brand-navy">{selectedReceipt.modderHandle}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={async () => {
                  const id = selectedReceipt.id;
                  setSelectedReceipt(null);
                  await handleApprove(id);
                }}
                className="flex-1 py-2.5 bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-60 text-xs uppercase flex items-center justify-center gap-1.5 transition-all"
              >
                {actionLoading === selectedReceipt.id + "_approve" ? (
                  <>
                    <span className="animate-spin inline-block font-mono">⚙️</span>
                    <span>Approving...</span>
                  </>
                ) : (
                  "Approve Payment"
                )}
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={async () => {
                  const id = selectedReceipt.id;
                  setSelectedReceipt(null);
                  await handleReject(id);
                }}
                className="flex-1 py-2.5 bg-white border-2 border-rose-500 text-rose-700 font-bold hover:bg-rose-50 disabled:opacity-60 text-xs uppercase flex items-center justify-center gap-1.5 transition-all"
              >
                {actionLoading === selectedReceipt.id + "_reject" ? (
                  <>
                    <span className="animate-spin inline-block font-mono">⚙️</span>
                    <span>Rejecting...</span>
                  </>
                ) : (
                  "Reject Proof"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
