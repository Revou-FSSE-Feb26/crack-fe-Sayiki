"use client";
import { useState } from "react";
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
    description: "Precision hand-lubing with Krytox 205g0 and custom switch filming for zero wobble and maximum smoothness.",
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
    description: "Laser-cut Poron or EVA dampening tailored to eliminate hollow case ping and deepen sound signature.",
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
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ ESCROW PROTECTED SERVICES ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Keyboard Modding Services
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Verified Modders • Escrow Payment Protection • Nationwide Shipping
              </p>
            </div>
            
            {/* Quick Stats Box */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Active Modders</div>
                <div className="text-xl font-mono font-bold text-brand-navy">18 Verified</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Jobs Completed</div>
                <div className="text-xl font-mono font-bold text-brand-navy">1,420+</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="inline-flex flex-wrap bg-brand-sidebar border-2 border-slate-900 p-1">
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
                className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                  activeCategory === tab.key
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "text-brand-textMuted border-transparent hover:text-brand-textMain"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-brand-textMuted">Location:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-brand-sidebar border-2 border-slate-900 px-3 py-2 text-xs font-mono font-bold text-brand-textMain focus:border-brand-navy focus:outline-none uppercase"
            >
              <option value="all">All Cities</option>
              <option value="jakarta">Jakarta</option>
              <option value="bandung">Bandung</option>
              <option value="surabaya">Surabaya</option>
              <option value="yogyakarta">Yogyakarta</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-xs font-mono text-brand-textMuted uppercase tracking-wider">
          Showing {filteredServices.length} available service{filteredServices.length === 1 ? "" : "s"}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between"
            >
              {/* Card Top */}
              <div>
                <div className="p-4 pb-2 flex justify-between items-center">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy">
                    [ {service.badge} ]
                  </span>
                  <span className="text-xs font-mono text-brand-textMuted">
                    ⏳ {service.turnaround}
                  </span>
                </div>

                <div className="px-4 pb-2">
                  <div className="h-40 bg-brand-lightBg overflow-hidden border border-slate-300">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                <div className="p-4 pt-2">
                  <h3 className="font-bold text-lg text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-brand-textMuted mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Modder Meta */}
                  <div className="flex justify-between items-center text-xs font-mono border-t border-slate-200 pt-2 mb-3">
                    <span className="font-semibold text-brand-navy">{service.provider}</span>
                    <span className="text-brand-textMuted">📍 {service.location}</span>
                  </div>

                  {/* Rating & Price */}
                  <div className="flex justify-between items-baseline mb-4">
                    <div className="flex items-center gap-1 text-xs font-mono">
                      <span className="text-yellow-500">★</span>
                      <span className="font-bold text-slate-800">{service.rating}</span>
                      <span className="text-brand-textMuted">({service.completedJobs} jobs)</span>
                    </div>
                    <div className="text-lg font-mono font-extrabold text-brand-navy">
                      {service.pricing}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <a href={`/service/${service.id}`} className="block w-full">
                  <Button variant="primary" isLoading={false} className="w-full">
                    Configure & Book (Escrow) →
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-8">
            <p className="text-brand-textMuted font-mono text-base mb-4 uppercase">
              No services found matching your selected filters.
            </p>
            <Button
              variant="secondary"
              isLoading={false}
              onClick={() => {
                setActiveCategory("all");
                setSelectedCity("all");
              }}
              className="inline-block w-auto"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
