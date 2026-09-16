"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

interface ServiceItem {
  id: number;
  title: string;
  provider: string;
  providerId: string;
  rating: number;
  completedJobs: number;
  pricing: string;
  turnaround: string;
  category: "all" | "switch-mods" | "stabilizers" | "acoustics" | "soldering";
  location: string;
  image: string;
  description: string;
  badge: string;
}

const servicesData: ServiceItem[] = [
  {
    id: 1,
    title: "Linear Switch Lubing & Filming",
    provider: "@DexterKeyboards",
    providerId: "dexter",
    rating: 4.9,
    completedJobs: 127,
    pricing: "Rp 3,500 / switch",
    turnaround: "2-3 Days",
    category: "switch-mods",
    location: "Jakarta Selatan",
    image: "/images/lubing-swtiches.webp",
    description: "Precision hand-lubing with Krytox 205g0 and custom switch filming for zero wobble and buttery smooth acoustics.",
    badge: "SWITCH MODS"
  },
  {
    id: 2,
    title: "Stabilizer Tuning & Holee / Band-Aid Mod",
    provider: "@KeyboardClinic",
    providerId: "clinic",
    rating: 4.8,
    completedJobs: 89,
    pricing: "From Rp 150,000",
    turnaround: "1-2 Days",
    category: "stabilizers",
    location: "Bandung",
    image: "/images/stabs.webp",
    description: "Eliminates stabilizer rattle and tick on Spacebar, Enter, Shift, and Backspace with wire balancing and Permatex grease.",
    badge: "STABILIZERS"
  },
  {
    id: 3,
    title: "Custom Plate & Case Foam Installation",
    provider: "@ModHouse",
    providerId: "modhouse",
    rating: 4.7,
    completedJobs: 156,
    pricing: "Rp 75,000 / board",
    turnaround: "1 Day",
    category: "acoustics",
    location: "Surabaya",
    image: "/images/foam.jpg",
    description: "Laser-cut Poron or EVA dampening tailored to eliminate hollow case ping and deepen switch acoustics into pure thock.",
    badge: "ACOUSTICS"
  },
  {
    id: 4,
    title: "Tactile Switch Stem Lubing & Spring Swapping",
    provider: "@SwitchMaster",
    providerId: "switchmaster",
    rating: 4.9,
    completedJobs: 203,
    pricing: "Rp 4,000 / switch",
    turnaround: "3-4 Days",
    category: "switch-mods",
    location: "Yogyakarta",
    image: "/images/switches.jpg",
    description: "TriboSys 3203 lube keeping tactile bump pronounced while silencing scratch, plus progressive spring swaps.",
    badge: "SWITCH MODS"
  },
  {
    id: 5,
    title: "PCB Mill-Max Hotswap Socket Soldering",
    provider: "@KeyboardClinic",
    providerId: "clinic",
    rating: 4.8,
    completedJobs: 89,
    pricing: "Rp 250,000 / board",
    turnaround: "3-5 Days",
    category: "soldering",
    location: "Bandung",
    image: "/images/repair-kb.png",
    description: "Convert your soldered PCB into a universal hot-swappable board with high-durability Mill-Max 0305/7305 sockets.",
    badge: "SOLDERING"
  },
  {
    id: 6,
    title: "Broken Trace PCB Repair & Jumper Soldering",
    provider: "@ModHouse",
    providerId: "modhouse",
    rating: 4.7,
    completedJobs: 156,
    pricing: "From Rp 120,000",
    turnaround: "2-4 Days",
    category: "soldering",
    location: "Surabaya",
    image: "/images/repair-kb.png",
    description: "Diagnostic repair for dead rows/columns, torn solder pads, detached diodes, or bricked USB ports.",
    badge: "REPAIR"
  }
];

export default function ServicesCatalogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const filteredServices = servicesData.filter((service) => {
    const matchesCategory = activeCategory === "all" || service.category === activeCategory;
    const matchesCity = selectedCity === "all" || service.location.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesCategory && matchesCity;
  });

  return (
    <div className="min-h-screen bg-brand-lightBg pb-16">
      {/* Header Banner with Cyber-Industrial Polish */}
      <div className="bg-white border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-400 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ESCROW VAULT GUARANTEE · BCA VERIFIED</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-brand-textMain tracking-tight">
                Keyboard Modding Services
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1 max-w-2xl">
                Verified Artisans • 6-Stage Live Workbench Tracking • Sound-Test Acoustic Proof
              </p>
            </div>
            
            {/* Telemetry Stats Card */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 grid grid-cols-2 gap-6 font-mono">
              <div>
                <div className="text-[10px] text-brand-textMuted uppercase tracking-wider">Verified Artisans</div>
                <div className="text-2xl font-black text-brand-navy">18 Modders</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">✓ 100% KTP KYC</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-[10px] text-brand-textMuted uppercase tracking-wider">Escrow Jobs Done</div>
                <div className="text-2xl font-black text-slate-800">1,420+</div>
                <div className="text-[10px] text-brand-navy font-bold mt-0.5">0% Scam Risk</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white border-2 border-slate-900 p-2 shadow-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { key: "all", label: "All Services" },
              { key: "switch-mods", label: "Switch Mods" },
              { key: "stabilizers", label: "Stabilizers" },
              { key: "acoustics", label: "Acoustics" },
              { key: "soldering", label: "Soldering & Repair" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                  activeCategory === tab.key
                    ? "bg-brand-navy text-white border-brand-navy shadow-xs"
                    : "text-slate-600 border-transparent hover:text-brand-navy hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-mono font-bold uppercase text-brand-textMuted">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter services by city"
              className="bg-brand-lightBg border-2 border-slate-800 px-3 py-1.5 text-xs font-mono font-bold text-brand-textMain focus:border-brand-navy focus:outline-none uppercase cursor-pointer"
            >
              <option value="all">All Locations</option>
              <option value="jakarta">Jakarta</option>
              <option value="bandung">Bandung</option>
              <option value="surabaya">Surabaya</option>
              <option value="yogyakarta">Yogyakarta</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-mono text-brand-textMuted uppercase tracking-wider font-bold">
            Showing {filteredServices.length} Escrow-Protected Modding Service{filteredServices.length === 1 ? "" : "s"}
          </span>
          <span className="text-[11px] font-mono text-brand-navy font-bold">
            BCA Rekber Vault Active
          </span>
        </div>

        {/* Modern Elevated Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border-2 border-slate-900 overflow-hidden hover:shadow-xl hover:border-brand-navy hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
            >
              {/* Card Top Information */}
              <div>
                {/* Header Bar */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-navy text-white">
                    {service.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-600 font-semibold flex items-center gap-1">
                    <span>⏳</span>
                    <span>{service.turnaround}</span>
                  </span>
                </div>

                {/* Hero Image Container */}
                <div className="relative h-44 bg-slate-100 overflow-hidden border-b border-slate-200">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 bg-white/95 border border-slate-800 text-[10px] font-mono font-bold text-slate-900 shadow-xs">
                      ✓ KTP VERIFIED
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  <h3 className="font-bold text-base text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-brand-textMuted mb-4 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Modder Identity Bar */}
                  <div className="flex justify-between items-center text-xs font-mono p-2.5 bg-brand-lightBg border border-slate-200 mb-4">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-brand-navy">{service.provider}</span>
                    </div>
                    <span className="text-slate-500 shrink-0 text-[11px]">📍 {service.location}</span>
                  </div>

                  {/* Rating & Sound-Test Trust Indicators */}
                  <div className="flex items-center justify-between text-xs font-mono mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 font-bold">★</span>
                      <span className="font-bold text-slate-900">{service.rating}</span>
                      <span className="text-slate-400">({service.completedJobs} jobs)</span>
                    </div>
                    <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 font-bold">
                      🎧 Audio Proof
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200 flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-brand-textMuted uppercase block">Starting Price</span>
                      <span className="text-base font-mono font-black text-brand-navy">
                        {service.pricing}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300 uppercase">
                      Rekber Safe
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <Link href={`/service/${service.id}`} className="block w-full">
                  <Button variant="primary" isLoading={false} className="w-full font-mono text-xs font-bold py-3 uppercase tracking-wider">
                    Configure & Book (Escrow) →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
