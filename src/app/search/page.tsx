"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

interface MarketplaceItem {
  id: string;
  type: "service" | "portfolio";
  title: string;
  description: string;
  provider: string;
  rating: number;
  pricing: string;
  badge: string;
  badgeColor: string;
  image: string;
  buttonText: string;
  link: string;
  locationCity: string;
}

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

type FilterType = "all" | "services" | "portfolios";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (e) {}

    async function loadMarketplaceData() {
      try {
        setLoading(true);
        const [servicesRes, moddersRes] = await Promise.all([
          api.listings.getAll().catch(() => []),
          api.modders.getAll().catch(() => []),
        ]);

        const servicesData = Array.isArray(servicesRes) ? servicesRes : [];
        const moddersData = Array.isArray(moddersRes) ? moddersRes : [];

        // Map live services
        const serviceItems: MarketplaceItem[] = servicesData.map((s: any) => ({
          id: s.id,
          type: "service",
          title: s.title,
          description: s.description,
          provider: `@${s.modder?.name || "Modder"}`,
          rating: s.modder?.avgRating || 4.9,
          pricing: `Rp ${s.basePrice.toLocaleString()} ${s.category === "SWITCH_MODS" ? "/ switch" : "/ board"}`,
          badge: s.category.replace(/_/g, " "),
          badgeColor: "bg-brand-lightBg text-brand-navy border-brand-navy",
          image: getCategoryFallbackImage(s.category),
          buttonText: "Book Service (Escrow)",
          link: `/service/${s.id}`,
          locationCity: s.modder?.locationCity || "Indonesia",
        }));

        // Map live portfolio builds
        const portfolioItems: MarketplaceItem[] = moddersData.map((p: any, idx: number) => ({
          id: p.id,
          type: "portfolio",
          title: p.title,
          description: p.description,
          provider: `@${p.modder?.name || "Modder"}`,
          rating: p.modder?.avgRating || 4.9,
          pricing: "Custom Workbench Build",
          badge: "PORTFOLIO BUILD",
          badgeColor: "bg-green-50 text-green-700 border-green-600",
          image: `/images/${idx % 2 === 0 ? "lubing-swtiches.webp" : "stabs.webp"}`,
          buttonText: "View Modder Studio",
          link: `/modders`,
          locationCity: p.modder?.locationCity || "Indonesia",
        }));

        setItems([...serviceItems, ...portfolioItems]);
      } catch (err) {
        console.error("Failed to load marketplace items:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMarketplaceData();
  }, []);

  const filteredResults = items.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "services" && item.type === "service") ||
      (activeFilter === "portfolios" && item.type === "portfolio");

    const query = searchInput.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.locationCity.toLowerCase().includes(query);

    return matchesFilter && matchesQuery;
  });

  const totalServices = items.filter((i) => i.type === "service").length;
  const totalPortfolios = items.filter((i) => i.type === "portfolio").length;

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ LIVE DATABASE MARKETPLACE ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Marketplace & Catalog Search
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Verified Modding Services • Custom Workbench Builds • Escrow Protected
              </p>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Catalog Items</div>
                <div className="text-xl font-mono font-bold text-brand-navy">{items.length} Live</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Active Modders</div>
                <div className="text-xl font-mono font-bold text-brand-navy">
                  {new Set(items.map((i) => i.provider)).size} Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modder Quick Callout Banner */}
        {currentUser && (currentUser.role === "MODDER" || currentUser.role === "ADMIN") && (
          <div className="bg-amber-50 border-2 border-slate-900 mb-8 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛠️</span>
              <div>
                <span className="font-mono text-xs font-bold uppercase text-amber-950 block">
                  Modder Studio Marketplace • Sell Your Services & Custom Builds
                </span>
                <p className="text-[11px] font-mono text-amber-800">
                  You are signed in as verified modder @{currentUser.name}. Publish your tuning packages or artisan builds to reach buyers nationwide.
                </p>
              </div>
            </div>
            <Link href="/modder/create-listing">
              <Button variant="primary" className="text-xs uppercase font-bold shrink-0">
                ➕ Create Listing / Sell →
              </Button>
            </Link>
          </div>
        )}

        {/* Search Bar Container */}
        <div className="max-w-2xl mb-8">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Search services, builds, modder names, cities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-5 py-3.5 pr-28 text-sm border-2 border-slate-900 focus:border-brand-navy focus:outline-none bg-white text-brand-textMain placeholder:text-brand-textMuted font-mono"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-24 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-800"
              >
                CLEAR
              </button>
            )}
            <button
              type="button"
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-brand-navy text-white px-5 py-2 hover:bg-[#132856] transition-colors font-mono font-bold text-xs uppercase tracking-wider border-2 border-brand-navy"
            >
              Search
            </button>
          </div>
        </div>

        {/* Segmented Control / Tab Filter */}
        <div className="mb-8">
          <div className="inline-flex flex-wrap bg-brand-sidebar border-2 border-slate-900 p-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                activeFilter === "all"
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "text-brand-textMuted border-transparent hover:text-brand-textMain"
              }`}
            >
              All Results ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter("services")}
              className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                activeFilter === "services"
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "text-brand-textMuted border-transparent hover:text-brand-textMain"
              }`}
            >
              Modding Services ({totalServices})
            </button>
            <button
              onClick={() => setActiveFilter("portfolios")}
              className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                activeFilter === "portfolios"
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "text-brand-textMuted border-transparent hover:text-brand-textMain"
              }`}
            >
              Workbench Builds ({totalPortfolios})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-8">
            <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
            <h2 className="text-base font-mono font-bold text-brand-textMain uppercase">
              Searching database catalog...
            </h2>
          </div>
        )}

        {/* Results Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between"
              >
                {/* Top Section */}
                <div>
                  <div className="p-4 pb-2 flex justify-between items-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 ${item.badgeColor}`}
                    >
                      [ {item.badge} ]
                    </span>
                    <span className="text-xs font-mono text-brand-textMuted">
                      📍 {item.locationCity}
                    </span>
                  </div>

                  <div className="px-4 pb-2">
                    <div className="h-36 bg-brand-lightBg overflow-hidden border border-slate-300">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="p-4 pt-2">
                    <h3 className="font-bold text-base text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brand-textMuted mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-xs font-mono text-brand-textMuted mb-3">
                      by <span className="font-semibold text-brand-navy">{item.provider}</span> ({item.rating}★)
                    </p>
                    <p className="text-lg font-mono font-bold text-brand-navy mb-4">
                      {item.pricing}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link href={item.link} className="block w-full">
                    <Button variant="primary" isLoading={false} className="w-full">
                      {item.buttonText} →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredResults.length === 0 && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-8">
            <p className="text-brand-textMuted text-lg mb-4 font-mono uppercase">
              No matching database items found {searchInput ? `for "${searchInput}"` : ""}.
            </p>
            <Button
              variant="secondary"
              isLoading={false}
              onClick={() => {
                setSearchInput("");
                setActiveFilter("all");
              }}
              className="inline-block w-auto"
            >
              Clear Search & Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}