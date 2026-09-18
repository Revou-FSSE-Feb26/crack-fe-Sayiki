"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { api } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

interface CartItem {
  id: number;
  type: "product" | "service";
  title: string;
  variation: string;
  provider: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"COURIER" | "WALK_IN">("COURIER");
  const [shippingTier, setShippingTier] = useState<"REGULAR" | "INSTANT">("REGULAR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Escrow Paywall State
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<"BCA" | "MANDIRI" | "QRIS">("BCA");
  const [uniqueCode] = useState(() => Math.floor(100 + Math.random() * 900)); // e.g. 678
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("switchlab_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      setItems([]);
    }
  }, []);

  const syncCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("switchlab_cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const updateQuantity = (id: number, delta: number) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    syncCart(updated);
  };

  const removeItem = (id: number) => {
    const updated = items.filter((item) => item.id !== id);
    syncCart(updated);
  };

  const clearAll = () => {
    syncCart([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = deliveryMethod === "WALK_IN" ? 0 : shippingTier === "INSTANT" ? 45000 : 20000;
  const grandTotal = subtotal + shippingFee;
  const exactTransferTotal = grandTotal + uniqueCode;

  const handleOpenPaywall = () => {
    setShowPaywallModal(true);
  };

  const handleCopy = (text: string, type: "amount" | "account") => {
    navigator.clipboard.writeText(text);
    if (type === "amount") {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleUseSampleReceipt = () => {
    setReceiptUploaded(true);
    setReceiptFileName("bca_mtransfer_receipt_678.jpg");
  };

  const [createdOrderId, setCreatedOrderId] = useState<string>("SWL-8942");
  const [completedOrderSummary, setCompletedOrderSummary] = useState<{
    orderId: string;
    subtotal: number;
    shippingFee: number;
    exactTransferTotal: number;
    uniqueCode: number;
    receiptFileName: string;
  } | null>(null);

  const handleSubmitProof = async () => {
    setIsProcessing(true);
    let orderId = `SWL-${Math.floor(1000 + Math.random() * 9000)}`;

    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = storedUser ? JSON.parse(storedUser) : null;
    const customerId = user?.id || "48c8fc2d-d918-456c-80ea-662d8b17f120";
    const modderId = (items[0] as any)?.modderId || "f45ee67f-610d-4dff-9f11-5a4463037e5a";
    const serviceId = (items[0] as any)?.serviceId || "08e593e5-77ef-4048-b704-31bd6da43177";

    const finalSubtotal = grandTotal;
    const finalExactTotal = exactTransferTotal;
    const finalCode = uniqueCode;
    const finalReceipt = receiptFileName || "mTransfer_Receipt.png";

    try {
      const randomMinutes = Math.floor(Math.random() * 100000) + 60;
      const bookingDate = new Date(Date.now() + randomMinutes * 60000).toISOString();

      const created = await api.orders.create({
        customerId,
        modderId,
        keyboardModel: items[0]?.title || "Custom Keyboard",
        deliveryMethod,
        totalPrice: finalExactTotal,
        bookingDate,
        paymentProof: finalReceipt,
        items: [
          {
            serviceId,
            subTotal: finalExactTotal,
          },
        ],
      });

      if (created && created.id) {
        orderId = created.id;
      }
    } catch (err) {
      console.warn("Could not persist to database via NestJS, falling back:", err);
    }

    setIsProcessing(false);
    setShowPaywallModal(false);
    setCreatedOrderId(orderId);
    setCompletedOrderSummary({
      orderId,
      subtotal: finalSubtotal,
      shippingFee,
      exactTransferTotal: finalExactTotal,
      uniqueCode: finalCode,
      receiptFileName: finalReceipt,
    });

    // Save order to switchlab_orders for this customer
    try {
      const existingOrders = JSON.parse(localStorage.getItem("switchlab_orders") || "[]");
      const newOrder = {
        id: orderId,
        customerId: customerId,
        customerEmail: user?.email,
        modderId: modderId,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        modder: items[0]?.provider || "@VerifiedModder",
        service: items.map((i) => i.title).join(" + "),
        totalPrice: finalExactTotal,
        subtotal: finalSubtotal,
        baseSubtotal: subtotal,
        shippingFee: shippingFee,
        uniqueCode: finalCode,
        exactTransferTotal: finalExactTotal,
        deliveryMethod: deliveryMethod,
        keyboardModel: items[0]?.title || "Custom Mechanical Keyboard",
        status: "PENDING_ADMIN_VERIFICATION",
        statusLabel: "AWAITING ADMIN ESCROW VERIFICATION",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-500",
      };
      localStorage.setItem("switchlab_orders", JSON.stringify([newOrder, ...existingOrders]));
    } catch (e) {}

    // Dispatch notifications to Customer, Admin, and Modder
    addNotification({
      targetRole: "CUSTOMER",
      targetUserId: customerId,
      type: "ORDER",
      title: "🧾 Order Placed & Payment Uploaded",
      message: `Order #${orderId} (Rp ${finalExactTotal.toLocaleString()}) submitted for admin escrow verification.`,
      orderId: orderId,
      link: `/orders/${orderId}`,
    });

    addNotification({
      targetRole: "ADMIN",
      type: "PAYMENT",
      title: "🔍 New Payment Proof to Verify",
      message: `Order #${orderId} (Rp ${finalExactTotal.toLocaleString()}) transfer proof uploaded by customer.`,
      orderId: orderId,
      link: "/admin",
    });

    addNotification({
      targetRole: "MODDER",
      targetUserId: modderId,
      type: "ORDER",
      title: "📦 New Incoming Escrow Booking",
      message: `Order #${orderId} placed with Escrow protection. Awaiting admin payment approval.`,
      orderId: orderId,
      link: "/modder/dashboard",
    });

    // Empty cart
    syncCart([]);
    setOrderComplete(true);
  };

  if (orderComplete) {
    const displayTotal = completedOrderSummary?.exactTransferTotal ?? exactTransferTotal;
    const displayCode = completedOrderSummary?.uniqueCode ?? uniqueCode;
    const displayOrderId = completedOrderSummary?.orderId ?? createdOrderId;
    const displayReceipt = completedOrderSummary?.receiptFileName ?? receiptFileName ?? "mTransfer_Receipt.png";

    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-brand-sidebar border-2 border-slate-900 p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-amber-50 border-2 border-amber-600 text-amber-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-mono">
            ⏳
          </div>
          <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-amber-600 bg-amber-50 text-amber-800 mb-2">
            [ PAYMENT PROOF SUBMITTED ]
          </span>
          <h1 className="text-2xl font-black text-brand-textMain mb-2">Awaiting Admin Verification</h1>
          <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6">
            Order Reference #{displayOrderId} • Verification Code #{displayCode}
          </p>

          <div className="bg-brand-lightBg border-2 border-slate-900 p-4 text-left font-mono text-xs space-y-2.5 mb-6">
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Booking Status:</span>
              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5">
                PENDING_ADMIN_VERIFICATION
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Exact Transfer Total:</span>
              <span className="font-bold text-brand-navy">Rp {displayTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Verification Code:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5">
                +{displayCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Bank Destination:</span>
              <span className="font-bold">BCA ESCROW VAULT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Attached Receipt:</span>
              <span className="font-bold text-slate-700">{displayReceipt}</span>
            </div>
          </div>

          <div className="space-y-3">
            <a href={`/orders/${displayOrderId}`} className="block w-full">
              <Button variant="primary" isLoading={false} className="w-full">
                Track Escrow Progress →
              </Button>
            </a>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin" className="block w-full">
                <Button variant="secondary" isLoading={false} className="w-full text-xs">
                  Open Admin Vault (Approve) ⚡
                </Button>
              </a>
              <a href="/" className="block w-full">
                <Button variant="secondary" isLoading={false} className="w-full text-xs">
                  Back to Homepage
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">Shopping Cart & Checkout</h1>
          <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-1">
            Review your custom keyboard components & modding bookings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-8">
            <div className="text-4xl mb-3">🛒</div>
            <h2 className="text-xl font-black text-brand-textMain mb-2">Your Cart is Empty</h2>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-6">
              Browse expert services or ready-stock keyboard switches
            </p>
            <div className="flex justify-center gap-4">
              <a href="/services">
                <Button variant="primary" isLoading={false}>Browse Services →</Button>
              </a>
              <a href="/search">
                <Button variant="secondary" isLoading={false}>Browse Parts →</Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Cart Items (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                  Cart Items ({items.length})
                </h2>
                <button
                  onClick={clearAll}
                  className="font-mono text-xs text-brand-terracotta hover:underline uppercase font-bold"
                >
                  Clear All
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-brand-sidebar border-2 border-slate-900 p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-brand-lightBg border-2 border-slate-800 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border mb-1 ${
                        item.type === "service" ? "bg-brand-lightBg text-brand-navy border-brand-navy" : "bg-green-50 text-green-700 border-green-600"
                      }`}>
                        [ {item.type.toUpperCase()} ]
                      </span>
                      <h3 className="font-bold text-sm text-brand-textMain">{item.title}</h3>
                      <p className="text-xs font-mono text-brand-textMuted">{item.variation}</p>
                      <p className="text-xs font-mono text-brand-navy mt-1 font-semibold">{item.provider}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                    <div className="text-sm font-mono font-bold text-brand-navy">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border-2 border-slate-800 bg-white font-mono text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-brand-terracotta p-1 text-xs font-mono font-bold"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Details Form */}
              <div className="bg-brand-sidebar border-2 border-slate-900 p-6 mt-6">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4">
                  1. Delivery / Drop-off Preference
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <label
                    className={`border-2 p-3 cursor-pointer text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 ${
                      deliveryMethod === "COURIER"
                        ? "border-brand-navy bg-brand-lightBg text-brand-navy"
                        : "border-slate-800 bg-white text-brand-textMuted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === "COURIER"}
                      onChange={() => setDeliveryMethod("COURIER")}
                      className="accent-brand-navy"
                    />
                    Courier Shipping
                  </label>

                  <label
                    className={`border-2 p-3 cursor-pointer text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 ${
                      deliveryMethod === "WALK_IN"
                        ? "border-brand-navy bg-brand-lightBg text-brand-navy"
                        : "border-slate-800 bg-white text-brand-textMuted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === "WALK_IN"}
                      onChange={() => setDeliveryMethod("WALK_IN")}
                      className="accent-brand-navy"
                    />
                    Studio Walk-In (Free)
                  </label>
                </div>

                {deliveryMethod === "COURIER" && (
                  <div className="space-y-3 pt-2">
                    <Input label="Shipping Recipient Name" placeholder="Arzaq Ajradika" defaultValue="Arzaq Ajradika" />
                    <Input label="Street Address" placeholder="Jl. Sudirman No. 128" defaultValue="Jl. Sudirman No. 128" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="City / Region" placeholder="Jakarta Selatan" defaultValue="Jakarta Selatan" />
                      <Input label="Postal Code" placeholder="12190" defaultValue="12190" />
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider block mb-1">
                        Shipping Speed
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`border-2 p-2.5 cursor-pointer text-xs font-mono font-bold flex justify-between items-center ${
                            shippingTier === "REGULAR" ? "border-brand-navy bg-brand-lightBg" : "border-slate-300"
                          }`}
                        >
                          <span>Regular (2-3 Days)</span>
                          <span className="text-brand-navy">Rp 20,000</span>
                          <input
                            type="radio"
                            name="tier"
                            checked={shippingTier === "REGULAR"}
                            onChange={() => setShippingTier("REGULAR")}
                            className="hidden"
                          />
                        </label>
                        <label
                          className={`border-2 p-2.5 cursor-pointer text-xs font-mono font-bold flex justify-between items-center ${
                            shippingTier === "INSTANT" ? "border-brand-navy bg-brand-lightBg" : "border-slate-300"
                          }`}
                        >
                          <span>Instant Courier (1 Day)</span>
                          <span className="text-brand-navy">Rp 45,000</span>
                          <input
                            type="radio"
                            name="tier"
                            checked={shippingTier === "INSTANT"}
                            onChange={() => setShippingTier("INSTANT")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Panel (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-brand-sidebar border-2 border-slate-900 p-6 shadow-md">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                  Order Summary
                </h3>

                <div className="space-y-3 font-mono text-xs mb-6">
                  <div className="flex justify-between">
                    <span className="text-brand-textMuted">Subtotal:</span>
                    <span className="font-bold text-slate-800">Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-textMuted">Delivery Fee:</span>
                    <span className="font-bold text-slate-800">
                      {deliveryMethod === "WALK_IN" ? "FREE (Walk-In)" : `Rp ${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-textMuted">Escrow Protection Fee:</span>
                    <span className="font-bold text-green-700">FREE (Covered)</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-base">
                    <span className="font-bold text-brand-textMain uppercase">Grand Total:</span>
                    <span className="font-extrabold text-brand-navy text-xl">
                      Rp {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Escrow Guarantee Box */}
                <div className="bg-brand-lightBg border-2 border-slate-800 p-3.5 mb-6 text-xs font-mono">
                  <div className="font-bold text-brand-navy uppercase mb-1">🛡️ 100% Escrow Guarantee</div>
                  <p className="text-brand-textMuted text-[11px] leading-relaxed">
                    Your funds remain safely locked in SwitchLab Escrow until you receive your keyboard mod and verify the sound test.
                  </p>
                </div>

                <Button
                  variant="primary"
                  isLoading={isProcessing}
                  onClick={handleOpenPaywall}
                  className="w-full text-sm py-3"
                >
                  Proceed to Escrow Checkout →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ESCROW PAYWALL MODAL */}
        {showPaywallModal && (
          <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-brand-sidebar border-2 border-slate-900 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6 pb-3 border-b-2 border-slate-900">
                <div>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-1">
                    [ SECURE ESCROW VAULT PAYWALL ]
                  </span>
                  <h2 className="text-2xl font-black text-brand-textMain">Transfer to Escrow Vault</h2>
                </div>
                <button 
                  onClick={() => setShowPaywallModal(false)}
                  className="w-8 h-8 border-2 border-slate-900 bg-white font-mono font-bold flex items-center justify-center hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* CRITICAL UNIQUE VERIFICATION CODE ALERT */}
              <div className="bg-amber-50 border-2 border-amber-500 p-4 mb-5 font-mono">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-bold text-amber-900 text-xs uppercase mb-1">
                      MANDATORY: Transfer Exact Amount with Verification Code
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      Please transfer the exact amount down to the last 3 digits (<span className="font-extrabold text-brand-navy underline">+{uniqueCode}</span>). The Admin verifies your payment by matching these 3 digits on the bank statement!
                    </p>
                  </div>
                </div>
              </div>

              {/* Exact Amount Display */}
              <div className="p-4 bg-brand-lightBg border-2 border-slate-900 mb-5 font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-xs text-brand-textMuted uppercase tracking-wider block">Total Transfer Amount:</span>
                  <div className="text-2xl font-black text-brand-navy flex items-baseline gap-1">
                    <span>Rp {grandTotal.toLocaleString()}</span>
                    <span className="text-emerald-700 font-extrabold text-2xl underline">+{uniqueCode}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    (Grand Total: Rp {exactTransferTotal.toLocaleString()})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(exactTransferTotal.toString(), "amount")}
                  className="px-3.5 py-2 bg-brand-navy text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-[#132856] active:scale-95"
                >
                  {copiedAmount ? "✓ AMOUNT COPIED" : "COPY EXACT AMOUNT"}
                </button>
              </div>

              {/* Bank Destination Tabs */}
              <div className="mb-5">
                <div className="flex border-2 border-slate-900 mb-3 font-mono text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedBank("BCA")}
                    className={`flex-1 py-2 text-center transition-colors ${selectedBank === "BCA" ? "bg-brand-navy text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                  >
                    BCA Escrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBank("MANDIRI")}
                    className={`flex-1 py-2 text-center transition-colors border-l-2 border-slate-900 ${selectedBank === "MANDIRI" ? "bg-brand-navy text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                  >
                    Mandiri Escrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBank("QRIS")}
                    className={`flex-1 py-2 text-center transition-colors border-l-2 border-slate-900 ${selectedBank === "QRIS" ? "bg-brand-navy text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                  >
                    QRIS Instant
                  </button>
                </div>

                <div className="p-4 bg-white border-2 border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted uppercase">Account Name:</span>
                    <span className="font-bold text-slate-900">PT SWITCHLAB INDONESIA (ESCROW)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted uppercase">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-brand-navy">
                        {selectedBank === "BCA" ? "8830-1928-4411" : selectedBank === "MANDIRI" ? "132-00-984411-2" : "NMID: ID1020039182"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedBank === "BCA" ? "883019284411" : "132009844112", "account")}
                        className="px-2 py-0.5 border border-slate-400 bg-slate-100 text-[10px] font-bold hover:bg-slate-200"
                      >
                        {copiedAccount ? "✓ COPIED" : "COPY"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Payment Proof Box */}
              <div className="mb-6">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain block mb-2">
                  Upload Transfer Proof / Receipt Screenshot (paymentProof)
                </label>
                <div className="border-2 border-dashed border-slate-400 p-4 bg-brand-lightBg text-center">
                  {receiptUploaded ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 p-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <span>📎</span>
                        <span className="font-bold">{receiptFileName}</span>
                        <span className="text-[10px] text-emerald-600">(Ready for Admin Verification)</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setReceiptUploaded(false); setReceiptFileName(null); }}
                        className="text-rose-600 font-bold hover:underline text-[11px]"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 font-mono">
                      <p className="text-xs text-brand-textMuted">Drag & drop receipt screenshot or attach receipt file</p>
                      <button
                        type="button"
                        onClick={handleUseSampleReceipt}
                        className="px-3 py-1.5 bg-brand-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-[#132856] active:scale-95"
                      >
                        ⚡ Attach Sample Transfer Receipt (Rp {exactTransferTotal.toLocaleString()})
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  isLoading={isProcessing}
                  onClick={handleSubmitProof}
                  className="w-full text-sm py-3 font-bold"
                >
                  Confirm & Submit Payment Proof to Escrow →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
