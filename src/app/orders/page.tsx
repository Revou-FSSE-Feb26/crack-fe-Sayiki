"use client";
import { Button } from "@/components/Button";

interface OrderSummary {
  id: string;
  date: string;
  modder: string;
  service: string;
  totalPrice: number;
  status: "PAID_WAITING_MODDER" | "CUSTOMER_SENDING_KEYBOARD" | "KEYBOARD_IN_MODDER_HAND" | "SHIPPED_BACK" | "SUCCESS";
  statusLabel: string;
  badgeClass: string;
}

const demoOrders: OrderSummary[] = [
  {
    id: "SWL-8942",
    date: "Sep 11, 2026",
    modder: "@DexterKeyboards",
    service: "Linear Switch Lubing & Filming (90x Switches)",
    totalPrice: 425000,
    status: "PAID_WAITING_MODDER",
    statusLabel: "FUNDS IN ESCROW • AWAITING MODDER ACCEPTANCE",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-600",
  },
  {
    id: "SWL-7120",
    date: "Aug 28, 2026",
    modder: "@KeyboardClinic",
    service: "Stabilizer Tuning & Holee Mod (Spacebar + Enter)",
    totalPrice: 170000,
    status: "KEYBOARD_IN_MODDER_HAND",
    statusLabel: "ON WORKBENCH • MODDING IN PROGRESS",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-600",
  },
  {
    id: "SWL-6041",
    date: "Jul 15, 2026",
    modder: "@ModHouse",
    service: "Custom Plate Foam Installation + Mill-Max Sockets",
    totalPrice: 325000,
    status: "SUCCESS",
    statusLabel: "COMPLETED & ESCROW RELEASED",
    badgeClass: "bg-green-50 text-green-700 border-green-600",
  },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Page Header */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ CUSTOMER DASHBOARD ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                My Orders & Escrow Bookings
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Real-Time Escrow Tracking • Shipping Logistics • Workbench Milestones
              </p>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Active Escrow</div>
                <div className="text-xl font-mono font-bold text-brand-navy">2 In Progress</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Protected Funds</div>
                <div className="text-xl font-mono font-bold text-brand-navy">Rp 595k</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {demoOrders.map((order) => (
            <div
              key={order.id}
              className="bg-brand-sidebar border-2 border-slate-900 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-brand-navy transition-colors"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-extrabold text-base text-brand-textMain">
                    Order #{order.id}
                  </span>
                  <span className="text-xs font-mono text-brand-textMuted">
                    Placed on {order.date}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 ${order.badgeClass}`}>
                    [ {order.statusLabel} ]
                  </span>
                </div>

                <h3 className="font-bold text-lg text-brand-textMain">{order.service}</h3>
                <p className="text-xs font-mono text-brand-navy font-semibold">
                  Modder: {order.modder}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                <div className="text-left md:text-right">
                  <div className="text-xs font-mono text-brand-textMuted uppercase">Total (Held in Escrow)</div>
                  <div className="text-xl font-mono font-extrabold text-brand-navy">
                    Rp {order.totalPrice.toLocaleString()}
                  </div>
                </div>

                <a href={`/orders/${order.id}`} className="w-full sm:w-auto">
                  <Button variant="primary" isLoading={false} className="whitespace-nowrap px-5">
                    View Live Tracker →
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
