"use client";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";

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
  services: { id: number; title: string; price: string; time: string }[];
  reviews: { customer: string; date: string; rating: number; comment: string }[];
}

const modderProfiles: Record<string, ModderDetail> = {
  dexter: {
    id: "dexter",
    name: "Dexter Keyboards",
    handle: "@DexterKeyboards",
    location: "Jakarta Selatan, DKI Jakarta",
    rating: 4.9,
    completedJobs: 127,
    bio: "Certified artisan keyboard builder and switch technician with 4+ years experience. Specializing in high-end linear switches, custom plate acoustics, and hand-soldered vintage boards.",
    equipment: ["Krytox 205g0", "TriboSys 3203", "Kelowna Aluminum Switch Openers", "Hakko FX-888D Soldering Station", "Kester 63/37 Solder Wire"],
    badges: ["VERIFIED MODDER", "TOP RATED 2026", "FAST TURNAROUND"],
    portfolio: [
      {
        title: "Tofu65 Acrylic Custom Build",
        image: "/images/prebuilt-kb.webp",
        desc: "Lubed Cherry MX Hyperglides on brass plate with custom silicone dampening."
      },
      {
        title: "Mode Sonnet Hand-Lubed Lubing Session",
        image: "/images/lubing-swtiches.webp",
        desc: "90x Gateron Oil Kings lubed with Krytox 205g0 and 0.125mm polycarbonate films."
      },
      {
        title: "Durock V2 Precision Stabilizer Tuning",
        image: "/images/stabs.webp",
        desc: "Holee modded with balanced wire straightness tested on granite block."
      }
    ],
    services: [
      { id: 1, title: "Linear Switch Lubing & Filming", price: "Rp 3,500 / switch", time: "2-3 Days" },
      { id: 4, title: "Tactile Stem Lubing & Spring Swapping", price: "Rp 4,000 / switch", time: "3-4 Days" }
    ],
    reviews: [
      {
        customer: "Adit P.",
        date: "Sep 2, 2026",
        rating: 5,
        comment: "Insane smoothness on my Oil Kings! Zero spring ping and turnaround was under 48 hours."
      },
      {
        customer: "Reza M.",
        date: "Aug 19, 2026",
        rating: 5,
        comment: "Dexter tuned my Spacebar wire to absolute perfection. Best modder in Jakarta hands down."
      }
    ]
  }
};

export default function ModderProfilePage() {
  const params = useParams();
  const modderKey = (params?.id as string)?.toLowerCase() || "dexter";
  const modder = modderProfiles[modderKey] || modderProfiles.dexter;

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
                <div className="text-brand-textMuted uppercase">Jobs Completed</div>
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

            {/* Sound Test Player */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Studio Sound Test Station
              </h2>

              <div className="border-2 border-slate-800 p-4 bg-brand-lightBg space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-brand-textMain">
                    Gateron Oil Kings (Krytox 205g0) on PC Plate
                  </span>
                  <span className="text-green-700 font-bold">[ VERIFIED RECORDING ]</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 border-2 border-slate-800">
                  <button className="w-9 h-9 bg-brand-navy text-white font-mono flex items-center justify-center font-bold">
                    ▶
                  </button>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-200 border border-slate-400">
                      <div className="h-full bg-brand-navy w-3/5"></div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-brand-textMuted">0:21 / 0:45</span>
                </div>
              </div>
            </div>

            {/* Portfolio Builds Gallery */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-6 pb-2 border-b-2 border-slate-900">
                Showcase Portfolio Builds
              </h2>

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
                      <p className="text-[11px] text-brand-textMuted leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Verified Customer Reviews ({modder.reviews.length})
              </h2>

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
            </div>
          </div>

          {/* Right Column: Direct Booking Services (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Book Services by {modder.name}
              </h3>

              <div className="space-y-4">
                {modder.services.map((svc) => (
                  <div key={svc.id} className="border-2 border-slate-800 p-4 bg-brand-lightBg">
                    <h4 className="font-bold text-sm text-brand-textMain mb-1">{svc.title}</h4>
                    <div className="flex justify-between items-baseline mb-3 font-mono text-xs">
                      <span className="font-bold text-brand-navy">{svc.price}</span>
                      <span className="text-brand-textMuted">⏳ {svc.time}</span>
                    </div>
                    <a href={`/service/${svc.id}`}>
                      <Button variant="primary" isLoading={false} className="w-full text-xs">
                        Configure & Book →
                      </Button>
                    </a>
                  </div>
                ))}
              </div>

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
