"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

const ASPECT_TAGS = [
  "🧈 Silky Stem Smoothness",
  "🔇 Zero Wire Rattle",
  "🔊 Deep Thock Acoustic Profile",
  "⚡ Ultra Fast Turnaround",
  "📦 Bulletproof Packaging",
  "🤝 Attentive Communication",
  "🎯 Clean Soldering / Desoldering",
  "✨ Perfect Stem Alignment",
];

export default function OrderRatingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "🧈 Silky Stem Smoothness",
    "🔊 Deep Thock Acoustic Profile",
  ]);
  const [typingTestUrl, setTypingTestUrl] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        setLoading(true);
        let currentUser: any = null;
        try {
          const stored = localStorage.getItem("user");
          if (stored) currentUser = JSON.parse(stored);
        } catch (e) {}

        // Check local storage first
        let localOrder: any = null;
        try {
          const storedOrders = localStorage.getItem("switchlab_orders");
          if (storedOrders) {
            const list = JSON.parse(storedOrders);
            if (Array.isArray(list)) {
              localOrder = list.find((o: any) => o.id === orderId);
            }
          }
        } catch (e) {}

        // Fetch live order from backend
        let dbOrder = await api.orders.getById(orderId).catch(() => null);
        if (!dbOrder) {
          const allOrders = await api.orders.getAll().catch(() => []);
          dbOrder = (allOrders || []).find((o: any) => o.id === orderId || o.id.toLowerCase().startsWith(orderId.toLowerCase()));
        }

        const resolved = dbOrder || localOrder;
        if (resolved) {
          const shipFee = resolved.deliveryMethod === "WALK_IN" ? 0 : 20000;
          const sub = resolved.subtotal || resolved.items?.reduce((s: number, i: any) => s + (i.subTotal || 0), 0) || Math.max(0, (resolved.totalPrice || 0) - shipFee);

          const orderData = {
            id: resolved.id,
            totalPrice: resolved.totalPrice || 0,
            subtotal: sub,
            shippingFee: shipFee,
            deliveryMethod: resolved.deliveryMethod,
            keyboardModel: resolved.keyboardModel || "Custom Mechanical Keyboard",
            modder: resolved.modder?.name ? `@${resolved.modder.name}` : resolved.modder || "@VerifiedModder",
            modderId: resolved.modderId || resolved.modder?.id,
            customerId: resolved.customerId || resolved.customer?.id,
            service: resolved.items?.[0]?.service?.title || resolved.service || "Custom Keyboard Tuning",
            status: resolved.status,
            review: resolved.review || localOrder?.review || null,
          };

          setOrder(orderData);

          if (orderData.review) {
            setRating(orderData.review.rating || 5);
            setComment(orderData.review.comment || "");
            if (orderData.review.tags) setSelectedTags(orderData.review.tags);
            if (orderData.review.typingTestUrl) setTypingTestUrl(orderData.review.typingTestUrl);
          }
        }
      } catch (err: any) {
        console.error("Failed to load order for rating:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !rating) return;
    setError(null);
    setSubmitting(true);

    const fullComment = comment.trim() || "Excellent modding craftsmanship and sound profile!";

    try {
      let savedReview: any = null;
      try {
        savedReview = await api.orders.addReview(orderId, {
          rating,
          comment: fullComment,
          customerId: order?.customerId,
        });
      } catch (err) {
        console.warn("Could not save review through backend API:", err);
      }

      const reviewData = {
        rating,
        comment: fullComment,
        tags: selectedTags,
        typingTestUrl: typingTestUrl.trim(),
        createdAt: new Date().toISOString(),
      };

      setOrder((prev: any) => (prev ? { ...prev, review: reviewData } : null));

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
        message: `Customer reviewed your build for Order #${orderId}: "${fullComment}"`,
        orderId: orderId,
        link: "/modder/dashboard",
      });

      setSuccess(true);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8 font-mono">
        <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center max-w-md w-full shadow-md">
          <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
          <h2 className="text-base font-bold text-brand-textMain uppercase">
            Loading Order Details...
          </h2>
          <p className="text-xs text-brand-textMuted uppercase tracking-wider mt-2">
            Fetching order #{orderId}
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8 font-mono">
        <div className="bg-brand-sidebar border-2 border-slate-900 p-8 text-center max-w-md w-full shadow-md">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-base font-bold text-brand-textMain uppercase">
            Order Not Found
          </h2>
          <p className="text-xs text-brand-textMuted mt-2">
            Could not find order #{orderId} to submit a review.
          </p>
          <div className="mt-6">
            <Link
              href="/orders"
              className="inline-block px-5 py-2.5 bg-brand-navy text-white text-xs font-bold uppercase hover:bg-slate-800"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === "SUCCESS";
  const hasExistingReview = !!order.review && !isEditing;

  return (
    <div className="min-h-screen bg-brand-lightBg py-10 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs uppercase text-brand-textMuted mb-6 font-bold">
          <Link href="/" className="hover:text-brand-navy hover:underline">
            SwitchLab
          </Link>
          <span>/</span>
          <Link href="/orders" className="hover:text-brand-navy hover:underline">
            Orders
          </Link>
          <span>/</span>
          <Link href={`/orders/${orderId}`} className="hover:text-brand-navy hover:underline">
            Order #{orderId}
          </Link>
          <span>/</span>
          <span className="text-brand-navy">Rate & Review Modder</span>
        </div>

        {/* Header Banner */}
        <div className="bg-brand-sidebar border-2 border-slate-900 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border-2 border-amber-500 bg-amber-50 text-amber-900">
                  [ ⭐ MODDER PERFORMANCE EVALUATION ]
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-emerald-600 bg-emerald-50 text-emerald-800">
                  ✓ Verified Escrow Purchase
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-brand-textMain tracking-tight">
                Rate & Review Your Modder
              </h1>
              <p className="text-xs text-brand-textMuted uppercase tracking-wider mt-1">
                Your feedback sets the artisan reputation score for {order.modder} on the marketplace.
              </p>
            </div>

            <Link
              href={`/orders/${orderId}`}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold uppercase border-2 border-slate-900 inline-flex items-center gap-1.5 shrink-0 self-start md:self-center shadow-xs"
            >
              <span>←</span>
              <span>Back to Order Tracker</span>
            </Link>
          </div>
        </div>

        {/* Order & Modder Summary Card */}
        <div className="bg-white border-2 border-slate-900 p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Keyboard & Mod Service
              </span>
              <h2 className="text-lg font-black text-brand-textMain mt-0.5">
                {order.keyboardModel}
              </h2>
              <p className="text-xs text-brand-navy font-bold mt-0.5">
                {order.service}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Modder Studio
              </span>
              <span className="text-sm font-black text-brand-textMain block">
                {order.modder}
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                Total Paid: Rp {order.totalPrice.toLocaleString()} (Released)
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[11px] text-slate-500">
            <span>Order Reference: #{order.id}</span>
            <span>Delivery: {order.deliveryMethod === "WALK_IN" ? "🏢 Studio Walk-In" : "🚚 Courier Shipping"}</span>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 text-xs font-bold mb-8 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>Review submitted successfully! Thank you for supporting community modders.</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="text-emerald-700 hover:text-emerald-900 font-black text-sm px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold mb-8 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-black text-sm px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Existing Review Read-Only Card */}
        {hasExistingReview ? (
          <div className="bg-white border-2 border-slate-900 p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-4">
              <div>
                <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider border border-emerald-700 bg-emerald-50 text-emerald-800 mb-1.5">
                  ✓ YOUR PUBLISHED REVIEW
                </span>
                <h3 className="text-xl font-black text-brand-textMain">
                  Your Rating for {order.modder}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-9 px-4 border-2 border-slate-900 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                <span>✏️</span>
                <span>Edit This Review</span>
              </button>
            </div>

            {/* Stars & Score */}
            <div className="flex items-center gap-3 bg-brand-lightBg p-4 border-2 border-slate-300">
              <div className="flex items-center gap-1 text-2xl text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= (order.review.rating || 5) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <div>
                <div className="text-base font-black text-slate-900">
                  {order.review.rating}.0 / 5.0
                </div>
                <div className="text-xs text-brand-navy font-bold">
                  {order.review.rating === 5 && "Flawless Tuning & Acoustics"}
                  {order.review.rating === 4 && "Great Build & Tactile Feel"}
                  {order.review.rating === 3 && "Satisfactory Performance"}
                  {order.review.rating === 2 && "Below Expectations"}
                  {order.review.rating === 1 && "Poor Execution"}
                </div>
              </div>
            </div>

            {/* Tags */}
            {order.review.tags && order.review.tags.length > 0 && (
              <div>
                <span className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                  Highlighted Craftsmanship Aspects:
                </span>
                <div className="flex flex-wrap gap-2">
                  {order.review.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs bg-amber-50 border border-amber-400 text-amber-950 font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div>
              <span className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                Written Feedback & Sound Impressions:
              </span>
              <div className="p-4 bg-white border-2 border-slate-800 text-xs text-slate-800 leading-relaxed italic">
                &ldquo;{order.review.comment}&rdquo;
              </div>
            </div>

            {/* Typing Test Link if provided */}
            {order.review.typingTestUrl && (
              <div className="p-3 bg-brand-lightBg border border-slate-300 text-xs flex items-center justify-between">
                <span className="text-slate-600 font-bold">🎵 Customer Typing Sound Test:</span>
                <a
                  href={order.review.typingTestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-navy font-bold hover:underline"
                >
                  {order.review.typingTestUrl} ↗
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Verified Customer: {order.customerId ? `ID #${order.customerId.slice(0, 8)}...` : "Confirmed Buyer"}</span>
              <span>Published on: {order.review.createdAt ? new Date(order.review.createdAt).toLocaleDateString() : "Recent"}</span>
            </div>
          </div>
        ) : (
          /* Review Submission Form */
          <div className="bg-white border-2 border-slate-900 p-6 md:p-8 shadow-xs">
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border border-brand-navy bg-brand-lightBg text-brand-navy mb-1.5">
                [ WRITE MODDER REVIEW ]
              </span>
              <h2 className="text-xl font-black text-brand-textMain">
                How was your experience with {order.modder}?
              </h2>
              <p className="text-xs text-brand-textMuted uppercase tracking-wider mt-1">
                Rate the tactile feel, switch smoothness, acoustic depth, and delivery turnaround.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Star Rating Input */}
              <div className="bg-brand-lightBg border-2 border-slate-900 p-5">
                <label className="block text-xs font-bold text-brand-textMain uppercase tracking-wider mb-2">
                  Overall Craftsmanship Rating (Required):
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer p-1 ${
                            isActive ? "text-amber-500" : "text-slate-300"
                          }`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs font-bold text-brand-navy">
                    {rating === 5 && "5.0 / 5.0 — Flawless Masterpiece! Smooth & Clacky/Thocky 🔥"}
                    {rating === 4 && "4.0 / 5.0 — Great Build & Acoustic Feel 👍"}
                    {rating === 3 && "3.0 / 5.0 — Satisfactory Work, Met Expectations 👌"}
                    {rating === 2 && "2.0 / 5.0 — Below Expectations, Some Wire Rattle ⚠️"}
                    {rating === 1 && "1.0 / 5.0 — Poor Tuning Execution ❌"}
                  </div>
                </div>
              </div>

              {/* 2. Aspect Chips */}
              <div>
                <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
                  Highlight Specific Build Strengths:
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ASPECT_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 text-xs font-mono border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-xs"
                            : "bg-white border-slate-300 text-slate-700 hover:border-slate-700"
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Written Comment */}
              <div>
                <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
                  Detailed Feedback / Sound & Feel Impressions:
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on the switch smoothness (lubing consistency), stabilizer balance (no ticking or rattle), case acoustics, and how communicative the modder was throughout the build..."
                  className="w-full p-3.5 border-2 border-slate-800 text-xs font-mono bg-brand-lightBg focus:outline-none focus:ring-1 focus:ring-brand-navy"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Detailed sound descriptions help other mechanical keyboard enthusiasts choose the right modder.
                </p>
              </div>

              {/* 4. Optional Sound Test URL */}
              <div>
                <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
                  Your Typing Test Audio/Video URL (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://youtube.com/watch?v=... or soundcloud.com/..."
                  value={typingTestUrl}
                  onChange={(e) => setTypingTestUrl(e.target.value)}
                  className="w-full h-11 px-3.5 border-2 border-slate-800 text-xs font-mono bg-brand-lightBg focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:w-auto px-6 py-2.5 border-2 border-slate-400 text-slate-700 text-xs font-bold uppercase hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Your rating directly updates the modder&apos;s public studio score on SwitchLab.
                  </span>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  className="w-full sm:w-auto px-8 text-xs font-mono uppercase font-bold"
                >
                  {submitting ? "Submitting Review..." : isEditing ? "Update Review →" : "Publish Modder Review →"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
