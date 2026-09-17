"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

const QUICK_TAGS = [
  "✨ Masterful Modding Quality",
  "🔊 Deep Thocky / Clean Clacky",
  "🧈 Buttery Smooth Switches",
  "🔇 Zero Stabilizer Rattle",
  "⚡ Fast Turnaround Time",
  "📦 Bulletproof Packaging",
  "💬 Great Communication",
  "🎯 Exceeded Expectations",
];

const RATING_FEEDBACK: Record<number, { title: string; subtitle: string }> = {
  5: { title: "Outstanding! 😍", subtitle: "Top-tier craftsmanship, stellar acoustics, and great service!" },
  4: { title: "Great Experience 👍", subtitle: "Clean modding work and satisfying keypress feel." },
  3: { title: "Satisfactory 👌", subtitle: "Standard modding work that meets baseline expectations." },
  2: { title: "Needs Improvement 😕", subtitle: "Noticed slight stabilizer wire rattle or uneven lubing." },
  1: { title: "Disappointed 😞", subtitle: "Build quality did not meet agreed specifications." },
};

export default function OrderRatingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "✨ Masterful Modding Quality",
    "🔊 Deep Thocky / Clean Clacky",
  ]);
  const [typingTestUrl, setTypingTestUrl] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState(false);
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
          const orderData = {
            id: resolved.id,
            totalPrice: resolved.totalPrice || 0,
            keyboardModel: resolved.keyboardModel || "Mechanical Keyboard",
            modder: resolved.modder?.name ? `@${resolved.modder.name}` : resolved.modder || "@VerifiedModder",
            modderId: resolved.modderId || resolved.modder?.id,
            customerId: resolved.customerId || resolved.customer?.id,
            service: resolved.items?.[0]?.service?.title || resolved.service || "Keyboard Sound Tuning",
            status: resolved.status,
            review: resolved.review || localOrder?.review || null,
          };

          setOrder(orderData);

          if (orderData.review) {
            setRating(orderData.review.rating || 5);
            setComment(orderData.review.comment || "");
            if (orderData.review.tags) setSelectedTags(orderData.review.tags);
            if (orderData.review.typingTestUrl) {
              setTypingTestUrl(orderData.review.typingTestUrl);
              setShowUrlInput(true);
            }
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

    const fullComment = comment.trim() || "Extremely satisfied with the build quality and acoustic profile tuned by this modder!";

    try {
      try {
        await api.orders.addReview(orderId, {
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
        message: `Customer left a review for Order #${orderId}: "${fullComment}"`,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-mono">
        <div className="bg-white border-2 border-slate-900 p-8 text-center max-w-sm w-full shadow-md">
          <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
          <p className="text-sm font-bold text-slate-800">Loading Review Form...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-mono">
        <div className="bg-white border-2 border-slate-900 p-8 text-center max-w-md w-full shadow-md space-y-4">
          <div className="text-4xl">📦</div>
          <h2 className="text-lg font-black text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-600">
            Order #{orderId} could not be found to leave a review.
          </p>
          <Link
            href="/orders"
            className="inline-block px-5 py-2.5 bg-brand-navy text-white text-xs font-bold uppercase hover:bg-slate-800"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentFeedback = RATING_FEEDBACK[hoverRating || rating] || RATING_FEEDBACK[5];
  const hasExistingReview = !!order.review && !isEditing;

  return (
    <div className="min-h-screen bg-slate-100/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/orders/${orderId}`}
            className="text-xs font-mono font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to Order Details</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400">
            Order #{order.id.slice(0, 8)}...
          </span>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 text-xs font-mono font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>Review submitted successfully! Thank you for rating this build.</span>
            </div>
            <Link
              href={`/orders/${orderId}`}
              className="px-3 py-1 bg-emerald-600 text-white text-[11px] uppercase font-bold hover:bg-emerald-700"
            >
              View Order
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-mono font-bold flex items-center justify-between shadow-xs">
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Review Card */}
        <div className="bg-white border-2 border-slate-900 shadow-md">
          {/* Header Bar: Service & Modder Info */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-brand-navy text-white text-xl flex items-center justify-center border border-slate-800 shrink-0 shadow-2xs">
                ⌨️
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                  ✓ Completed • Escrow Released
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  {order.service}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mt-0.5">
                  <span className="font-semibold text-brand-navy">{order.modder}</span>
                  <span>•</span>
                  <span className="text-slate-500">{order.keyboardModel}</span>
                </div>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-700 sm:text-right">
              Total: <strong className="text-slate-900">Rp {order.totalPrice.toLocaleString()}</strong>
            </span>
          </div>

          {/* Published Review Mode */}
          {hasExistingReview ? (
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x border-slate-200 font-mono">
              {/* Left Column: Stars & Mood */}
              <div className="md:col-span-5 p-6 text-center space-y-4 bg-slate-50/40 flex flex-col justify-center">
                <div>
                  <div className="flex justify-center items-center gap-1.5 text-3xl text-amber-500 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= (order.review.rating || 5) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {RATING_FEEDBACK[order.review.rating]?.title || "Satisfied"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your verified review is live on the modder&apos;s portfolio profile.
                  </p>
                </div>

                {order.review.tags && order.review.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {order.review.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Feedback & Actions */}
              <div className="md:col-span-7 p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    What you shared:
                  </span>
                  <div className="p-4 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 leading-relaxed italic">
                    &ldquo;{order.review.comment}&rdquo;
                  </div>

                  {order.review.typingTestUrl && (
                    <div className="text-xs text-slate-600 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span>🎵 Sound Test Link:</span>
                      <a
                        href={order.review.typingTestUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-navy font-bold hover:underline"
                      >
                        Open Sound Test Link ↗
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <Link
                    href={`/orders/${orderId}`}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    Back
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider border-2 border-slate-900 cursor-pointer"
                  >
                    ✏️ Edit Review
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 2-Column Rating Input Form */
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x border-slate-200">
                {/* Left Column: Star Rating & Quick Tags */}
                <div className="md:col-span-6 p-6 space-y-5 bg-slate-50/40">
                  {/* Star Rating */}
                  <div className="text-center space-y-2">
                    <p className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      How would you rate the modding quality & service?
                    </p>

                    <div className="flex justify-center items-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className={`text-4xl transition-all duration-150 transform hover:scale-125 focus:outline-none cursor-pointer p-0.5 ${
                              active ? "text-amber-400" : "text-slate-200 hover:text-amber-200"
                            }`}
                            title={`${star} Star${star > 1 ? "s" : ""}`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>

                    <div className="min-h-[36px] flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {currentFeedback.title}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {currentFeedback.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Quick Tags */}
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <label className="block text-xs font-mono font-bold text-slate-700">
                      What did you appreciate most about this build?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-2xs"
                                : "bg-white border-slate-300 text-slate-600 hover:border-slate-500"
                            }`}
                          >
                            {isSelected ? `✓ ${tag}` : tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Feedback Textarea & Submit */}
                <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-mono font-bold text-slate-700">
                        Write a review for the modder:
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {comment.length}/500
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts on acoustic sound profile, switch smoothness, stabilizer balance, and communication..."
                      className="w-full p-3 border-2 border-slate-800 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy"
                      required
                    />

                    {/* Optional Sound Test Toggle */}
                    <div>
                      {!showUrlInput ? (
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(true)}
                          className="text-xs font-mono text-brand-navy hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>+ Add sound / typing test link (optional)</span>
                        </button>
                      ) : (
                        <div className="space-y-1 bg-slate-50 p-2.5 border border-slate-300">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-mono font-bold text-slate-700">
                              YouTube / SoundCloud Sound Test Link:
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setTypingTestUrl("");
                                setShowUrlInput(false);
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-800 font-bold"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            value={typingTestUrl}
                            onChange={(e) => setTypingTestUrl(e.target.value)}
                            className="w-full px-3 py-1 text-xs font-mono border border-slate-400 bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-slate-400 text-slate-700 text-xs font-mono font-bold uppercase hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    ) : (
                      <Link
                        href={`/orders/${orderId}`}
                        className="px-4 py-2 text-slate-600 text-xs font-mono font-bold hover:text-slate-900 cursor-pointer"
                      >
                        Maybe Later
                      </Link>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={submitting}
                      className="px-7 py-2.5 text-xs font-mono uppercase font-bold"
                    >
                      {submitting ? "Submitting..." : isEditing ? "Save Changes →" : "Submit Review →"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
