"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

const getCategoryFallbackImage = (category?: string) => {
  switch (category) {
    case "SWITCH_MODS":
      return "/images/lubing-swtiches.webp";
    case "STABILIZER_MODS":
      return "/images/stabs.webp";
    case "CASE_AND_ACOUSTIC":
      return "/images/foam.jpg";
    case "CUSTOMIZATION_AESTHETICS":
    default:
      return "/images/repair-kb.png";
  }
};

const formatCategoryBadge = (category: string) => {
  return category.replace(/_/g, " ");
};

export default function HomePage() {
  const [services, setServices] = useState<any[]>([]);
  const [modders, setModders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [servicesRes, moddersRes] = await Promise.all([
          api.listings.getAll().catch(() => []),
          api.modders.getAll().catch(() => []),
        ]);

        const servicesData = Array.isArray(servicesRes) ? servicesRes : [];
        const moddersData = Array.isArray(moddersRes) ? moddersRes : [];

        setServices(servicesData);

        // Deduplicate modders from database
        const modderMap = new Map();
        moddersData.forEach((item: any) => {
          if (item.modder && !modderMap.has(item.modder.id)) {
            modderMap.set(item.modder.id, {
              ...item.modder,
              specialty: item.title,
            });
          }
        });

        // Also add modders from services if not yet present
        servicesData.forEach((item: any) => {
          if (item.modder && !modderMap.has(item.modder.id)) {
            modderMap.set(item.modder.id, {
              ...item.modder,
              specialty: item.title,
            });
          }
        });

        setModders(Array.from(modderMap.values()));
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const switchModsCount = services.filter((s) => s.category === "SWITCH_MODS").length;
  const stabModsCount = services.filter((s) => s.category === "STABILIZER_MODS").length;
  const acousticCount = services.filter((s) => s.category === "CASE_AND_ACOUSTIC").length;
  const customCount = services.filter((s) => s.category === "CUSTOMIZATION_AESTHETICS").length;

  const categories = [
    {
      name: "Switch Mods & Lubing",
      count: switchModsCount,
      description: "Linear & tactile hand-lubing",
      image: "/images/lubing-swtiches.webp",
      link: "/services",
    },
    {
      name: "Stabilizer Tuning",
      count: stabModsCount,
      description: "Holee, wire balance, ticking fix",
      image: "/images/stabs.webp",
      link: "/services",
    },
    {
      name: "Acoustics & Foam",
      count: acousticCount,
      description: "Poron, case foam, tape mods",
      image: "/images/foam.jpg",
      link: "/services",
    },
    {
      name: "PCB Soldering & Repairs",
      count: customCount,
      description: "Mill-Max hotswap & trace fixes",
      image: "/images/repair-kb.png",
      link: "/services",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Full-Width Hero Section */}
      <div className="w-full relative h-[480px] bg-gradient-to-r from-brand-navy/90 to-brand-navy/70 flex items-center border-b-2 border-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: `url('/images/hero.jpg')`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white w-full">
          <span className="inline-block px-3 py-1 bg-brand-terracotta text-white font-mono text-xs uppercase font-bold tracking-wider mb-4 border-2 border-slate-900">
            [ 100% ESCROW PROTECTED WORKBENCH ]
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Find Verified Keyboard Modders &
            <span className="block">Escrow-Protected Services</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 font-medium">
            Connect with skilled Indonesian modders. Your funds stay locked in escrow until you verify the audio sound test and feel.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services"
              className="px-6 py-3.5 bg-brand-terracotta hover:bg-opacity-90 text-white font-mono font-bold text-xs uppercase tracking-wider border-2 border-slate-900 shadow-xs transition-transform active:scale-95"
            >
              Explore Modding Services →
            </Link>
            <Link
              href="/modders"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider border-2 border-slate-900 shadow-xs transition-transform active:scale-95"
            >
              Browse Modder Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Browse by Category */}
        <div className="text-center mb-16 pt-12">
          <h2 className="text-2xl font-bold text-brand-textMain mb-2">Browse by Category</h2>
          <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mb-8">
            Specialized Keyboard Modding Disciplines
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.link}
                className="bg-brand-sidebar border-2 border-slate-900 p-5 flex flex-col items-center group cursor-pointer hover:border-brand-navy hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 bg-brand-lightBg border-2 border-slate-800 flex items-center justify-center group-hover:border-brand-navy transition-colors mb-4 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="text-sm font-bold text-brand-textMain group-hover:text-brand-navy text-center mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-brand-textMuted text-center font-mono">
                  ({category.count} live service{category.count === 1 ? "" : "s"})
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 2: Top Rated Modders Near You (From Database) */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-brand-textMain">Top Rated Modders</h2>
              <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted">
                Skilled craftsmen verified in the SwitchLab network
              </p>
            </div>
            <Link
              href="/modders"
              className="font-mono text-xs font-bold uppercase tracking-wider text-brand-navy hover:underline"
            >
              View all modders →
            </Link>
          </div>

          {loading ? (
            <div className="bg-brand-sidebar border-2 border-slate-900 p-8 text-center font-mono text-xs text-brand-textMuted uppercase">
              Loading verified modders from database...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {modders.map((modder) => (
                <div
                  key={modder.id || modder.name}
                  className="bg-brand-sidebar border-2 border-slate-900 p-6 hover:shadow-lg transition-all hover:border-brand-navy group flex flex-col justify-between"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-navy border-2 border-slate-900 mx-auto mb-4 flex items-center justify-center text-white font-black font-mono text-xl">
                      {modder.name?.charAt(0) || "M"}
                    </div>
                    <h3 className="font-bold text-brand-textMain group-hover:text-brand-navy transition-colors">
                      @{modder.name}
                    </h3>
                    <p className="text-xs font-mono text-brand-textMuted mb-1">
                      📍 {modder.locationCity || "Indonesia"}
                    </p>
                    <p className="text-xs text-brand-terracotta font-semibold mb-3">
                      {modder.specialty || "Keyboard Modder Specialist"}
                    </p>
                    <div className="flex items-center justify-center gap-1 font-mono text-xs border-t border-slate-200 pt-3">
                      <span className="text-yellow-500">★</span>
                      <span className="font-bold text-slate-800">{modder.avgRating || 4.9}</span>
                      <span className="text-brand-textMuted font-mono">/ 5.0</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Link href="/modders" className="block w-full">
                      <Button variant="secondary" isLoading={false} className="w-full text-xs">
                        View Studio Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Popular Modding Services (From Database) */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-brand-textMain">Popular Modding Services</h2>
              <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted">
                Professional keyboard modification services in database
              </p>
            </div>
            <Link
              href="/services"
              className="font-mono text-xs font-bold uppercase tracking-wider text-brand-navy hover:underline"
            >
              View catalog →
            </Link>
          </div>

          {loading ? (
            <div className="bg-brand-sidebar border-2 border-slate-900 p-8 text-center font-mono text-xs text-brand-textMuted uppercase">
              Loading services from database...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between"
                >
                  <div>
                    <div className="p-4 pb-2">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy">
                        [ {formatCategoryBadge(service.category)} ]
                      </span>
                    </div>

                    <div className="px-4 pb-2">
                      <div className="h-36 bg-brand-lightBg overflow-hidden border border-slate-300">
                        <img
                          src={service.imageUrl || getCategoryFallbackImage(service.category)}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>

                    <div className="p-4 pt-2">
                      <h3 className="font-bold text-base text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs font-mono text-brand-textMuted mb-3">
                        by @{service.modder?.name || "VerifiedModder"} (📍 {service.modder?.locationCity})
                      </p>
                      <p className="text-lg font-mono font-bold text-brand-navy mb-4">
                        Rp {service.basePrice.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-brand-textMuted">
                          {service.category === "SWITCH_MODS" ? "/ switch" : "/ board"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link href={`/service/${service.id}`} className="block w-full">
                      <Button variant="primary" isLoading={false} className="w-full">
                        Book Service →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}