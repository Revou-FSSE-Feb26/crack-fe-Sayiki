"use client";
import { useState } from "react";
import { Button } from "@/components/Button";

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

const initialPendingPayments: PendingPayment[] = [
  {
    id: "1",
    orderNumber: "SWL-8942",
    customerName: "Adit Pratama",
    customerCity: "Jakarta Selatan",
    modderHandle: "@DexterKeyboards",
    serviceTitle: "Linear Switch Lubing & Filming (90x Switches)",
    subtotal: 875000,
    uniqueCode: 678,
    totalToVerify: 875678,
    bank: "BCA Escrow Vault",
    receiptName: "bca_mtransfer_receipt_678.jpg",
    submittedAt: "10 mins ago",
    status: "PENDING",
  },
  {
    id: "2",
    orderNumber: "SWL-8940",
    customerName: "Budi Handoko",
    customerCity: "Surabaya",
    modderHandle: "@ClackSmiths",
    serviceTitle: "Wooting 60HE Hall Effect Tuning & Lube",
    subtotal: 350000,
    uniqueCode: 412,
    totalToVerify: 350412,
    bank: "BCA Escrow Vault",
    receiptName: "bca_transfer_412.png",
    submittedAt: "24 mins ago",
    status: "PENDING",
  },
  {
    id: "3",
    orderNumber: "SWL-8938",
    customerName: "Siti Rahma",
    customerCity: "Medan",
    modderHandle: "@KeyboardClinic",
    serviceTitle: "Vintage Alps AT101 Restoration & Solder",
    subtotal: 520000,
    uniqueCode: 905,
    totalToVerify: 520905,
    bank: "Mandiri Escrow",
    receiptName: "mandiri_livin_905.jpg",
    submittedAt: "1 hour ago",
    status: "PENDING",
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"VERIFY_PAYMENTS" | "DISBURSEMENTS" | "DISPUTES">("VERIFY_PAYMENTS");
  const [payments, setPayments] = useState<PendingPayment[]>(initialPendingPayments);
  const [selectedReceipt, setSelectedReceipt] = useState<PendingPayment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "APPROVED" } : p))
    );
    showToast("Payment Approved! Order status updated to PAID_WAITING_MODDER. Funds locked in Escrow.");
  };

  const handleReject = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "REJECTED" } : p))
    );
    showToast("Payment Flagged & Rejected. Customer notified to upload valid mutasi receipt.");
  };

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

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
                Verify 3-Digit Codes • Reconcile Bank Mutasi • Release Modder Payouts
              </p>
            </div>

            {/* Quick Stats Vault */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6 font-mono">
              <div>
                <div className="text-[10px] text-brand-textMuted uppercase">Locked in Escrow</div>
                <div className="text-xl font-black text-brand-navy">Rp 18,450,000</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-[10px] text-brand-textMuted uppercase">Pending Approvals</div>
                <div className="text-xl font-black text-amber-700">{pendingCount} Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-2 border-slate-900 bg-brand-sidebar mb-8 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab("VERIFY_PAYMENTS")}
            className={`flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-2 ${
              activeTab === "VERIFY_PAYMENTS"
                ? "bg-brand-navy text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>📥 Payment Verification Queue</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("DISBURSEMENTS")}
            className={`flex-1 py-3 px-4 text-center transition-colors border-l-2 border-slate-900 ${
              activeTab === "DISBURSEMENTS"
                ? "bg-brand-navy text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            💰 Modder Payout Releases (4)
          </button>
          <button
            onClick={() => setActiveTab("DISPUTES")}
            className={`flex-1 py-3 px-4 text-center transition-colors border-l-2 border-slate-900 ${
              activeTab === "DISPUTES"
                ? "bg-brand-navy text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            ⚖️ Dispute Mediation (1)
          </button>
        </div>

        {/* TAB 1: PAYMENT VERIFICATION QUEUE */}
        {activeTab === "VERIFY_PAYMENTS" && (
          <div className="space-y-6">
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-slate-900">
                <div>
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                    Incoming Transfers Awaiting Approval (PENDING_ADMIN_VERIFICATION)
                  </h2>
                  <p className="text-xs text-brand-textMuted font-mono mt-0.5">
                    Match the exact 3-digit verification code with your BCA / Mandiri corporate bank statement.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-bold">
                  {pendingCount} Transfers to Verify
                </span>
              </div>

              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-brand-lightBg text-brand-textMain uppercase">
                      <th className="py-3 px-3">Order Ref</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Service & Modder</th>
                      <th className="py-3 px-3">Verification Code</th>
                      <th className="py-3 px-3">Exact Bank Amount</th>
                      <th className="py-3 px-3">Receipt</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-brand-navy">
                          <a href={`/orders/${p.orderNumber}`} className="hover:underline">
                            #{p.orderNumber}
                          </a>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800">{p.customerName}</div>
                          <div className="text-[11px] text-brand-textMuted">{p.customerCity}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-slate-800 truncate max-w-xs">{p.serviceTitle}</div>
                          <div className="text-[11px] font-bold text-brand-navy">{p.modderHandle}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-1 bg-emerald-100 border-2 border-emerald-600 text-emerald-800 font-black text-sm">
                            +{p.uniqueCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-sm text-brand-textMain">
                            Rp {p.totalToVerify.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-brand-textMuted uppercase">{p.bank}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="px-2.5 py-1 bg-white border border-slate-400 text-brand-navy font-bold hover:bg-slate-100"
                          >
                            👁️ View Proof
                          </button>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {p.status === "PENDING" ? (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(p.id)}
                                className="px-3 py-1.5 bg-emerald-700 text-white font-bold hover:bg-emerald-800 active:scale-95 shadow-sm"
                              >
                                ✓ Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(p.id)}
                                className="px-2.5 py-1.5 bg-white border border-rose-400 text-rose-700 font-bold hover:bg-rose-50 active:scale-95"
                              >
                                ✕ Reject
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
            </div>
          </div>
        )}

        {/* TAB 2: MODDER PAYOUT RELEASES */}
        {activeTab === "DISBURSEMENTS" && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-6 font-mono text-xs">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
              Completed Jobs Ready for Escrow Payout Disbursal
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-slate-300 p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="font-bold text-sm text-brand-textMain">#SWL-8910 • @SwitchMaster (Yogyakarta)</div>
                  <p className="text-brand-textMuted text-xs">
                    Customer Confirmed Receipt & Sound Test • Released by Customer
                  </p>
                  <span className="text-[11px] text-slate-500">Destination: Bank Mandiri 137-00-291823-1 (SwitchMaster Studio)</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-brand-navy">Rp 427,500</div>
                  <div className="text-[10px] text-brand-textMuted mb-2">(Rp 450,000 - 5% platform fee)</div>
                  <button
                    onClick={() => showToast("Payout Disbursed! Transferred Rp 427,500 to @SwitchMaster Mandiri account.")}
                    className="px-4 py-2 bg-brand-navy text-white font-bold hover:bg-[#132856] active:scale-95"
                  >
                    Disburse Payout Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DISPUTES */}
        {activeTab === "DISPUTES" && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-6 font-mono text-xs">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
              Active Disputes Requiring Admin Arbitration (UNDER_DISPUTE)
            </h2>
            <div className="border-2 border-amber-400 p-4 bg-amber-50/60">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-amber-900">CASE #DSP-004: Tofu65 Solder Issue</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold">UNDER REVIEW</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                Customer claims Spacebar stabilizer wire popped during return transit. Modder uploaded verified sound test clip proving it worked before outbound dispatch.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => showToast("Refund of Rp 350,000 issued to Customer.")}
                  className="px-3 py-1.5 bg-rose-700 text-white font-bold hover:bg-rose-800"
                >
                  Refund Customer (Rp 350,000)
                </button>
                <button
                  onClick={() => showToast("Dispute resolved in favor of Modder. Payout released.")}
                  className="px-3 py-1.5 bg-brand-navy text-white font-bold hover:bg-[#132856]"
                >
                  Release to Modder
                </button>
              </div>
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
                onClick={() => setSelectedReceipt(null)}
                className="w-7 h-7 border border-slate-800 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated Bank Receipt */}
            <div className="border-2 border-slate-800 bg-white p-5 space-y-3 mb-6 shadow-inner">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="font-black text-brand-navy text-sm">BCA m-Banking Transfer</div>
                <div className="text-[10px] text-slate-500">BERHASIL / SUCCESSFUL</div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Penerima / To:</span>
                <span className="font-bold">PT SWITCHLAB INDONESIA</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Rekening / Acc:</span>
                <span className="font-bold">883019284411</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500">Jumlah / Amount:</span>
                <span className="font-black text-base text-emerald-700">
                  Rp {selectedReceipt.totalToVerify.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs bg-emerald-50 p-2 border border-emerald-200">
                <span className="text-emerald-800">Kode Unik Match:</span>
                <span className="font-bold text-emerald-900">+{selectedReceipt.uniqueCode} ✓</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleApprove(selectedReceipt.id);
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-2.5 bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-800"
              >
                ✓ Approve Payment
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 bg-white border border-slate-400 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
