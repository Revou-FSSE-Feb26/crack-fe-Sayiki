"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

import { api } from "@/lib/api";

interface OrderSummary {
  id: string;
  date: string;
  modder: string;
  service: string;
  totalPrice: number;
  status: "PAID_WAITING_MODDER" | "CUSTOMER_SENDING_KEYBOARD" | "KEYBOARD_IN_MODDER_HAND" | "SHIPPED_BACK" | "SUCCESS" | string;
  statusLabel: string;
  badgeClass: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function loadCustomerOrders() {
      let local: any[] = [];
      try {
        const stored = localStorage.getItem("switchlab_orders");
        if (stored) {
          local = JSON.parse(stored);
        }
      } catch (e) {}

      try {
        const dbOrders = await api.orders.getAll();
        const mappedDb = (Array.isArray(dbOrders) ? dbOrders : []).map((b: any) => ({
          id: b.id,
          date: new Date(b.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          modder: `@${b.modder?.name || "Modder"}`,
          service: b.items?.[0]?.service?.title || b.keyboardModel || "Keyboard Modding Service",
          totalPrice: b.totalPrice,
          status: b.status,
          statusLabel: b.status.replace(/_/g, " "),
          badgeClass: b.status === "SUCCESS" ? "bg-green-50 text-green-700 border-green-600" : "bg-blue-50 text-blue-700 border-blue-600",
        }));

        const combined = [...(Array.isArray(local) ? local : [])];
        mappedDb.forEach((dbItem: any) => {
          if (!combined.some((c) => c.id === dbItem.id)) {
            combined.push(dbItem);
          }
        });
        setOrders(combined);
      } catch (e) {
        setOrders(Array.isArray(local) ? local : []);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerOrders();
  }, []);

  const totalProtectedFunds = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

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
                <div className="text-xl font-mono font-bold text-brand-navy">
                  {loading ? "..." : `${orders.length} ${orders.length === 1 ? "Order" : "Orders"}`}
                </div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Protected Funds</div>
                <div className="text-xl font-mono font-bold text-brand-navy">
                  {loading ? "..." : `Rp ${totalProtectedFunds.toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white border-2 border-slate-900 p-12 text-center my-8 shadow-sm">
            <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
            <h2 className="text-base font-mono font-bold text-brand-textMain uppercase">
              Querying Escrow Ledger & Orders...
            </h2>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-2">
              Syncing with PostgreSQL database via NestJS API
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border-2 border-slate-900 p-12 text-center my-8 shadow-sm">
            <div className="text-4xl mb-3">🛡️</div>
            <h2 className="text-xl font-black text-brand-textMain mb-2">No Active Escrow Orders</h2>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6 max-w-md mx-auto">
              You have not booked any custom keyboard modding services yet. When you configure and checkout a service, your 5-stage live escrow tracker will appear here.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/services">
                <Button variant="primary" isLoading={false}>Browse Modding Services →</Button>
              </Link>
              <Link href="/modders">
                <Button variant="secondary" isLoading={false}>Find Verified Modders</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
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

                  <Link href={`/orders/${order.id}`} className="w-full sm:w-auto">
                    <Button variant="primary" isLoading={false} className="whitespace-nowrap px-5">
                      View Live Tracker →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
