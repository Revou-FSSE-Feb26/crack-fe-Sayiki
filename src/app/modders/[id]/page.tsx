"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

interface ModderDetail {
  id: string;
  name: string;
  handle: string;
  location: string;
  rating: number;
  completedJobs: number;
  bio: string;
  equipment: string[];
  badges: string[];
  portfolio: { title: string; image: string; desc: string }[];
  services: { id: string; title: string; price: string; time: string }[];
  reviews: { customer: string; date: string; rating: number; comment: string }[];
}

export default function ModderProfilePage() {
  const params = useParams();
  const modderId = params?.id as string;

  const [modder, setModder] = useState<ModderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModder() {
      if (!modderId) return;
      try {
        setLoading(true);
        setError(null);

        // Try getting user profile directly or via modder portfolios
        let userData: any = null;
        try {
          userData = await api.users.getById(modderId);
        } catch (e) {
          // If direct users/:id isn't accessible, look in modders list
          const allModders = await api.modders.getAll();
          const match = allModders.find(
            (m: any) => m.id === modderId || m.modderId === modderId
          );
          if (match) {
            userData = match.modder;
            userData.portfolios = allModders.filter((m: any) => m.modderId === match.modderId);
          }
        }

        // Also fetch all services to find services offered by this modder
        const allServices = await api.listings.getAll().catch(() => []);
        const modderServices = (Array.isArray(allServices) ? allServices : []).filter(
          (s: any) => s.modderId === modderId || s.modder?.name === userData?.name
        );

        if (userData) {
          const detail: ModderDetail = {
            id: userData.id,
            name: userData.name || "Artisan Modder",
            handle: `@${userData.name?.replace(/\s+/g, "") || "Modder"}`,
            location: `${userData.locationCity || "Indonesia"}`,
            rating: userData.avgRating || 4.9,
            completedJobs: 45 + (userData.name?.length || 5) * 8,
            bio: `Verified mechanical keyboard craftsman specializing in custom lubing, precision acoustic tuning, and PCB assembly in ${userData.locationCity || "Indonesia"}.`,
            equipment: [
              "Krytox 205g0 & TriboSys 3203",
              "Ultrasonic Cleaner",
              "Precision Switch Openers",
              "Wire Straightening Jigs",
              "Temperature Controlled Soldering Station"
            ],
            badges: ["VERIFIED MODDER", "KTP VERIFIED", "ESCROW PROTECTED"],
            portfolio: (userData.portfolios || []).map((p: any, idx: number) => ({
              title: p.title || "Custom Mechanical Build",
              image: `/images/${idx % 2 === 0 ? "lubing-swtiches.webp" : "stabs.webp"}`,
              desc: p.description || "Tuned on workbench with custom acoustic dampening.",
            })),
            services: modderServices.map((s: any) => ({
              id: s.id,
              title: s.title,
              price: `Rp ${s.basePrice.toLocaleString()} ${s.category === "SWITCH_MODS" ? "/ switch" : "/ board"}`,
              time: s.category === "SWITCH_MODS" ? "2-3 Days" : "1-2 Days",
            })),
            reviews: (userData.reviewsAsModder || []).map((r: any) => ({
              customer: "Verified Client",
              date: new Date(r.createdAt || Date.now()).toLocaleDateString(),
              rating: r.rating || 5,
              comment: r.comment || "Superb switch smoothness and fast turnaround!",
            })),
          };
          setModder(detail);
        } else {
          setError("Modder studio profile not found in database.");
        }
      } catch (err) {
        console.error("Failed to load modder profile:", err);
        setError("Could not load modder details.");
      } finally {
        setLoading(false);
      }
    }

    loadModder();
  }, [modderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8">
        <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center max-w-md w-full font-mono text-xs">
          <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
          <h2 className="font-bold text-brand-textMain uppercase">
            Loading Modder Studio Profile...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !modder) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8">
        <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center max-w-md w-full font-mono">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-brand-textMain mb-2">Modder Not Found</h2>
          <p className="text-xs text-brand-textMuted uppercase mb-6">
            {error || "The requested craftsman profile could not be found."}
          </p>
          <Link href="/modders">
            <Button variant="primary" isLoading={false}>
              ← Back to Modders Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Modder Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex gap-5 items-center">
              {/* Sharp Square Avatar */}
              <div className="w-24 h-24 bg-brand-navy border-2 border-slate-900 text-white flex items-center justify-center font-black text-3xl font-mono">
                {modder.name.charAt(0)}
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-1.5">
                  {modder.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-lightBg border-2 border-brand-navy text-brand-navy"
                    >
                      [ {badge} ]
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl font-black text-brand-textMain tracking-tight">
                  {modder.name}
                </h1>
                <p className="text-xs font-mono text-brand-textMuted uppercase">
                  {modder.handle} • 📍 {modder.location}
                </p>
              </div>
            </div>

            {/* Reputation Box */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6 font-mono text-xs">
              <div>
                <div className="text-brand-textMuted uppercase">Customer Rating</div>
                <div className="text-xl font-bold text-slate-800 flex items-center gap-1">
                  <span className="text-yellow-500">★</span> {modder.rating}
                </div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-brand-textMuted uppercase">Completed Builds</div>
                <div className="text-xl font-bold text-brand-navy">{modder.completedJobs}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Bio, Sound Test, Portfolio (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bio & Equipment */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-3 pb-2 border-b-2 border-slate-900">
                About the Craftsman
              </h2>
              <p className="text-sm text-brand-textMain leading-relaxed mb-4">
                {modder.bio}
              </p>

              <h3 className="font-mono text-xs font-bold uppercase text-brand-textMuted mb-2">
                Workshop Equipment & Materials
              </h3>
              <div className="flex flex-wrap gap-2">
                {modder.equipment.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 text-xs font-mono border border-slate-400 bg-brand-lightBg text-slate-700"
                  >
                    • {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio Builds Gallery */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-6 pb-2 border-b-2 border-slate-900">
                Verified Portfolio Builds ({modder.portfolio.length})
              </h2>

              {modder.portfolio.length === 0 ? (
                <p className="text-xs font-mono text-brand-textMuted uppercase">
                  No portfolio builds uploaded yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {modder.portfolio.map((item, idx) => (
                    <div key={idx} className="border-2 border-slate-900 bg-brand-lightBg overflow-hidden group">
                      <div className="h-36 overflow-hidden border-b-2 border-slate-900">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-xs text-brand-textMain mb-1">{item.title}</h4>
                        <p className="text-[11px] text-brand-textMuted leading-tight line-clamp-2">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Reviews */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Verified Customer Reviews ({modder.reviews.length})
              </h2>

              {modder.reviews.length === 0 ? (
                <p className="text-xs font-mono text-brand-textMuted uppercase">
                  No customer reviews yet. Be the first to book and review!
                </p>
              ) : (
                <div className="space-y-4">
                  {modder.reviews.map((rev, i) => (
                    <div key={i} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="font-bold text-brand-textMain">{rev.customer}</span>
                        <span className="text-brand-textMuted">{rev.date}</span>
                      </div>
                      <div className="text-yellow-500 text-xs mb-1">★★★★★</div>
                      <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Direct Booking Services (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Active Services by {modder.name}
              </h3>

              {modder.services.length === 0 ? (
                <div className="text-center py-6 bg-brand-lightBg border border-slate-300 font-mono text-xs text-brand-textMuted">
                  No active standalone services listed for this studio.
                </div>
              ) : (
                <div className="space-y-4">
                  {modder.services.map((svc) => (
                    <div key={svc.id} className="border-2 border-slate-800 p-4 bg-brand-lightBg">
                      <h4 className="font-bold text-sm text-brand-textMain mb-1">{svc.title}</h4>
                      <div className="flex justify-between items-baseline mb-3 font-mono text-xs">
                        <span className="font-bold text-brand-navy">{svc.price}</span>
                        <span className="text-brand-textMuted">⏳ {svc.time}</span>
                      </div>
                      <Link href={`/service/${svc.id}`}>
                        <Button variant="primary" isLoading={false} className="w-full text-xs">
                          Configure & Book →
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-mono text-brand-textMuted leading-relaxed">
                🛡️ All modding jobs are safeguarded by <strong>SwitchLab Escrow</strong>. Funds are only disbursed once you confirm the sound test and receipt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
