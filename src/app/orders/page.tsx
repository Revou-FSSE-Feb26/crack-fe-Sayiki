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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    let userObj: any = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        userObj = JSON.parse(storedUser);
        setCurrentUser(userObj);
      }
    } catch (e) {}

    if (!userObj) {
      setLoading(false);
      return;
    }

    async function loadCustomerOrders() {
      let local: any[] = [];
      try {
        const stored = localStorage.getItem("switchlab_orders");
        if (stored) {
          local = JSON.parse(stored);
        }
      } catch (e) {}

      try {
        setLoading(true);
        const dbOrders = await api.orders.getAll({ customerId: userObj.id }).catch(() => []);
        
        // Customer isolation filter:
        const filteredDb = (Array.isArray(dbOrders) ? dbOrders : []).filter((b: any) => {
          const isUserCustomer = 
            b.customerId === userObj.id ||
            b.customer?.id === userObj.id ||
            (userObj.email && b.customer?.email?.toLowerCase() === userObj.email.toLowerCase());

          // In demo environment, allow customer session to see seeded orders as well
          const isDemoCustomer = 
            userObj.role === "CUSTOMER" && 
            (!userObj.email || userObj.email.toLowerCase().includes("customer") || userObj.id === "48c8fc2d-d918-456c-80ea-662d8b17f120");

          return isUserCustomer || (isDemoCustomer && b.customerId === "48c8fc2d-d918-456c-80ea-662d8b17f120");
        });

        const mappedDb: OrderSummary[] = filteredDb.map((b: any) => ({
          id: b.id,
          date: new Date(b.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          modder: `@${b.modder?.name || "Modder"}`,
          service: b.items?.[0]?.service?.title || b.keyboardModel || "Keyboard Modding Service",
          totalPrice: b.totalPrice,
          status: b.status,
          statusLabel: b.status === "SHIPPED_BACK" 
            ? "BUILD FINISHED • READY TO SEND / PICKUP"
            : b.status === "KEYBOARD_IN_MODDER_HAND"
            ? "KEYBOARD ON MODDER WORKBENCH"
            : b.status.replace(/_/g, " "),
          badgeClass: b.status === "SUCCESS" 
            ? "bg-green-50 text-green-700 border-green-600" 
            : b.status === "SHIPPED_BACK"
            ? "bg-emerald-100 text-emerald-900 border-emerald-600 font-black"
            : "bg-blue-50 text-blue-700 border-blue-600",
        }));

        // Start with live DB orders as the primary source of truth
        const combined: OrderSummary[] = [...mappedDb];

        // Merge local storage test orders
        let localChanged = false;
        (Array.isArray(local) ? local : []).forEach((loc: any) => {
          const matchesCustomer = 
            !loc.customerId || 
            loc.customerId === userObj.id || 
            (userObj.email && loc.customerEmail?.toLowerCase() === userObj.email.toLowerCase()) ||
            userObj.role === "CUSTOMER";

          if (matchesCustomer) {
            const existingIdx = combined.findIndex((c) => c.id === loc.id);
            if (existingIdx === -1) {
              combined.push({
                id: loc.id,
                date: loc.date || "Recent",
                modder: loc.modder || "@Modder",
                service: loc.service || loc.keyboardModel || "Keyboard Modding Service",
                totalPrice: loc.totalPrice || 0,
                status: loc.status || "PAID_WAITING_MODDER",
                statusLabel: loc.status === "SHIPPED_BACK" 
                  ? "BUILD FINISHED • READY TO SEND / PICKUP" 
                  : (loc.statusLabel || (loc.status || "").replace(/_/g, " ")),
                badgeClass: loc.status === "SUCCESS" 
                  ? "bg-green-50 text-green-700 border-green-600" 
                  : loc.status === "SHIPPED_BACK"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-600 font-black"
                  : "bg-blue-50 text-blue-700 border-blue-600",
              });
            } else {
              // Live DB order exists: sync the live status into the local copy
              if (loc.status !== combined[existingIdx].status) {
                loc.status = combined[existingIdx].status;
                localChanged = true;
              }
            }
          }
        });

        if (localChanged) {
          try {
            localStorage.setItem("switchlab_orders", JSON.stringify(local));
          } catch (e) {}
        }

        setOrders(combined);
      } catch (e) {
        setOrders([]);
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
                {currentUser ? `Logged in as ${currentUser.name} (${currentUser.email})` : "Real-Time Escrow Tracking • Shipping Logistics • Workbench Milestones"}
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
        {/* Role-Specific Modder Banner */}
        {currentUser?.role === "MODDER" && (
          <div className="mb-6 bg-slate-900 text-white p-4 border-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-mono font-bold text-xs uppercase text-amber-400 block mb-1">
                🛠️ Modder Account Active (@{currentUser.name})
              </span>
              <p className="text-xs text-slate-300 font-mono">
                This page displays personal orders you placed as a customer. To view and tune client keyboard orders assigned to your studio, open your Modder Workbench.
              </p>
            </div>
            <Link href="/modder/dashboard" className="shrink-0">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider">
                Open Modder Workbench ➔
              </button>
            </Link>
          </div>
        )}

        {/* Role-Specific Admin Banner */}
        {currentUser?.role === "ADMIN" && (
          <div className="mb-6 bg-blue-900 text-white p-4 border-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-mono font-bold text-xs uppercase text-blue-300 block mb-1">
                🛡️ Admin Account Active
              </span>
              <p className="text-xs text-slate-200 font-mono">
                Platform-wide customer escrow deposits, bank mutasi reconciliation, and modder payout disbursements are located in the Escrow Vault.
              </p>
            </div>
            <Link href="/admin" className="shrink-0">
              <button className="px-4 py-2 bg-white hover:bg-slate-100 text-brand-navy font-bold text-xs font-mono uppercase tracking-wider">
                Open Escrow Vault ➔
              </button>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="bg-white border-2 border-slate-900 p-12 text-center my-8 shadow-sm">
            <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
            <h2 className="text-base font-mono font-bold text-brand-textMain uppercase">
              Querying Escrow Ledger & Orders...
            </h2>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-2">
              Syncing your personal orders from PostgreSQL database via NestJS API
            </p>
          </div>
        ) : mounted && !currentUser ? (
          <div className="bg-white border-2 border-slate-900 p-12 text-center my-8 shadow-sm">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-xl font-black text-brand-textMain mb-2">Sign In Required</h2>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6 max-w-md mx-auto">
              Please sign in to view your orders and track live escrow bookings.
            </p>
            <Link href="/login">
              <Button variant="primary" isLoading={false}>Sign In to SwitchLab →</Button>
            </Link>
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
