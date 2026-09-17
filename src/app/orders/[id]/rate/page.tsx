"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

const QUICK_TAGS = [
  "✨ Kualitas Modding Mantap",
  "🔊 Suara Thocky / Clacky",
  "🧈 Stem Switch Halus",
  "🔇 Zero Wire Rattle",
  "⚡ Pengerjaan Cepat",
  "📦 Packing Sangat Aman",
  "💬 Respon Modder Ramah",
  "🎯 Sesuai Ekspektasi",
];

const RATING_FEEDBACK: Record<number, { title: string; subtitle: string }> = {
  5: { title: "Sangat Puas! 😍", subtitle: "Kualitas modding dan suara keyboard luar biasa mantap!" },
  4: { title: "Puas 👍", subtitle: "Pengerjaan rapi dan tactile feel enak sesuai pesanan." },
  3: { title: "Cukup Puas 👌", subtitle: "Hasil modding standar, cukup memenuhi ekspektasi." },
  2: { title: "Kurang Puas 😕", subtitle: "Ada beberapa bagian rattle atau stem yang kurang pas." },
  1: { title: "Kecewa 😞", subtitle: "Hasil pengerjaan tidak sesuai dengan kesepakatan." },
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

  // Tokopedia-style review form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "✨ Kualitas Modding Mantap",
    "🔊 Suara Thocky / Clacky",
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

    const fullComment = comment.trim() || "Puas banget dengan hasil tuning dan lubing modder ini!";

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
        title: `⭐ Ulasan Baru ★${rating}.0 dari Pelanggan!`,
        message: `Pelanggan memberikan ulasan untuk pesanan #${orderId}: "${fullComment}"`,
        orderId: orderId,
        link: "/modder/dashboard",
      });

      setSuccess(true);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-mono">
        <div className="bg-white border-2 border-slate-900 p-8 text-center max-w-sm w-full shadow-md">
          <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
          <p className="text-sm font-bold text-slate-800">Memuat Formulir Ulasan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-mono">
        <div className="bg-white border-2 border-slate-900 p-8 text-center max-w-md w-full shadow-md space-y-4">
          <div className="text-4xl">📦</div>
          <h2 className="text-lg font-black text-slate-900">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-600">
            Pesanan #{orderId} tidak ditemukan untuk diberikan ulasan.
          </p>
          <Link
            href="/orders"
            className="inline-block px-5 py-2.5 bg-brand-navy text-white text-xs font-bold uppercase hover:bg-slate-800"
          >
            ← Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const currentFeedback = RATING_FEEDBACK[hoverRating || rating] || RATING_FEEDBACK[5];
  const hasExistingReview = !!order.review && !isEditing;

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/orders/${orderId}`}
            className="text-xs font-mono font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Kembali ke Detail Pesanan</span>
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
              <span>Ulasan berhasil disimpan! Terima kasih telah memberi rating.</span>
            </div>
            <Link
              href={`/orders/${orderId}`}
              className="px-3 py-1 bg-emerald-600 text-white text-[11px] uppercase font-bold hover:bg-emerald-700"
            >
              Lihat Pesanan
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

        {/* Main Review Card - Tokopedia Style */}
        <div className="bg-white border-2 border-slate-900 shadow-md">
          {/* Header: Product & Seller Info */}
          <div className="p-5 border-b border-slate-200 flex items-center gap-4 bg-slate-50/70">
            <div className="w-14 h-14 bg-brand-navy text-white text-2xl flex items-center justify-center border border-slate-800 shrink-0">
              ⌨️
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                ✓ Selesai • Escrow Released
              </span>
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {order.service}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mt-0.5">
                <span className="font-semibold text-brand-navy">{order.modder}</span>
                <span>•</span>
                <span className="text-slate-500">{order.keyboardModel}</span>
              </div>
            </div>
          </div>

          {/* Published Review View */}
          {hasExistingReview ? (
            <div className="p-6 space-y-5 font-mono">
              <div className="text-center py-2">
                <div className="flex justify-center items-center gap-1.5 text-3xl text-amber-500 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= (order.review.rating || 5) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {RATING_FEEDBACK[order.review.rating]?.title || "Puas"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ulasan kamu telah dipublikasikan untuk profil modder
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
                    Buka Link Sound Test ↗
                  </a>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <Link
                  href={`/orders/${orderId}`}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Kembali ke Pesanan
                </Link>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider border-2 border-slate-900"
                >
                  ✏️ Ubah Ulasan
                </button>
              </div>
            </div>
          ) : (
            /* Tokopedia-Style Rating Input Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 1. Star Rating (Centered & Interactive) */}
              <div className="text-center space-y-2">
                <p className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
                  Bagaimana kualitas modding dari modder?
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
                        className={`text-4xl transition-all duration-150 transform hover:scale-125 focus:outline-none cursor-pointer p-1 ${
                          active ? "text-amber-400" : "text-slate-200 hover:text-amber-200"
                        }`}
                        title={`${star} Bintang`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                <div className="min-h-[38px] flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {currentFeedback.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentFeedback.subtitle}
                  </span>
                </div>
              </div>

              {/* 2. Quick Tags (Tokopedia "Puas dengan apa?") */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-mono font-bold text-slate-700">
                  Apa yang paling kamu suka dari modding ini?
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-xs"
                            : "bg-white border-slate-300 text-slate-600 hover:border-slate-500"
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Comment Textarea */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-mono font-bold text-slate-700">
                    Tulis ulasan untuk modder:
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {comment.length}/500
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan kepuasanmu tentang kualitas modding, sound test, dan layanan modder..."
                  className="w-full p-3 border-2 border-slate-800 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy"
                  required
                />
              </div>

              {/* 4. Optional Sound Test Toggle */}
              <div className="pt-1">
                {!showUrlInput ? (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="text-xs font-mono text-brand-navy hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Tambah link video/sound test typing (opsional)</span>
                  </button>
                ) : (
                  <div className="space-y-1 bg-slate-50 p-3 border border-slate-300">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Link YouTube / SoundCloud Sound Test (Opsional):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTypingTestUrl("");
                          setShowUrlInput(false);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={typingTestUrl}
                      onChange={(e) => setTypingTestUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-400 bg-white focus:outline-none focus:border-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 border border-slate-400 text-slate-700 text-xs font-mono font-bold uppercase hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                ) : (
                  <Link
                    href={`/orders/${orderId}`}
                    className="px-4 py-2.5 text-slate-600 text-xs font-mono font-bold hover:text-slate-900 cursor-pointer"
                  >
                    Nanti Saja
                  </Link>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  className="px-8 py-2.5 text-xs font-mono uppercase font-bold"
                >
                  {submitting ? "Mengirim..." : isEditing ? "Simpan Perubahan →" : "Kirim Ulasan →"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
